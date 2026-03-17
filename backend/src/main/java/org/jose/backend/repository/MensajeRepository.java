package org.jose.backend.repository;

import org.jose.backend.model.Mensaje;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Historial paginado de una conversación, más recientes primero
    Page<Mensaje> findByConversacionIdOrderByCreadoEnDesc(Long conversacionId, Pageable pageable);

    // Último mensaje de una conversación (preview en la lista de chats)
    @Query("select m from Mensaje m where m.conversacion.id = :convId order by m.creadoEn desc limit 1")
    Optional<Mensaje> findUltimoMensaje(@Param("convId") Long convId);

    // Marca en leídos todos los mensajes de una conversación que no son del usuario actual
    @Modifying
    @Query("""
        update Mensaje m set m.leido = true
        where m.conversacion.id = :convId
            and m.autor.id <> :userId
            and m.leido = false
        """)
    int marcarComoLeidos(@Param("convId") Long convId, @Param("userId") Long userId);

    // Cuenta los mensajes no leídos dirigidos al usuario
    @Query("""
        select count(m) from Mensaje m
        where m.conversacion.id = :convId
            and m.autor.id <> :userId
            and m.leido = false
        """)
    long countNoLeidos(@Param("convId") Long convId, @Param("userId") Long userId);
}
