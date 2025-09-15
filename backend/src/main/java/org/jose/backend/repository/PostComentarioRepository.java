package org.jose.backend.repository;

import org.jose.backend.model.PostComentario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostComentarioRepository extends JpaRepository<PostComentario, Long> {
    Page<PostComentario> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);
}
