package org.jose.backend.dto.Chat;

import java.time.Instant;

public class ConversacionResponse {

    private Long id;
    // Datos del otro participante
    private Long otroUsuarioId;
    private String otroUsuarioName;
    private String otroUsuarioSlug;
    private String otroUsuarioPhotoUrl;
    private String otroUsuarioEmail;

    // Preview del último mensaje
    private String ultimoMensaje;
    private String ultimoMensajeTipo; // TEXT / IMAGE
    private Instant ultimoMensajeEn;
    private long noLeidos;
    private Instant creadaEn;

    public ConversacionResponse(Long id, Long otroUsuarioId, String otroUsuarioName, String otroUsuarioSlug, String otroUsuarioPhotoUrl, String otroUsuarioEmail, String ultimoMensaje, String ultimoMensajeTipo, Instant ultimoMensajeEn, long noLeidos, Instant creadaEn) {
        this.id = id;
        this.otroUsuarioId = otroUsuarioId;
        this.otroUsuarioName = otroUsuarioName;
        this.otroUsuarioSlug = otroUsuarioSlug;
        this.otroUsuarioPhotoUrl = otroUsuarioPhotoUrl;
        this.otroUsuarioEmail = otroUsuarioEmail;
        this.ultimoMensaje = ultimoMensaje;
        this.ultimoMensajeTipo = ultimoMensajeTipo;
        this.ultimoMensajeEn = ultimoMensajeEn;
        this.noLeidos = noLeidos;
        this.creadaEn = creadaEn;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOtroUsuarioId() {
        return otroUsuarioId;
    }

    public void setOtroUsuarioId(Long otroUsuarioId) {
        this.otroUsuarioId = otroUsuarioId;
    }

    public String getOtroUsuarioName() {
        return otroUsuarioName;
    }

    public void setOtroUsuarioName(String otroUsuarioName) {
        this.otroUsuarioName = otroUsuarioName;
    }

    public String getOtroUsuarioSlug() {
        return otroUsuarioSlug;
    }

    public void setOtroUsuarioSlug(String otroUsuarioSlug) {
        this.otroUsuarioSlug = otroUsuarioSlug;
    }

    public String getOtroUsuarioPhotoUrl() {
        return otroUsuarioPhotoUrl;
    }

    public void setOtroUsuarioPhotoUrl(String otroUsuarioPhotoUrl) {
        this.otroUsuarioPhotoUrl = otroUsuarioPhotoUrl;
    }

    public String getOtroUsuarioEmail() {
        return otroUsuarioEmail;
    }

    public void setOtroUsuarioEmail(String otroUsuarioEmail) {
        this.otroUsuarioEmail = otroUsuarioEmail;
    }

    public String getUltimoMensaje() {
        return ultimoMensaje;
    }

    public void setUltimoMensaje(String ultimoMensaje) {
        this.ultimoMensaje = ultimoMensaje;
    }

    public String getUltimoMensajeTipo() {
        return ultimoMensajeTipo;
    }

    public void setUltimoMensajeTipo(String ultimoMensajeTipo) {
        this.ultimoMensajeTipo = ultimoMensajeTipo;
    }

    public Instant getUltimoMensajeEn() {
        return ultimoMensajeEn;
    }

    public void setUltimoMensajeEn(Instant ultimoMensajeEn) {
        this.ultimoMensajeEn = ultimoMensajeEn;
    }

    public long getNoLeidos() {
        return noLeidos;
    }

    public void setNoLeidos(long noLeidos) {
        this.noLeidos = noLeidos;
    }

    public Instant getCreadaEn() {
        return creadaEn;
    }

    public void setCreadaEn(Instant creadaEn) {
        this.creadaEn = creadaEn;
    }
}
