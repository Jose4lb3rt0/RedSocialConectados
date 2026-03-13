package org.jose.backend.services;

import org.jose.backend.dto.Notificacion.NotificacionResponse;
import org.jose.backend.model.Notificacion;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.NotificacionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final CurrentUserService currentUserService;

    public NotificacionServiceImpl(NotificacionRepository notificacionRepository, CurrentUserService currentUserService) {
        this.notificacionRepository = notificacionRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificacionResponse> listarNotificaciones(Pageable pageable) {
        Usuario actual = currentUserService.getUser();
        return notificacionRepository
                .findByUsuarioOrderByCreadaEnDesc(actual, pageable)
                .map(n -> new NotificacionResponse(
                        n.getId(),
                        n.getTipo(),
                        n.getMensaje(),
                        n.getReferenciaId(),
                        n.getReferenciaTipo(),
                        n.getCreadaEn(),
                        n.isLeida()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public long contarNoLeidas() {
        Usuario actual = currentUserService.getUser();
        return notificacionRepository.countByUsuarioAndLeidaIsFalse(actual);
    }

    @Override
    public void marcarComoLeida(Long id) {
        Usuario actual = currentUserService.getUser();
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));
        if (!notificacion.getUsuario().getId().equals(actual.getId())) {
            throw new IllegalStateException("No puedes modificar una notificación de otro usuario");
        }
        if (!notificacion.isLeida()) {
            notificacion.setLeida(true);
            notificacionRepository.save(notificacion);
        }
    }

    @Override
    public void marcarTodasComoLeidas() {
        Usuario actual = currentUserService.getUser();
        notificacionRepository
                .findByUsuarioOrderByCreadaEnDesc(actual, Pageable.unpaged())
                .forEach(n -> {
                    if (!n.isLeida()) {
                        n.setLeida(true);
                    }
                });
    }
}

