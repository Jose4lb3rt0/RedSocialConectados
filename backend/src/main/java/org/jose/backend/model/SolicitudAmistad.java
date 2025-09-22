package org.jose.backend.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "solicitudes_amistad",
    uniqueConstraints = @UniqueConstraint(name = "uk_solicitante_destinatario", columnNames = {"solicitante_id", "destinatario_id"}),
    indexes = {
            @Index(name = "idx_solicitudes_destinatario", columnList = "destinatario_id"),
            @Index(name = "idx_solicitudes_solicitante", columnList = "solicitante_id"),
            @Index(name = "idx_solicitudes_estado", columnList = "estado")
    }
)
public class SolicitudAmistad {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Usuario solicitante;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SolicitudEstado estado = SolicitudEstado.PENDIENTE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

    public Long getId() { return id; }
    public Usuario getSolicitante() { return solicitante; }
    public void setSolicitante(Usuario solicitante) { this.solicitante = solicitante; }
    public Usuario getDestinatario() { return destinatario; }
    public void setDestinatario(Usuario destinatario) { this.destinatario = destinatario; }
    public SolicitudEstado getEstado() { return estado; }
    public void setEstado(SolicitudEstado estado) { this.estado = estado; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
}
