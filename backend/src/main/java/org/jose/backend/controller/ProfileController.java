package org.jose.backend.controller;

import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.dto.Profile.EditProfileRequest;
import org.jose.backend.dto.Profile.UserProfileResponse;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.SolicitudAmistadRepository;
import org.jose.backend.security.JwtTokenUtil;
import org.jose.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private JwtTokenUtil jwtTokenUtil;
    @Autowired private SolicitudAmistadRepository solicitudAmistadRepository;

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String auth) {
        String email = extractEmailFromToken(auth);
        Usuario usuario = usuarioService.getUsuarioPorEmail(email);

        Map<String, Object> body = new HashMap<>();
        body.put("id", usuario.getId());
        body.put("email", usuario.getEmail());
        body.put("name", usuario.getName());
        body.put("surname", usuario.getSurname());
        body.put("slug", usuario.getSlug());
        if (usuario.getProfilePicture() != null) {
            body.put("profilePicture", usuario.getProfilePicture());
        }
        return ResponseEntity.ok(body);

        /*return ResponseEntity.ok(Map.of(
            "id", usuario.getId(),
            "email", usuario.getEmail(),
            "name", usuario.getName(),
            "surname", usuario.getSurname(),
            "profilePicture", usuario.getProfilePicture()
        ));*/
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<UserProfileResponse> getProfileBySlug(@PathVariable String slug) throws IOException {
        return ResponseEntity.ok(usuarioService.getProfileBySlug(slug));
    }

    @GetMapping("/slug/{slug}/friends-count")
    public ResponseEntity<Long> getFriendsCount(@PathVariable String slug) {
        Usuario usuario = usuarioService.getUsuarioPorSlug(slug);
        long count = solicitudAmistadRepository.countAmigos(usuario.getId());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/slug/{slug}/amigos")
    public ResponseEntity<Page<UserSummaryResponse>> getAmigos(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        Usuario usuario = usuarioService.getUsuarioPorSlug(slug);
        Page<UserSummaryResponse> amigos = solicitudAmistadRepository
                .findAmigos(usuario.getId(), PageRequest.of(page, size))
                .map(s -> {
                    Usuario amigo = s.getSolicitante().getId().equals(usuario.getId())
                            ? s.getDestinatario()
                            : s.getSolicitante();
                    UserSummaryResponse dto = new UserSummaryResponse();
                    dto.setId(amigo.getId());
                    dto.setAuthorName(amigo.getName());
                    dto.setAuthorSurname(amigo.getSurname());
                    dto.setAuthorSlug(amigo.getSlug());
                    dto.setAuthorPhoto(amigo.getProfilePicture() != null ? amigo.getProfilePicture().getImagenUrl() : null);
                    return dto;
                });
        return ResponseEntity.ok(amigos);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile( @RequestHeader("Authorization") String auth) {
        String email = extractEmailFromToken(auth);
        return ResponseEntity.ok(usuarioService.getUsuarioPerfil(email));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
        @RequestHeader("Authorization") String auth,
        @RequestBody EditProfileRequest req) {
        String email = extractEmailFromToken(auth);
        return ResponseEntity.ok(usuarioService.actualizarPerfil(email, req));
    }

    @PatchMapping("/me/profile-picture")
    public ResponseEntity<UserProfileResponse> updateProfilePicture(
        @RequestHeader("Authorization") String auth,
        @RequestParam("file") MultipartFile file) throws IOException {
        String email = extractEmailFromToken(auth);
        return ResponseEntity.ok(usuarioService.actualizarFotoPerfil(email, file));
    }

    @PatchMapping("/me/banner-picture")
    public ResponseEntity<UserProfileResponse> updateProfileBanner(
            @RequestHeader("Authorization") String auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        String email = extractEmailFromToken(auth);
        return ResponseEntity.ok(usuarioService.actualizarFotoPortada(email, file));
    }

    private String extractEmailFromToken(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) throw new RuntimeException("Falta token");
        String token = auth.substring(7);
        if (!jwtTokenUtil.validarToken(token)) throw new RuntimeException("Token inválido");
        return jwtTokenUtil.extraerUsuarioDelToken(token);
    }
}
