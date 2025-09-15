package org.jose.backend.dto.Post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreatePostRequest {
    @NotBlank @Size(max = 3000)
    private String content;
    private String type;

    public @NotBlank @Size(max = 3000) String getContent() {
        return content;
    }
    public void setContent(@NotBlank @Size(max = 3000) String content) {
        this.content = content;
    }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
