package org.jose.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
public class Imagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String imagenUrl;

    @NotBlank
    private String imagenId; // ID en la nube

    public Imagen(String nombre, String imagenUrl, String imagenId) {
        this.nombre = nombre;
        this.imagenUrl = imagenUrl;
        this.imagenId = imagenId;
    }

    public Imagen() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public @NotBlank String getNombre() {
        return nombre;
    }

    public void setNombre(@NotBlank String nombre) {
        this.nombre = nombre;
    }

    public @NotBlank String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(@NotBlank String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public @NotBlank String getImagenId() {
        return imagenId;
    }

    public void setImagenId(@NotBlank String imagenId) {
        this.imagenId = imagenId;
    }
}
