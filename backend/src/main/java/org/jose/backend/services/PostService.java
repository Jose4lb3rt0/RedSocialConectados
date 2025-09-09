package org.jose.backend.services;

import org.jose.backend.dto.CreatePostRequest;
import org.jose.backend.dto.PostResponse;
import org.jose.backend.dto.UpdatePostRequest;
import org.jose.backend.model.Post;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.PostRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.Instant;

@Service
public class PostService {
    @Autowired private PostRepository postRepo;
    @Autowired private UsuarioRepository userRepo;
    @Autowired private JwtTokenUtil jwt;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private JwtTokenUtil jwtTokenUtil;

    //se usa como dto
    private PostResponse toResp(Post post) {
        PostResponse resp = new PostResponse();
        resp.setId(post.getId());
        resp.setAuthorId(post.getAuthor().getId());
        resp.setAuthorPhotoUrl(post.getAuthor().getProfilePicture().getImagenUrl());
        resp.setAuthorName(post.getAuthor().getName() + " " + post.getAuthor().getSurname());
        resp.setContent(post.getContent());
        resp.setPostType(post.getType());
        resp.setMediaUrl(post.getMediaUrl());
        resp.setCreatedAt(post.getCreatedAt());
        resp.setUpdatedAt(post.getUpdatedAt());
        resp.setEdited(post.isEdited());
        return resp;
    }

    public PostResponse create(Post post) { //quite el String bearer
        String email = getCurrentUserEmail();
        //String email = jwt.extraerUsuarioDelToken(bearer.replace("Bearer ", ""));
        Usuario author = userRepo.findByEmail(email).orElseThrow();

        Post p = new Post();
        p.setAuthor(author);
        p.setType(post.getType());
        p.setContent(post.getContent().trim());
        p.setMediaUrl(post.getMediaUrl());
        postRepo.save(p);
        return toResp(p);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null | auth.getName() == null) {
            throw new IllegalStateException("No hay usuario autenticado en el contexto.");
        }
        return auth.getName();
    }

    public Page<PostResponse> feed(int page, int size) {
        return postRepo.findFeed( PageRequest.of(page, size)).map(this::toResp);
    }

    public Page<PostResponse> userPosts(Long userId, int page, int size) {
        return postRepo.findByAuthor(userId,  PageRequest.of(page, size)).map(this::toResp);
    }

    public PostResponse update(Long postId, UpdatePostRequest request) throws AccessDeniedException {
        String email = getCurrentUserEmail();
        //String email = jwt.extraerUsuarioDelToken(bearer.replace("Bearer ", ""));
        Post post = postRepo.findById(postId).orElseThrow();

        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor");

        post.setContent(request.getContent().trim());
        post.setEdited(true);
        post.setUpdatedAt(Instant.now());
        return toResp(postRepo.save(post));
    }

    public void delete(Long postId) throws AccessDeniedException {
        String email = getCurrentUserEmail();
        //String email = jwt.extraerUsuarioDelToken(bearer.replace("Bearer ", ""));
        Post post = postRepo.findById(postId).orElseThrow();
        if (!post.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor.");
        post.setDeleted(true);
        postRepo.save(post);
    }
}
