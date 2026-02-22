package org.jose.backend.repository;

import org.jose.backend.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SearchRepository extends JpaRepository<Usuario, Long> {
    @Query("""
        select u from Usuario u
        where (lower(u.name) like lower(concat('%', :query, '%'))
               or lower(u.surname) like lower(concat('%', :query, '%'))
               or lower(u.slug) like lower(concat('%', :query, '%')))
          and u.id <> :meId
        order by u.name asc
    """)
    Page<Usuario> searchUsuarios(
        @Param("query") String query,
        @Param("meId") Long meId,
        Pageable pageable
    );
}
