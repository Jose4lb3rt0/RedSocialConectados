package org.jose.backend.dto.Chat;

import java.time.Instant;

public class ConversacionResponse {

    private Long id;
    // Datos del otro participante
    private Long otroUsuarioId;
    private String otroUsuarioName;
    private String otroUsuarioSlug;
    private String otroUsuarioPhotoUrl;
    // Preview del último mensaje
    private String ultimoMensaje;
    private String ultimoMensajeTipo; // TEXT / IMAGE
    private Instant ultimoMensajeEn;
    private long noLeidos;
    private Instant creadaEn;

    public ConversacionResponse(Long id, Long otroUsuarioId, String otroUsuarioName, String otroUsuarioSlug, String otroUsuarioPhotoUrl, String ultimoMensaje, String ultimoMensajeTipo, Instant ultimoMensajeEn, long noLeidos, Instant creadaEn) {
        this.id = id;
        this.otroUsuarioId = otroUsuarioId;
        this.otroUsuarioName = otroUsuarioName;
        this.otroUsuarioSlug = otroUsuarioSlug;
        this.otroUsuarioPhotoUrl = otroUsuarioPhotoUrl;
        this.ultimoMensaje = ultimoMensaje;
        this.ultimoMensajeTipo = ultimoMensajeTipo;
        this.ultimoMensajeEn = ultimoMensajeEn;
        this.noLeidos = noLeidos;
        this.creadaEn = creadaEn;
    }

    public Long getId() {
        return id;
    }

    public Long getOtroUsuarioId() {
        return otroUsuarioId;
    }

    public String getOtroUsuarioName() {
        return otroUsuarioName;
    }

    public String getOtroUsuarioSlug() {
        return otroUsuarioSlug;
    }

    public String getOtroUsuarioPhotoUrl() {
        return otroUsuarioPhotoUrl;
    }

    public String getUltimoMensaje() {
        return ultimoMensaje;
    }

    public String getUltimoMensajeTipo() {
        return ultimoMensajeTipo;
    }

    public Instant getUltimoMensajeEn() {
        return ultimoMensajeEn;
    }

    public long getNoLeidos() {
        return noLeidos;
    }

    public Instant getCreadaEn() {
        return creadaEn;
    }
}
