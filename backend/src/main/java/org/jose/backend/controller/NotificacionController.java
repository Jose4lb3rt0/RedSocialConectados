package org.jose.backend.controller;

import org.jose.backend.dto.Notificacion.NotificacionResponse;
import org.jose.backend.services.NotificacionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public ResponseEntity<Page<NotificacionResponse>> listar(Pageable pageable) {
        return ResponseEntity.ok(notificacionService.listarNotificaciones(pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> contarNoLeidas() {
        return ResponseEntity.ok(notificacionService.contarNoLeidas());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> marcarComoLeida(@PathVariable Long id) {
        notificacionService.marcarComoLeida(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> marcarTodasComoLeidas() {
        notificacionService.marcarTodasComoLeidas();
        return ResponseEntity.noContent().build();
    }
}

