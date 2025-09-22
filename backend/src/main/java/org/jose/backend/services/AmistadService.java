package org.jose.backend.services;

import org.jose.backend.dto.Friends.FriendRequestDto;
import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.springframework.data.domain.Page;

public interface AmistadService {
    FriendRequestDto enviarSolicitud(Long toUserId);
    void cancelarSolicitud(Long solicitudId);
    FriendRequestDto aceptarSolicitud(Long solicitudId);
    void rechazarSolicitud(Long solicitudId);

    Page<FriendRequestDto> inbox(int page, int size);
    Page<FriendRequestDto> outbox(int page, int size);
    Page<UserSummaryResponse> amigos(int page, int size);
    void eliminarAmigo(Long userId);

    Page<UserSummaryResponse> sugerencias(int page, int size);
}