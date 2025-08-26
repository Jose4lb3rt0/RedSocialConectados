package org.jose.backend.controller;

import org.jose.backend.dto.EditProfileRequest;
import org.jose.backend.dto.UserProfileResponse;
import org.jose.backend.model.Usuario;
import org.jose.backend.security.JwtTokenUtil;
import org.jose.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private JwtTokenUtil jwtTokenUtil;

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String auth) {
        String email = extractEmailFromToken(auth);
        Usuario usuario = usuarioService.getUsuarioPorEmail(email);
        return ResponseEntity.ok(Map.of(
            "id", usuario.getId(),
            "email", usuario.getEmail(),
            "name", usuario.getName(),
            "surname", usuario.getSurname(),
            "profilePicture", usuario.getProfilePicture()
        ));
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
