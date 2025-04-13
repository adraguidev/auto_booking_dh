package com.autobooking.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.Objects;

@Entity
@Table(name = "features")
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la característica es obligatorio")
    @Column(unique = true)
    private String name;

    @Column(name = "icon")
    private String icon;

    // Constructores
    public Feature() {
    }

    public Feature(String name, String icon) {
        this.name = name;
        this.icon = icon;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    // Equals y HashCode basados en id para uso correcto en colecciones
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Feature feature = (Feature) o;
        return Objects.equals(id, feature.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
} 