package org.jose.backend.repository;

import org.jose.backend.model.SolicitudAmistad;
import org.jose.backend.model.SolicitudEstado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SolicitudAmistadRepository extends JpaRepository<SolicitudAmistad, Long> {
    boolean existsBySolicitanteIdAndDestinatarioIdAndEstadoIn(Long solicitanteId, Long destinatarioId, Collection<SolicitudEstado> estados);

    @Query("""
           select (count(s) > 0) from SolicitudAmistad s
           where ((s.solicitante.id = :a and s.destinatario.id = :b) or (s.solicitante.id = :b and s.destinatario.id = :a))
             and s.estado in :estados
           """)
    boolean existsBetweenUsersWithEstadoIn(@Param("a") Long a, @Param("b") Long b, @Param("estados") Collection<SolicitudEstado> estados);

    Page<SolicitudAmistad> findByDestinatarioIdAndEstado(Long destinatarioId, SolicitudEstado estado, Pageable pageable);
    Page<SolicitudAmistad> findBySolicitanteIdAndEstado(Long solicitanteId, SolicitudEstado estado, Pageable pageable);

    @Query("""
           select s from SolicitudAmistad s
           where s.estado = 'ACEPTADA'
             and (s.solicitante.id = :userId or s.destinatario.id = :userId)
           """)
    Page<SolicitudAmistad> findAmigos(@Param("userId") Long userId, Pageable pageable);

    Optional<SolicitudAmistad> findByIdAndDestinatarioId(Long id, Long destinatarioId);
    Optional<SolicitudAmistad> findByIdAndSolicitanteId(Long id, Long solicitanteId);
    Optional<SolicitudAmistad> findBySolicitanteIdAndDestinatarioId(Long solicitanteId, Long destinatarioId);

    @Query("""
           select s from SolicitudAmistad s
           where s.estado = 'ACEPTADA'
             and ((s.solicitante.id = :a and s.destinatario.id = :b) or (s.solicitante.id = :b and s.destinatario.id = :a))
           """)
    Optional<SolicitudAmistad> findAmistadEntre(@Param("a") Long a, @Param("b") Long b);
}