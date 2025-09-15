package org.jose.backend.services;

import org.jose.backend.dto.Post.CreatePostRequest;
import org.jose.backend.dto.Post.PostResponse;
import org.jose.backend.dto.Post.UpdatePostRequest;
import org.jose.backend.model.Post;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.PostRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.time.Instant;

@Service
public class PostServiceImpl implements PostService {
    @Autowired private PostRepository postRepo;
    @Autowired private UsuarioRepository userRepo;
    @Autowired private JwtTokenUtil jwt;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private UsuarioRepository usuarioRepository;

    private PostResponse toResp(Post post) {
        PostResponse resp = new PostResponse();
        resp.setId(post.getId());
        resp.setAuthorId(post.getAuthor().getId());
        if (post.getAuthor().getProfilePicture() != null ) {
            resp.setAuthorPhotoUrl(post.getAuthor().getProfilePicture().getImagenUrl());
        }
        resp.setAuthorName(post.getAuthor().getName() + " " + post.getAuthor().getSurname());
        resp.setAuthorSlug(post.getAuthor().getSlug());
        resp.setContent(post.getContent());
        resp.setPostType(post.getType());
        resp.setMediaUrl(post.getMediaUrl());
        resp.setCreatedAt(post.getCreatedAt());
        resp.setUpdatedAt(post.getUpdatedAt());
        resp.setEdited(post.isEdited());
        return resp;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No hay usuario autenticado en el contexto.");
        }
        return auth.getName();
    }

    @Override
    @Transactional
    public PostResponse create(CreatePostRequest request) {
        String email = getCurrentUserEmail(); //String email = jwt.extraerUsuarioDelToken(bearer.replace("Bearer ", ""));
        Usuario author = usuarioRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        String content = request != null && request.getContent() != null ? request.getContent() : "";
        String file = request != null && request.getMediaUrl() != null ? request.getMediaUrl() : "";
        String type = request != null && request.getType() != null ? request.getType() : "";

        boolean hasText = !content.isBlank();
        boolean hasFile = file != null && !file.isEmpty();

        if (!hasText && !hasFile) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe incluir texto o imagen.");
        }

        Post p = new Post();
        p.setAuthor(author);
        p.setType(type);
        p.setContent(content);
        p.setMediaUrl(file);
        postRepo.save(p);
        return toResp(p);
    }

    @Override
    public PostResponse getPost(Long postId) {
        Post post = postRepo.findActiveById(postId).orElseThrow();
        return toResp(post);
    }

    @Override
    public Page<PostResponse> feed(int page, int size) {
        return postRepo.findFeed( PageRequest.of(page, size)).map(this::toResp);
    }

    @Override
    public Page<PostResponse> userPosts(Long userId, int page, int size) {
        return postRepo.findByAuthor(userId,  PageRequest.of(page, size)).map(this::toResp);
    }

    @Override
    public PostResponse update(Long postId, UpdatePostRequest request) throws AccessDeniedException {
        String email = getCurrentUserEmail();
        Post post = postRepo.findById(postId).orElseThrow();

        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor");
        if (request.getContent() != null) post.setContent(request.getContent().trim());
        if (Boolean.TRUE.equals(request.getRemoveMedia())) post.setMediaUrl(null);
        if (request.getMediaUrl() != null) post.setMediaUrl(request.getMediaUrl().trim());
        post.setEdited(true);
        post.setUpdatedAt(Instant.now());
        return toResp(postRepo.save(post));
    }

    @Override
    public void delete(Long postId) throws AccessDeniedException {
        String email = getCurrentUserEmail();
        Post post = postRepo.findById(postId).orElseThrow();
        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor.");
        post.setDeleted(true);
        postRepo.save(post);
    }
}
