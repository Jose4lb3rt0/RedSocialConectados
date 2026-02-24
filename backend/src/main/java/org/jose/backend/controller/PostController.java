package org.jose.backend.controller;

import org.jose.backend.dto.Post.CreatePostRequest;
import org.jose.backend.dto.Post.PostResponse;
import org.jose.backend.dto.Post.UpdatePostRequest;
import org.jose.backend.model.Imagen;
import org.jose.backend.model.Post;
import org.jose.backend.services.ImagenService;
import org.jose.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired private PostService postService;
    @Autowired private ImagenService imagenService;

   @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
   public ResponseEntity<PostResponse> create(
       @RequestPart(value = "content", required = false) String content,
       @RequestPart(value = "file", required = false) MultipartFile file,
       @RequestPart(value = "type", required = false) String type
   ) throws IOException {
       final String normalized = content == null ? "" : content.trim();
       if (normalized.isBlank() && (file == null || file.isEmpty())) {
           return ResponseEntity.badRequest().build();
       }

       CreatePostRequest post = new CreatePostRequest();
       post.setContent(normalized);
       post.setType((type == null || type.isBlank()) ? "text" : type);

       if (file != null && !file.isEmpty()) {
           Imagen imagen = imagenService.uploadImagen(file);
       }

       return ResponseEntity.ok(postService.create(post, file));
   }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> findPost(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPost(postId));
    }

    @GetMapping("/feed") //home
    public Page<PostResponse> feed(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        //return postService.feed(page, size);
        return postService.feedForCurrentUser(page, size);
    }

    @GetMapping("/user/{userId}") //perfil
    public Page<PostResponse> userPosts(@PathVariable Long userId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        return postService.userPosts(userId, page, size);
    }

    @PatchMapping(
            path = "/{postId}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostResponse> updateJson(
            @PathVariable Long postId,
            @RequestBody UpdatePostRequest req
    ) throws IOException {
        return ResponseEntity.ok(postService.update(postId, req));
    }

    @PatchMapping(
            path = "/{postId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostResponse> updateMultipart(
            @PathVariable Long postId,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "removeMedia", required = false) Boolean removeMedia
    ) throws IOException, AccessDeniedException {
        UpdatePostRequest req = new UpdatePostRequest();
        if (content != null) req.setContent(content);
        if (Boolean.TRUE.equals(removeMedia)) req.setRemoveMedia(true);

        if (file != null && !file.isEmpty()) {
            Imagen img = imagenService.uploadImagen(file);
            req.setMediaUrl(img.getImagenUrl());
        }

        return ResponseEntity.ok(postService.update(postId, req));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long postId) throws IOException {
        postService.delete(postId);
        return ResponseEntity.noContent().build();
    }
}
