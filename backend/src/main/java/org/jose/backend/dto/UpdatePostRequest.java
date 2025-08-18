package org.jose.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdatePostRequest {
    @NotBlank
    @Size(max = 3000)
    private String content;

    public @NotBlank @Size(max = 3000) String getContent() {
        return content;
    }

    public void setContent(@NotBlank @Size(max = 3000) String content) {
        this.content = content;
    }
}
