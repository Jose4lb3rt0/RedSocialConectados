package org.jose.backend.controller;

import org.jose.backend.dto.Friends.FriendRequestDto;
import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.services.AmistadService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
public class AmistadController {

    private final AmistadService amistadService;

    public AmistadController(AmistadService amistadService) {
        this.amistadService = amistadService;
    }

    @PostMapping("/requests")
    public ResponseEntity<FriendRequestDto> enviar(@RequestParam Long toUserId) {
        return ResponseEntity.ok(amistadService.enviarSolicitud(toUserId));
    }

    @PostMapping("/requests/{id}/cancel")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        amistadService.cancelarSolicitud(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests/{id}/accept")
    public ResponseEntity<FriendRequestDto> aceptar(@PathVariable Long id) {
        return ResponseEntity.ok(amistadService.aceptarSolicitud(id));
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<Void> rechazar(@PathVariable Long id) {
        amistadService.rechazarSolicitud(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/requests/inbox")
    public ResponseEntity<Page<FriendRequestDto>> inbox(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(amistadService.inbox(page, size));
    }

    @GetMapping("/requests/outbox")
    public ResponseEntity<Page<FriendRequestDto>> outbox(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(amistadService.outbox(page, size));
    }

    @GetMapping
    public ResponseEntity<Page<UserSummaryResponse>> amigos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(amistadService.amigos(page, size));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Page<UserSummaryResponse>> sugerencias(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(amistadService.sugerencias(page, size));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long userId) {
        amistadService.eliminarAmigo(userId);
        return ResponseEntity.noContent().build();
    }
}
