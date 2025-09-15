package org.jose.backend.services;

import org.jose.backend.dto.Post.CreatePostRequest;
import org.jose.backend.dto.Post.PostResponse;
import org.jose.backend.dto.Post.UpdatePostRequest;
import org.jose.backend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

public interface PostService {
    PostResponse create(CreatePostRequest request, MultipartFile file) throws IOException;
    Page<PostResponse> feed(int page, int size);
    Page<PostResponse> userPosts(Long userId, int page, int size);
    PostResponse update(Long postId, UpdatePostRequest request) throws IOException;
    PostResponse getPost(Long postId); // nuevo
    void delete(Long postId) throws IOException;
}
