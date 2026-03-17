package org.jose.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "conversaciones",
        indexes = {
                @Index(name = "idx_conversacion_participante1", columnList = "participante1_id"),
                @Index(name = "idx_conversacion_participante2", columnList = "participante2_id")
        }
)
public class Conversacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participante1_id", nullable = false)
    private Usuario participante1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participante2_id", nullable = false)
    private Usuario participante2;

    @CreationTimestamp
    @Column(name = "creada_en", nullable = false, updatable = false)
    private Instant creadaEn;

    @Column(name = "ultimo_mensaje_en")
    private Instant ultimoMensajeEn;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getParticipante1() { return participante1; }
    public void setParticipante1(Usuario participante1) { this.participante1 = participante1; }

    public Usuario getParticipante2() { return participante2; }
    public void setParticipante2(Usuario participante2) { this.participante2 = participante2; }

    public Instant getCreadaEn() { return creadaEn; }
    public void setCreadaEn(Instant creadaEn) { this.creadaEn = creadaEn; }

    public Instant getUltimoMensajeEn() { return ultimoMensajeEn; }
    public void setUltimoMensajeEn(Instant ultimoMensajeEn) { this.ultimoMensajeEn = ultimoMensajeEn; }

    // Devuelve el otro participante dado un userId
    public Usuario getOtroParticipante(Long userId) {
        return participante1.getId().equals(userId) ? participante2 : participante1;
    }
}
