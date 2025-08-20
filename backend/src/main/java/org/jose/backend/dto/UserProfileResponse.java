package org.jose.backend.dto;

import java.time.Instant;

public class UserProfileResponse {
    private String profilePictureURL;
    private String bannerPictureURL;

    private String name;
    private String surname;
    private String gender;
    private String biography;

    private int dayOfBirth;
    private int monthOfBirth;
    private int yearOfBirth;

    public UserProfileResponse(String profilePictureURL, String bannerPictureURL, String name, String surname, String gender, String biography, int dayOfBirth, int monthOfBirth, int yearOfBirth) {
        this.profilePictureURL = profilePictureURL;
        this.bannerPictureURL = bannerPictureURL;
        this.name = name;
        this.surname = surname;
        this.gender = gender;
        this.biography = biography;
        this.dayOfBirth = dayOfBirth;
        this.monthOfBirth = monthOfBirth;
        this.yearOfBirth = yearOfBirth;
    }

    public String getProfilePictureURL() {
        return profilePictureURL;
    }

    public void setProfilePictureURL(String profilePictureURL) {
        this.profilePictureURL = profilePictureURL;
    }

    public String getBannerPictureURL() {
        return bannerPictureURL;
    }

    public void setBannerPictureURL(String bannerPictureURL) {
        this.bannerPictureURL = bannerPictureURL;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public int getDayOfBirth() {
        return dayOfBirth;
    }

    public void setDayOfBirth(int dayOfBirth) {
        this.dayOfBirth = dayOfBirth;
    }

    public int getMonthOfBirth() {
        return monthOfBirth;
    }

    public void setMonthOfBirth(int monthOfBirth) {
        this.monthOfBirth = monthOfBirth;
    }

    public int getYearOfBirth() {
        return yearOfBirth;
    }

    public void setYearOfBirth(int yearOfBirth) {
        this.yearOfBirth = yearOfBirth;
    }
}
