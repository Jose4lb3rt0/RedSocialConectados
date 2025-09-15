package org.jose.backend.dto.PostComment;

import lombok.Data;

@Data
public class CreatePostCommentRequest {
    private String comment;

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
