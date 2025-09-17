package org.jose.backend.services;

import org.jose.backend.dto.Post.ReaccionResumenResponse;
import org.jose.backend.model.Post;
import org.jose.backend.model.PostReaccion;
import org.jose.backend.model.Reaccion;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.PostReaccionRepository;
import org.jose.backend.repository.PostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumMap;

@Service
public class PostReaccionServiceImpl implements PostReaccionService {

    private final PostRepository postRepo;
    private final PostReaccionRepository reaccionRepo;
    private final CurrentUserService currentUser;

    public PostReaccionServiceImpl(PostRepository postRepo, PostReaccionRepository reaccionRepo,
            CurrentUserService currentUser) {
        this.postRepo = postRepo;
        this.reaccionRepo = reaccionRepo;
        this.currentUser = currentUser;
    }

    public ReaccionResumenResponse buildSummary(Long postId, Long userId) {
        var projs = reaccionRepo.countByPostGrouped(postId);
        var counts = new EnumMap<Reaccion, Long>(Reaccion.class);
        long total = 0L;

        for (var p : projs) {
            counts.put(p.getReaccion(), p.getConteo());
            total += p.getConteo();
        }

        var resp = new ReaccionResumenResponse();
        resp.setPostId(postId);
        resp.setConteo(counts);
        resp.setTotal(total);

        if (userId != null) {
            reaccionRepo.findByPostIdAndUsuarioId(postId, userId)
                    .ifPresent(r -> resp.setMiReaccion(r.getReaccion()));
        }
        return resp;
    }

    @Override
    @Transactional
    public ReaccionResumenResponse setReaccion(Long postId, Reaccion type) {
        Usuario me = currentUser.getUser();
        Post post = postRepo.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        var existing = reaccionRepo.findByPostIdAndUsuarioId(post.getId(), me.getId());

        if (type == null || (existing.isPresent() && existing.get().getReaccion() == type)) {
            existing.ifPresent(reaccionRepo::delete);
            return buildSummary(postId, me.getId());
        }

        if (existing.isPresent()) {
            var r = existing.get();
            r.setReaccion(type);
            reaccionRepo.save(r);
        } else {
            var r = new PostReaccion();
            r.setPost(post);
            r.setUsuario(me);
            r.setReaccion(type);
            reaccionRepo.save(r);
        }
        return buildSummary(postId, me.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public ReaccionResumenResponse getReacciones(Long postId) {
        Long userId = null;
        try {
            userId = currentUser.getUser().getId();
        } catch (Exception ignored) {
        }
        return buildSummary(postId, userId);
    }
}
