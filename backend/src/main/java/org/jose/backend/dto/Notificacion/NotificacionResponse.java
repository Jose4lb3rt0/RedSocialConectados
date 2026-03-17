package org.jose.backend.dto.Notificacion;

import java.time.Instant;

public class NotificacionResponse {

    private Long id;
    private String tipo;
    private String mensaje;
    private Long referenciaId;
    private String referenciaTipo;
    private Instant creadaEn;
    private boolean leida;
    private Long actorId;
    private String actorName;
    private String actorPhotoUrl;
    private String actorSlug;
    private String reaccionTipo;

    public NotificacionResponse(Long id, String tipo, String mensaje, Long referenciaId, String referenciaTipo, Instant creadaEn, boolean leida, Long actorId, String actorName, String actorPhotoUrl, String actorSlug, String reaccionTipo) {
        this.id = id;
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.referenciaId = referenciaId;
        this.referenciaTipo = referenciaTipo;
        this.creadaEn = creadaEn;
        this.leida = leida;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorPhotoUrl = actorPhotoUrl;
        this.actorSlug = actorSlug;
        this.reaccionTipo = reaccionTipo;
    }

    public Long getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public Long getReferenciaId() {
        return referenciaId;
    }

    public String getReferenciaTipo() {
        return referenciaTipo;
    }

    public Instant getCreadaEn() {
        return creadaEn;
    }

    public boolean isLeida() {
        return leida;
    }

    public Long getActorId() { return actorId; }

    public String getActorName() { return actorName; }

    public String getActorPhotoUrl() { return actorPhotoUrl; }

    public String getActorSlug() { return actorSlug; }

    public String getReaccionTipo() { return reaccionTipo; }
}

