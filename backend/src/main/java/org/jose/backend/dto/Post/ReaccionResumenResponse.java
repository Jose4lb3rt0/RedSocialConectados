package org.jose.backend.dto.Post;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.jose.backend.model.Reaccion;

import java.util.EnumMap;
import java.util.Map;

@Data
public class ReaccionResumenResponse {
    private Long postId;
    private long total;

    private Map<Reaccion, Long> conteo = new EnumMap<>(Reaccion.class);

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Reaccion miReaccion;

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public Map<Reaccion, Long> getConteo() {
        return conteo;
    }

    public void setConteo(Map<Reaccion, Long> conteo) {
        this.conteo = conteo;
    }

    public Reaccion getMiReaccion() {
        return miReaccion;
    }

    public void setMiReaccion(Reaccion miReaccion) {
        this.miReaccion = miReaccion;
    }
}
