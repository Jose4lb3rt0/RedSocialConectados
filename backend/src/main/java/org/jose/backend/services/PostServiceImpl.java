package org.jose.backend.services;

import org.jose.backend.dto.Post.CreatePostRequest;
import org.jose.backend.dto.Post.PostResponse;
import org.jose.backend.dto.Post.UpdatePostRequest;
import org.jose.backend.model.Imagen;
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

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.Instant;

@Service
public class PostServiceImpl implements PostService {

    @Autowired private PostRepository postRepo;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ImagenService imagenService;
    @Autowired private CurrentUserService currentUserService;

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

    @Override
    @Transactional
    public PostResponse create(CreatePostRequest request, MultipartFile file) throws IOException {
        Usuario author = currentUserService.getUser();
        String content = request != null && request.getContent() != null ? request.getContent() : "";
        String type = request != null && request.getType() != null ? request.getType() : "";
        boolean hasText = !content.isBlank();
        boolean hasFile = file != null && !file.isEmpty();
        if (!hasText && !hasFile) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe incluir texto o imagen.");

        Post p = new Post();
        p.setAuthor(author);
        p.setType(type);
        p.setContent(content);
        if (hasFile) {
            Imagen img = imagenService.uploadImagen(file);
            p.setImagen(img);
        }
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
    @Transactional
    public PostResponse update(Long postId, UpdatePostRequest request) throws IOException {
        String email = currentUserService.getEmail();
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));
        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor");

        boolean changed = false;

        if (request != null && request.getContent() != null) {
            String content = request.getContent().trim();
            post.setContent(content.isBlank() ? null : content);
            changed = true;
        }

        if (Boolean.TRUE.equals(request != null ? request.getRemoveMedia() : null)) {
            if (post.getImagen() != null) {
                imagenService.deleteImagen(post.getImagen());
                post.setImagen(null);
                changed = true;
            }
        }

        if (!changed) {
            return toResp(post);
        }

        post.setEdited(true);
        post.setUpdatedAt(Instant.now());
        return toResp(postRepo.save(post));
    }

    @Override
    public void delete(Long postId) throws IOException {
        String email = currentUserService.getEmail();
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));
        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor.");

        if (post.getImagen() != null) {
            imagenService.deleteImagen(post.getImagen());
            post.setImagen(null);
        }

        post.setDeleted(true);
        postRepo.save(post);
    }
}
