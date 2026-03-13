package org.jose.backend.repository;

import org.jose.backend.model.Notificacion;
import org.jose.backend.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    Page<Notificacion> findByUsuarioOrderByCreadaEnDesc(Usuario usuario, Pageable pageable);
    long countByUsuarioAndLeidaIsFalse(Usuario usuario);
}

