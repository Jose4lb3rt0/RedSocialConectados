package org.jose.backend.controller;

import org.jose.backend.dto.PostComment.CreatePostCommentRequest;
import org.jose.backend.dto.PostComment.PostCommentResponse;
import org.jose.backend.dto.PostComment.UpdatePostCommentRequest;
import org.jose.backend.services.PostComentarioService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api")
public class PostComentarioController {
    private final PostComentarioService postComentarioService;
    public PostComentarioController(PostComentarioService postComentarioService) {
        this.postComentarioService = postComentarioService;
    }

    // CREATE JSON: solo permite texto y sin imagen
    @PostMapping(path = "/posts/{postId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostCommentResponse> createJson(@PathVariable Long postId, @RequestBody CreatePostCommentRequest request) throws IOException {
        return ResponseEntity.ok(postComentarioService.create(postId, request, null));
    }

    // CREATE MULTIPART: para subir texto pero tambien la imagen
    @PostMapping(
            path = "/posts/{postId}/comments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<PostCommentResponse> createMultipart(
            @PathVariable Long postId,
            @RequestPart(value = "comment", required = false) String comment,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        CreatePostCommentRequest req = new CreatePostCommentRequest();
        req.setComment(comment);
        return ResponseEntity.ok(postComentarioService.create(postId, req, file));
    }

    // UPDATE JSON
    @PatchMapping(path = "/comments/{commentId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostCommentResponse> updateJson(@PathVariable Long commentId, @RequestBody UpdatePostCommentRequest request) throws IOException, AccessDeniedException {
        return ResponseEntity.ok(postComentarioService.update(commentId, request, null));
    }

    // UPDATE MULTIPART
    @PatchMapping(path = "/comments/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostCommentResponse> updateMultipart(
            @PathVariable Long commentId,
            @RequestPart(value = "comment", required = false) String comment,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "removeMedia", required = false) Boolean removeMedia
    ) throws IOException, AccessDeniedException {
        UpdatePostCommentRequest req = new UpdatePostCommentRequest();
        req.setComment(comment);
        req.setRemoveMedia(Boolean.TRUE.equals(removeMedia));
        return ResponseEntity.ok(postComentarioService.update(commentId, req, file));
    }

    @GetMapping(path = "/comments/{commentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostCommentResponse> getOne(@PathVariable Long commentId) {
        return ResponseEntity.ok(postComentarioService.get(commentId));
    }

    @GetMapping(path = "/posts/{postId}/comments", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<PostCommentResponse>> listByPost(@PathVariable Long postId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postComentarioService.listByPost(postId, page, size));
    }

    @DeleteMapping(path = "/comments/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId) throws AccessDeniedException, IOException {
        postComentarioService.delete(commentId);
        return ResponseEntity.noContent().build();
    }
}
