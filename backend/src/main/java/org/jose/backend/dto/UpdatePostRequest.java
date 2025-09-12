package org.jose.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdatePostRequest {
    @NotBlank
    @Size(max = 3000)
    private String content;
    private String mediaUrl;
    private Boolean removeMedia; // true para quitar imagen actual

    public @NotBlank @Size(max = 3000) String getContent() {
        return content;
    }

    public void setContent(@NotBlank @Size(max = 3000) String content) {
        this.content = content;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public Boolean getRemoveMedia() {
        return removeMedia;
    }

    public void setRemoveMedia(Boolean removeMedia) {
        this.removeMedia = removeMedia;
    }
}
