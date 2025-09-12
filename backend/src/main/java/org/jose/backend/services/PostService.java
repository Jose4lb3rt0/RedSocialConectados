package org.jose.backend.services;

import org.jose.backend.dto.PostResponse;
import org.jose.backend.dto.UpdatePostRequest;
import org.jose.backend.model.Post;
import org.springframework.data.domain.Page;

import java.nio.file.AccessDeniedException;
import java.util.Optional;

public interface PostService {
    PostResponse create(Post post);
    Page<PostResponse> feed(int page, int size);
    Page<PostResponse> userPosts(Long userId, int page, int size);
    PostResponse update(Long postId, UpdatePostRequest request) throws AccessDeniedException;
    PostResponse getPost(Long postId); // nuevo
    void delete(Long postId) throws AccessDeniedException;
}
