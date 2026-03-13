package org.jose.backend.services;

import org.jose.backend.dto.Notificacion.NotificacionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificacionService {
    Page<NotificacionResponse> listarNotificaciones(Pageable pageable);
    long contarNoLeidas();
    void marcarComoLeida(Long id);
    void marcarTodasComoLeidas();
}

