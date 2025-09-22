package org.jose.backend.services;

import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.dto.Profile.EditProfileRequest;
import org.jose.backend.dto.Profile.UserProfileResponse;
import org.jose.backend.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UsuarioService {
    Usuario getUsuarioPorEmail(String email);
    UserProfileResponse getUsuarioPerfil(String email);
    UserProfileResponse actualizarPerfil(String email, EditProfileRequest req);
    UserProfileResponse actualizarFotoPerfil(String email, MultipartFile file) throws IOException;
    UserProfileResponse actualizarFotoPortada(String email, MultipartFile file) throws IOException;
    UserProfileResponse getProfileBySlug(String slug) throws IOException;
}
