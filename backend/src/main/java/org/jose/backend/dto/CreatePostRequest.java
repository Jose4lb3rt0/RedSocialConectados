package org.jose.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreatePostRequest {
    @NotBlank @Size(max = 3000)
    private String content;
    private String mediaUrl;

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
}
