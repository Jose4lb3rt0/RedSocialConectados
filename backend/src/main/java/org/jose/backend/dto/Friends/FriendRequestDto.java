package org.jose.backend.dto.Friends;

import org.jose.backend.model.SolicitudEstado;
import java.time.Instant;

public class FriendRequestDto {
    private Long id;
    private UserSummaryResponse fromUser;
    private UserSummaryResponse toUser;
    private SolicitudEstado estado;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserSummaryResponse getFromUser() { return fromUser; }
    public void setFromUser(UserSummaryResponse fromUser) { this.fromUser = fromUser; }
    public UserSummaryResponse getToUser() { return toUser; }
    public void setToUser(UserSummaryResponse toUser) { this.toUser = toUser; }
    public SolicitudEstado getEstado() { return estado; }
    public void setEstado(SolicitudEstado estado) { this.estado = estado; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}