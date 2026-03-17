package org.jose.backend.dto.Chat;

import java.time.Instant;

public class MensajeResponse {

    private Long id;
    private Long conversacionId;
    private Long autorId;
    private String autorName;
    private String autorPhotoUrl;
    private String contenido;
    private String mediaUrl;
    private String tipo; // TEXT / IMAGE
    private boolean leido;
    private Instant creadoEn;

    public MensajeResponse(Long id, Long conversacionId, Long autorId, String autorName, String autorPhotoUrl, String contenido, String mediaUrl, String tipo, boolean leido, Instant creadoEn) {
        this.id = id;
        this.conversacionId = conversacionId;
        this.autorId = autorId;
        this.autorName = autorName;
        this.autorPhotoUrl = autorPhotoUrl;
        this.contenido = contenido;
        this.mediaUrl = mediaUrl;
        this.tipo = tipo;
        this.leido = leido;
        this.creadoEn = creadoEn;
    }

    public Long getId() {
        return id;
    }

    public Long getConversacionId() {
        return conversacionId;
    }

    public Long getAutorId() {
        return autorId;
    }

    public String getAutorName() {
        return autorName;
    }

    public String getAutorPhotoUrl() {
        return autorPhotoUrl;
    }

    public String getContenido() {
        return contenido;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public String getTipo() {
        return tipo;
    }

    public boolean isLeido() {
        return leido;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }
}
