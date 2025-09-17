package org.jose.backend.controller;

import jakarta.validation.Valid;
import org.jose.backend.dto.Auth.LoginRequest;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.security.JwtTokenUtil;
import org.jose.backend.services.ImagenService;
import org.jose.backend.services.SlugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    private ImagenService imagenService;
    @Autowired private SlugService slugService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            //return new ResponseEntity<>("El correo electrónico ya está en uso, por favor intente con otro.", HttpStatus.BAD_REQUEST);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "El correo electrónico ya está en uso, por favor intente con otro."));
        }


        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        if (usuario.getSlug() == null || usuario.getSlug().isBlank()) {
            usuario.setSlug(slugService.generate(usuario.getName(), usuario.getSurname()));
        }

        usuarioRepository.save(usuario);
        String token = jwtTokenUtil.generarToken(usuario);
        return ResponseEntity.ok(Map.of("token", token)); //return new ResponseEntity<>("Usuario registrado", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());
        if (usuarioOpt.isEmpty() ||
            !passwordEncoder.matches(
                loginRequest.getPassword(),
                usuarioOpt.get().getPassword())
        ){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();
        String token = jwtTokenUtil.generarToken(usuario);

        return ResponseEntity.ok(Map.of("token", token));
    }

    /*@GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String auth) {
        String token = auth.replace("Bearer ", "");

        if (!jwtTokenUtil.validarToken(token)) {
            return ResponseEntity.status(401).build();
        }

        String email = jwtTokenUtil.extraerUsuarioDelToken(token);
        Usuario user = usuarioRepository.findByEmail(email).orElse(null);

        if (user == null) { return ResponseEntity.status(404).build(); }

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "name", user.getName(),
            "surname", user.getSurname()
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@RequestHeader("Authorization") String auth) {
        String token = auth.replace("Bearer ", "");

        if (!jwtTokenUtil.validarToken(token)) {
            return ResponseEntity.status(401).build();
        }

        String email = jwtTokenUtil.extraerUsuarioDelToken(token);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        assert usuario != null;
        UserProfileResponse response = new UserProfileResponse(
                usuario.getProfilePicture(),
                usuario.getBannerPicture(),
                usuario.getName(),
                usuario.getSurname(),
                usuario.getGender(),
                usuario.getBiography(),
                usuario.getDayOfBirth(),
                usuario.getMonthOfBirth(),
                usuario.getYearOfBirth()
        );

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestHeader("Authorization") String auth,
                                                             @RequestBody EditProfileRequest req) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body((UserProfileResponse) Map.of("message", "Falta token"));
        }

        String token = auth.substring(7);
        if (!jwtTokenUtil.validarToken(token)) {
            return ResponseEntity.status(401).body((UserProfileResponse) Map.of("message", "Token inválido o expirado"));
        }

        String email = jwtTokenUtil.extraerUsuarioDelToken(token);
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (req.getName() != null) usuario.setName(req.getName().trim());
        if (req.getSurname() != null) usuario.setSurname(req.getSurname().trim());
        if (req.getGender() != null) usuario.setGender(req.getGender());
        if (req.getBiography() != null) usuario.setBiography(req.getBiography());
        if (req.getDayOfBirth() != null) usuario.setDayOfBirth(req.getDayOfBirth());
        if (req.getMonthOfBirth() != null) usuario.setMonthOfBirth(req.getMonthOfBirth());
        if (req.getYearOfBirth() != null) usuario.setYearOfBirth(req.getYearOfBirth());

        usuarioRepository.save(usuario);

        UserProfileResponse response = new UserProfileResponse(
            usuario.getProfilePicture(),
            usuario.getBannerPicture(),
            usuario.getName(),
            usuario.getSurname(),
            usuario.getGender(),
            usuario.getBiography(),
            usuario.getDayOfBirth(),
            usuario.getMonthOfBirth(),
            usuario.getYearOfBirth()
        );
        return ResponseEntity.ok(response);
    }*/
}
