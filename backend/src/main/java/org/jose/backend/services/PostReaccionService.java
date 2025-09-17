package org.jose.backend.services;

import org.jose.backend.dto.Post.ReaccionResumenResponse;
import org.jose.backend.model.Reaccion;

public interface PostReaccionService {
    ReaccionResumenResponse setReaccion(Long postId, Reaccion type);
    ReaccionResumenResponse getReacciones(Long postId);
}
