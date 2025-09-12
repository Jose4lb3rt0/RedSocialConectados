package org.jose.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String surname;

    @NotBlank
    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Size(min = 6)
    @Column(nullable = false)
    private String password;

    @NotBlank
    private String gender;

    private int dayOfBirth;
    private int monthOfBirth;
    private int yearOfBirth;

    @Column(nullable = true)
    private String biography;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_picture_id", referencedColumnName = "id")
    private Imagen profilePicture;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "banner_picture_id", referencedColumnName = "id")
    private Imagen bannerPicture;

    @Column(nullable = false)
    private boolean isVerified = false;

    @Column(name = "slug",unique = true, nullable = false, length = 100)
    private String slug;

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public int getDayOfBirth() { return dayOfBirth; }
    public void setDayOfBirth(int dayOfBirth) { this.dayOfBirth = dayOfBirth; }
    public int getMonthOfBirth() { return monthOfBirth; }
    public void setMonthOfBirth(int monthOfBirth) { this.monthOfBirth = monthOfBirth; }
    public int getYearOfBirth() { return yearOfBirth; }
    public void setYearOfBirth(int yearOfBirth) { this.yearOfBirth = yearOfBirth; }
    public Imagen getProfilePicture() { return profilePicture; }
    public void setProfilePicture(Imagen profilePicture) { this.profilePicture = profilePicture; }
    public Imagen getBannerPicture() { return bannerPicture; }
    public void setBannerPicture(Imagen bannerPicture) { this.bannerPicture = bannerPicture; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean isVerified) { this.isVerified = isVerified; }
}