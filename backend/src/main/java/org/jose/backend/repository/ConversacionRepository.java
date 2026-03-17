package org.jose.backend.repository;

import org.jose.backend.model.Conversacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {

    // Busca conversación existente entre dos usuarios (en cualquier orden)
    @Query("""
        select c from Conversacion c
        where (c.participante1.id = :u1 and c.participante2.id = :u2)
           or (c.participante1.id = :u2 and c.participante2.id = :u1)
        """)
    Optional<Conversacion> findByParticipantes(@Param("u1") Long u1, @Param("u2") Long u2);

    // Lista todas las conversaciones de un usuario, ordenadas por último mensaje
    @Query("""
        select c from Conversacion c
        where c.participante1.id = :userId or c.participante2.id = :userId
        order by coalesce(c.ultimoMensajeEn, c.creadaEn) desc
        """)
    Page<Conversacion> findByUsuario(@Param("userId") Long userId, Pageable pageable);
}
