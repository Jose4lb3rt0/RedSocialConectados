package org.jose.backend.repository;

import org.jose.backend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("select p from Post p where p.deleted=false order by p.createdAt desc")
    Page<Post> findFeed(Pageable pageable);

    @Query("select p from Post p where p.deleted = false and p.id = :id")
    Optional<Post> findActiveById(@Param("id") Long id);

    @Query("select p from Post p where p.deleted=false and p.author.id=:authorId order by p.createdAt desc")
    Page<Post> findByAuthor(@Param("authorId") Long authorId, Pageable pageable);
}
