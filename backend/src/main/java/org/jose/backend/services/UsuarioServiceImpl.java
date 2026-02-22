package org.jose.backend.services;

import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.dto.Profile.EditProfileRequest;
import org.jose.backend.dto.Post.CreatePostRequest;
import org.jose.backend.dto.Profile.UserProfileResponse;
import org.jose.backend.model.Imagen;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ImagenService imagenService;
    @Autowired private PostService postService;
    @Autowired private CurrentUserService currentUser;

    @Override
    public Usuario getUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    @Override
    public UserProfileResponse getUsuarioPerfil(String email) {
        Usuario usuario = getUsuarioPorEmail(email);
        return mapToUserProfileResponse(usuario);
    }

    @Override
    public UserProfileResponse actualizarPerfil(String email, EditProfileRequest req) {
        Usuario usuario = getUsuarioPorEmail(email);

        if (req.getName() != null) { usuario.setName(req.getName()); }
        if (req.getSurname() != null) { usuario.setSurname(req.getSurname()); }
        if (req.getGender() != null) { usuario.setGender(req.getGender()); }
        if (req.getBiography() != null) { usuario.setBiography(req.getBiography()); }
        if (req.getDayOfBirth() != null) { usuario.setDayOfBirth(req.getDayOfBirth()); }
        if (req.getMonthOfBirth() != null) { usuario.setMonthOfBirth(req.getMonthOfBirth()); }
        if (req.getYearOfBirth() != null) { usuario.setYearOfBirth(req.getYearOfBirth()); }

        usuarioRepository.save(usuario);
        return mapToUserProfileResponse(usuario);
    }

    @Override
    public UserProfileResponse actualizarFotoPerfil(String email, MultipartFile file) throws IOException {
        Usuario usuario = getUsuarioPorEmail(email);
        Imagen imagen = imagenService.uploadImagen(file);

        usuario.setProfilePicture(imagen);
        usuarioRepository.save(usuario);

        CreatePostRequest post = new CreatePostRequest();
        post.setType("profile_photo");
        post.setContent("");
        postService.createWithExistingImage(post, imagen);

        return mapToUserProfileResponse(usuario);
    }

    @Override
    public UserProfileResponse actualizarFotoPortada(String email, MultipartFile file) throws IOException {
        Usuario usuario = getUsuarioPorEmail(email);

        Imagen imagen = imagenService.uploadImagen(file);
        usuario.setBannerPicture(imagen);
        usuarioRepository.save(usuario);

        CreatePostRequest post = new CreatePostRequest();
        post.setType("banner_photo");
        post.setContent("");
        postService.createWithExistingImage(post, imagen);

        return mapToUserProfileResponse(usuario);
    }

    private UserProfileResponse mapToUserProfileResponse(Usuario usuario) {
        return new UserProfileResponse(
                usuario.getId(),
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
    }

    @Override
    public UserProfileResponse getProfileBySlug(String slug) throws IOException {
        Usuario usuario = usuarioRepository.findBySlug(slug).orElseThrow(() -> new RuntimeException("Perfil no encontrado: " + slug));
        return mapToUserProfileResponse(usuario);
    }
}
