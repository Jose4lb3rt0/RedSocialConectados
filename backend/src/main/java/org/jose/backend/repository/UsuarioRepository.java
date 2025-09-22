package org.jose.backend.repository;

import org.jose.backend.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findBySlug(String slug);
    boolean existsByEmail(String email);
    boolean existsBySlug(String slug);
    Page<Usuario> findAllByOrderByIdDesc(Pageable pageable);

    @Query("""
       select u from Usuario u
       where u.id <> :meId
         and not exists(
            select 1 from SolicitudAmistad s
            where (
                 (s.solicitante.id = :meId and s.destinatario.id = u.id)
              or (s.destinatario.id = :meId and s.solicitante.id = u.id)
            )
            and s.estado in ('PENDIENTE','ACEPTADA')
       )
       """)
    Page<Usuario> findSuggestions(@Param("meId") Long meId, Pageable pageable);
}
