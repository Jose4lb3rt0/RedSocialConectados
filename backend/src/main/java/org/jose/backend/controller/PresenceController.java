package org.jose.backend.controller;

import org.jose.backend.model.Usuario;
import org.jose.backend.repository.SolicitudAmistadRepository;
import org.jose.backend.services.CurrentUserService;
import org.jose.backend.services.PresenceService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {
    private final PresenceService presenceService;
    private final CurrentUserService currentUserService;
    private final SolicitudAmistadRepository solicitudAmistadRepository;

    public PresenceController(PresenceService presenceService, CurrentUserService currentUserService, SolicitudAmistadRepository solicitudAmistadRepository) {
        this.presenceService = presenceService;
        this.currentUserService = currentUserService;
        this.solicitudAmistadRepository = solicitudAmistadRepository;
    }

    @GetMapping("/amigos")
    public ResponseEntity<List<String>> amigosConectados() {
        Usuario me = currentUserService.getUser();

        List<String> conectados = solicitudAmistadRepository
            .findAmigos(me.getId(), Pageable.unpaged())
            .stream()
            .map(s -> s.getSolicitante().getId().equals(me.getId())
                    ? s.getDestinatario().getEmail()
                    : s.getSolicitante().getEmail())
            .filter(presenceService::estaConectado)
            .toList();

        return ResponseEntity.ok(conectados);
    }
}
