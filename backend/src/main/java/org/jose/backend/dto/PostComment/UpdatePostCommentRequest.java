package org.jose.backend.dto.PostComment;

import lombok.Data;

@Data
public class UpdatePostCommentRequest {
    private String comment;
    private Boolean removeMedia;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Boolean getRemoveMedia() {
        return removeMedia;
    }

    public void setRemoveMedia(Boolean removeMedia) {
        this.removeMedia = removeMedia;
    }
}
