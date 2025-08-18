package org.jose.backend.controller;

import jakarta.validation.Valid;
import org.jose.backend.dto.CreatePostRequest;
import org.jose.backend.dto.PostResponse;
import org.jose.backend.dto.UpdatePostRequest;
import org.jose.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired private PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> create(
        @Valid @RequestBody CreatePostRequest req
        //@RequestHeader("Authorization") String auth,
        //@Valid @RequestBody CreatePostRequest request
    ) {
        return ResponseEntity.ok(postService.create(req)); //el service ya esta interferido por la autenticación por securitycontexto
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
