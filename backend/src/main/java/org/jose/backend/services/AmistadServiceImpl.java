package org.jose.backend.services;

import org.jose.backend.dto.Friends.FriendRequestDto;
import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.model.SolicitudAmistad;
import org.jose.backend.model.SolicitudEstado;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.SolicitudAmistadRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

@Service
public class AmistadServiceImpl implements AmistadService {

    private final SolicitudAmistadRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final CurrentUserService currentUser;

    public AmistadServiceImpl(SolicitudAmistadRepository repo, UsuarioRepository usuarioRepo, CurrentUserService currentUser) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.currentUser = currentUser;
    }

    private UserSummaryResponse toUserSummary(Usuario u) {
        UserSummaryResponse dto = new UserSummaryResponse();
        dto.setId(u.getId());
        dto.setAuthorName(u.getName());
        dto.setAuthorSurname(u.getSurname());
        dto.setAuthorSlug(u.getSlug());
        dto.setAuthorPhoto(u.getProfilePicture() != null ? u.getProfilePicture().getImagenUrl() : null);
        return dto;
    }

    private FriendRequestDto toDto(SolicitudAmistad s) {
        FriendRequestDto dto = new FriendRequestDto();
        dto.setId(s.getId());
        dto.setFromUser(toUserSummary(s.getSolicitante()));
        dto.setToUser(toUserSummary(s.getDestinatario()));
        dto.setEstado(s.getEstado());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }

    @Override
    public FriendRequestDto enviarSolicitud(Long toUserId) {
        Usuario me = currentUser.getUser();
        if (me.getId().equals(toUserId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes enviarte solicitud a ti mismo");

        Usuario to = usuarioRepo.findById(toUserId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (repo.existsBetweenUsersWithEstadoIn(me.getId(), toUserId, List.of(SolicitudEstado.ACEPTADA, SolicitudEstado.PENDIENTE))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una relación o solicitud pendiente");
        }

        SolicitudAmistad s = new SolicitudAmistad();
        s.setSolicitante(me);
        s.setDestinatario(to);
        s.setEstado(SolicitudEstado.PENDIENTE);
        s = repo.save(s);
        return toDto(s);
    }

    @Override
    public void cancelarSolicitud(Long solicitudId) {
        Usuario me = currentUser.getUser();
        SolicitudAmistad s = repo.findByIdAndSolicitanteId(solicitudId, me.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada."));

        if (s.getEstado() != SolicitudEstado.PENDIENTE) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cancelar una solicitud no pendiente");

        /*s.setEstado(SolicitudEstado.CANCELADA);
        s.setRespondedAt(Instant.now());
        repo.save(s);*/

        repo.delete(s); //Solución a la excepción UNIQUE
    }

    @Override
    public FriendRequestDto aceptarSolicitud(Long solicitudId) {
        Usuario me = currentUser.getUser();
        SolicitudAmistad s = repo.findByIdAndDestinatarioId(solicitudId, me.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (s.getEstado() != SolicitudEstado.PENDIENTE) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solicitud no está pendiente");

        s.setEstado(SolicitudEstado.ACEPTADA);
        s.setRespondedAt(Instant.now());
        s = repo.save(s);
        return toDto(s);

    }

    @Override
    public void rechazarSolicitud(Long solicitudId) {
        Usuario me = currentUser.getUser();
        SolicitudAmistad s = repo.findByIdAndDestinatarioId(solicitudId, me.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (s.getEstado() != SolicitudEstado.PENDIENTE) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solicitud no está pendiente");

        /*s.setEstado(SolicitudEstado.RECHAZADA);
        s.setRespondedAt(Instant.now());
        repo.save(s);*/

        repo.delete(s);
    }

    @Override
    public Page<FriendRequestDto> inbox(int page, int size) {
        Usuario me = currentUser.getUser();
        return repo.findByDestinatarioIdAndEstado(me.getId(), SolicitudEstado.PENDIENTE, PageRequest.of(page, size)).map(this::toDto);
    }

    @Override
    public Page<FriendRequestDto> outbox(int page, int size) {
        Usuario me = currentUser.getUser();
        return repo.findBySolicitanteIdAndEstado(me.getId(), SolicitudEstado.PENDIENTE, PageRequest.of(page, size)).map(this::toDto);
    }

    @Override
    public Page<UserSummaryResponse> amigos(int page, int size) {
        Usuario me = currentUser.getUser();
        return repo.findAmigos(me.getId(), PageRequest.of(page, size)).map(s -> toUserSummary(s.getSolicitante().getId().equals(me.getId()) ? s.getDestinatario() : s.getSolicitante()));
    }

    @Override
    public void eliminarAmigo(Long userId) {
        Usuario me = currentUser.getUser();
        SolicitudAmistad s = repo.findAmistadEntre(me.getId(), userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No son amigos"));

        /*s.setEstado(SolicitudEstado.CANCELADA);
        s.setRespondedAt(Instant.now());
        repo.save(s);*/

        repo.delete(s);
    }

    @Override
    public Page<UserSummaryResponse> sugerencias(int page, int size) {
        Usuario me = currentUser.getUser();
        return usuarioRepo.findSuggestions(me.getId(), PageRequest.of(page, size)).map(this::mappingUserSummary);
    }

    public UserSummaryResponse mappingUserSummary(Usuario u) {
        String photo = u.getProfilePicture() != null ? u.getProfilePicture().getImagenUrl() : null;
        return new UserSummaryResponse(
                u.getId(),
                u.getName(),
                u.getSurname(),
                u.getSlug(),
                photo
        );
    }
}
