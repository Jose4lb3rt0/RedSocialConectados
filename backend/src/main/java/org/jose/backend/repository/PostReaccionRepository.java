package org.jose.backend.repository;

import org.jose.backend.model.PostReaccion;
import org.jose.backend.model.Reaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostReaccionRepository extends JpaRepository<PostReaccion, Long> {

    interface ReactionCountProjection {
        Reaccion getReaccion();
        long getConteo();
    }

    Optional<PostReaccion> findByPostIdAndUsuarioId(Long postId, Long usuarioId);

    @Query("select r.reaccion as reaccion, count(r) as conteo " +
            "from PostReaccion r " +
            "where r.post.id = :postId " +
            "group by r.reaccion")
    List<ReactionCountProjection> countByPostGrouped(@Param("postId") Long postId);
}
