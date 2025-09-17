package org.jose.backend.dto.Post;

import java.time.Instant;

public class PostResponse {
    private Long id;
    private Long authorId;
    private String authorPhotoUrl;
    private String authorName;
    private String authorSlug;
    private String content;
    private String postType;
    private String mediaUrl;
    private long commentsCount;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean edited;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getAuthorId() {
        return authorId;
    }
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
    public String getAuthorPhotoUrl() {
        return authorPhotoUrl;
    }
    public void setAuthorPhotoUrl(String authorPhotoUrl) {
        this.authorPhotoUrl = authorPhotoUrl;
    }
    public String getAuthorName() {
        return authorName;
    }
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
    public String getAuthorSlug() {
        return authorSlug;
    }
    public void setAuthorSlug(String authorSlug) {
        this.authorSlug = authorSlug;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getPostType() {
        return postType;
    }
    public void setPostType(String postType) {
        this.postType = postType;
    }
    public String getMediaUrl() {
        return mediaUrl;
    }
    public long getCommentsCount() { return commentsCount; }
    public void setCommentsCount(long commentsCount) { this.commentsCount = commentsCount; }
    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    public Instant getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
    public boolean isEdited() {
        return edited;
    }
    public void setEdited(boolean edited) {
        this.edited = edited;
    }
}
