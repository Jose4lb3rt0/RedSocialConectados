package org.jose.backend.dto.Friends;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserSummaryResponse {
    private Long id;
    private String authorName;
    private String authorSurname;
    private String authorSlug;
    private String authorPhoto;

    public UserSummaryResponse(Long id, String authorName, String authorSurname, String authorSlug, String authorPhoto) {
        this.id = id;
        this.authorName = authorName;
        this.authorSurname = authorSurname;
        this.authorSlug = authorSlug;
        this.authorPhoto = authorPhoto;
    }

    public UserSummaryResponse() {
    }

    public String getFullName() {
        String n = authorName != null ? authorName : "";
        String s = authorSurname != null ? " " + authorSurname : "";
        return (n + s).trim();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorSurname() {
        return authorSurname;
    }

    public void setAuthorSurname(String authorSurname) {
        this.authorSurname = authorSurname;
    }

    public String getAuthorSlug() {
        return authorSlug;
    }

    public void setAuthorSlug(String authorSlug) {
        this.authorSlug = authorSlug;
    }

    public String getAuthorPhoto() {
        return authorPhoto;
    }

    public void setAuthorPhoto(String authorPhoto) {
        this.authorPhoto = authorPhoto;
    }
}
