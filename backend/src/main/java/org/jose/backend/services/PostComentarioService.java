package org.jose.backend.services;

import org.jose.backend.dto.PostComment.CreatePostCommentRequest;
import org.jose.backend.dto.PostComment.PostCommentResponse;
import org.jose.backend.dto.PostComment.UpdatePostCommentRequest;
import org.jose.backend.model.PostComentario;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

public interface PostComentarioService {
    PostCommentResponse create(Long postId, CreatePostCommentRequest request, MultipartFile file) throws IOException;
    PostCommentResponse update(Long commentId, UpdatePostCommentRequest request, MultipartFile file) throws IOException, AccessDeniedException;
    PostCommentResponse get(Long commentId);
    Page<PostCommentResponse> listByPost(Long postId, int page, int size);
    void delete(Long commentId) throws AccessDeniedException, IOException;
}
