package org.jose.backend.controller;

import org.jose.backend.dto.Post.ReaccionResumenResponse;
import org.jose.backend.dto.Post.SetReaccionRequest;
import org.jose.backend.model.Reaccion;
import org.jose.backend.services.PostReaccionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}")
public class PostReaccionController {

    private final PostReaccionService prService;

    public PostReaccionController(PostReaccionService prService) {
        this.prService = prService;
    }

    @GetMapping("/reactions")
    public ResponseEntity<ReaccionResumenResponse> getReacciones(@PathVariable Long postId) {
        return ResponseEntity.ok(prService.getReacciones(postId));
    }

    @PostMapping("/reactions")
    public ResponseEntity<ReaccionResumenResponse> setReaccion(
            @PathVariable Long postId,
            @RequestBody(required = false) SetReaccionRequest body
    ) {
        Reaccion tipo = (body != null) ? body.getType() : null;
        return ResponseEntity.ok(prService.setReaccion(postId, tipo));
    }
}
