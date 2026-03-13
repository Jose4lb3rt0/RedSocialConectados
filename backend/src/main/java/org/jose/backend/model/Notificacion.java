package org.jose.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "notificaciones",
        indexes = {
                @Index(name = "idx_notificaciones_usuario", columnList = "usuario_id"),
                @Index(name = "idx_notificaciones_leida", columnList = "leida"),
                @Index(name = "idx_notificaciones_tipo", columnList = "tipo")
        }
)
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 50)
    private String tipo; // FRIEND_REQUEST, FRIEND_ACCEPTED, COMMENT, REACTION, etc.

    @Column(nullable = false, length = 255)
    private String mensaje;

    @Column(name = "referencia_id")
    private Long referenciaId;

    @Column(name = "referencia_tipo", length = 50)
    private String referenciaTipo; // POST, USER, COMMENT, etc.

    @CreationTimestamp
    @Column(name = "creada_en", nullable = false, updatable = false)
    private Instant creadaEn;

    @Column(nullable = false)
    private boolean leida = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getReferenciaId() {
        return referenciaId;
    }

    public void setReferenciaId(Long referenciaId) {
        this.referenciaId = referenciaId;
    }

    public String getReferenciaTipo() {
        return referenciaTipo;
    }

    public void setReferenciaTipo(String referenciaTipo) {
        this.referenciaTipo = referenciaTipo;
    }

    public Instant getCreadaEn() {
        return creadaEn;
    }

    public void setCreadaEn(Instant creadaEn) {
        this.creadaEn = creadaEn;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }
}

