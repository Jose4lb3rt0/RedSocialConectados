package org.jose.backend.controller;

import jakarta.validation.Valid;
import org.jose.backend.dto.CreatePostRequest;
import org.jose.backend.dto.PostResponse;
import org.jose.backend.dto.UpdatePostRequest;
import org.jose.backend.model.Imagen;
import org.jose.backend.model.Post;
import org.jose.backend.services.ImagenService;
import org.jose.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired private PostService postService;
    @Autowired private ImagenService imagenService;

   @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostResponse> create(
        //@Valid @RequestBody Post req //@RequestHeader("Authorization") String auth, @Valid @RequestBody CreatePostRequest request
        @RequestPart("content") String content,
        @RequestPart(value = "file", required = false) MultipartFile file,
        @RequestPart(value = "type", required = false) String type
    ) throws IOException {
        Post post = new Post();

        if (!content.isBlank()) post.setContent(content);
        if (type.isBlank()) { post.setType("text"); } else { post.setType(type); }
        if (file != null) {
            Imagen imagen = imagenService.uploadImagen(file);
            post.setMediaUrl(imagen.getImagenUrl());
        }
        return ResponseEntity.ok(postService.create(post));
        //return ResponseEntity.ok(postService.create(content, file)); //el service ya esta interferido por la autenticación por securitycontexto
        //return ResponseEntity.ok(postService.create(auth, request));
    }

    @GetMapping("/feed")
    public Page<PostResponse> feed(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return postService.feed(page, size);
    }

    @GetMapping("/user/{userId}")
    public Page<PostResponse> userPosts(@PathVariable Long userId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        return postService.userPosts(userId, page, size);
    }

    @PatchMapping("/{postId}")
    public PostResponse update(/*@RequestHeader("Authorization") String auth,*/
                               @PathVariable Long postId,
                               @Valid @RequestBody UpdatePostRequest req) throws AccessDeniedException {
        return postService.update(/*auth,*/ postId, req);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(/*@RequestHeader("Authorization") String auth,*/
                                       @PathVariable Long postId) throws AccessDeniedException {
        postService.delete(/*auth, */postId);
        return ResponseEntity.noContent().build();
    }
}
