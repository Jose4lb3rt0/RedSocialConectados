package org.jose.backend.services;

import org.jose.backend.dto.PostComment.CreatePostCommentRequest;
import org.jose.backend.dto.PostComment.PostCommentResponse;
import org.jose.backend.dto.PostComment.UpdatePostCommentRequest;
import org.jose.backend.model.Imagen;
import org.jose.backend.model.Post;
import org.jose.backend.model.PostComentario;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.PostComentarioRepository;
import org.jose.backend.repository.PostRepository;
import org.jose.backend.repository.UsuarioRepository;
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
import java.util.Optional;

@Service
public class PostComentarioServiceImpl implements PostComentarioService {

    @Autowired private PostComentarioRepository postComentarioRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ImagenService imagenService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) throw new IllegalStateException("No hay usuario autenticado.");
        return auth.getName();
    }

    private PostCommentResponse toResp(PostComentario c) {
        PostCommentResponse resp = new PostCommentResponse();
        resp.setId(c.getId());
        resp.setPostId(c.getPost().getId()); 
        resp.setAuthorId(c.getAuthor().getId());
        resp.setAuthorName(c.getAuthor().getName() + " " + c.getAuthor().getSurname());
        resp.setAuthorSlug(c.getAuthor().getSlug());
        if (c.getAuthor().getProfilePicture() != null) {
            resp.setAuthorPhotoUrl(c.getAuthor().getProfilePicture().getImagenUrl());
        }
        resp.setComment(c.getComment());
        resp.setMediaUrl(c.getMediaUrl());
        resp.setCreatedAt(c.getCreatedAt());
        resp.setUpdatedAt(c.getUpdatedAt());
        resp.setEdited(c.isEdited());
        return resp;
    }

    @Override
    @Transactional
    public PostCommentResponse create(Long postId, CreatePostCommentRequest request, MultipartFile file) throws IOException {
        String email = getCurrentUserEmail();
        Usuario author = usuarioRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado."));
        String comment = request != null && request.getComment() != null ? request.getComment() : "";

        boolean hasText = !comment.isBlank();
        boolean hasFile = file != null && !file.isEmpty();

        if (!hasText && !hasFile) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe incluir texto o imagen.");
        }

        PostComentario nuevoComentario = new PostComentario();
        nuevoComentario.setAuthor(author);
        nuevoComentario.setPost(post);
        nuevoComentario.setComment(comment);

        if (hasFile) {
            Imagen img = imagenService.uploadImagen(file);
            nuevoComentario.setImagen(img);
        }

        return toResp(postComentarioRepository.save(nuevoComentario));
    }

    @Override
    @Transactional
    public PostCommentResponse update(Long commentId, UpdatePostCommentRequest request, MultipartFile file) throws IOException, AccessDeniedException {
        String email = getCurrentUserEmail();
        PostComentario c = postComentarioRepository.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado"));

        if (!c.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor");

        boolean changed = false;

        if (request != null && request.getComment() != null) {
            String text = request.getComment().trim();
            c.setComment(text.isBlank() ? null : text);
            changed = true;
        }

        if (Boolean.TRUE.equals(request != null ? request.getRemoveMedia() : null)) {
            if (c.getImagen() != null) {
                imagenService.deleteImagen(c.getImagen());
                c.setImagen(null);
                changed = true;
            }
        }

        if (!changed) {
            return toResp(c);
        }

        c.setEdited(true);
        return toResp(postComentarioRepository.save(c));
    }

    @Override
    @Transactional
    public PostCommentResponse get(Long commentId) {
        PostComentario c = postComentarioRepository.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado"));
        return toResp(c);
    }

    @Override
    @Transactional
    public Page<PostCommentResponse> listByPost(Long postId, int page, int size) {
        return postComentarioRepository.findByPostIdOrderByCreatedAtDesc(postId, PageRequest.of(page, size)).map(this::toResp);
    }

    @Override
    @Transactional
    public void delete(Long commentId) throws AccessDeniedException, IOException {
        String email = getCurrentUserEmail();
        PostComentario c = postComentarioRepository.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado"));

        if (!c.getAuthor().getEmail().equals(email)) throw new AccessDeniedException("No eres el autor.");

        if (c.getImagen() != null) {
            imagenService.deleteImagen(c.getImagen());
            c.setImagen(null);
        }
        postComentarioRepository.delete(c);
    }
}
