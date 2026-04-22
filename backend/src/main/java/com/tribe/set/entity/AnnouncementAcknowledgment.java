package com.tribe.set.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "announcement_acknowledgments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "announcement_id", "user_id" })
})
public class AnnouncementAcknowledgment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(name = "announcement_id", nullable = false)
    private Long announcementId;

    @jakarta.persistence.Column(name = "user_id", nullable = false)
    private String userId;

    public AnnouncementAcknowledgment() {
    }

    public AnnouncementAcknowledgment(Long announcementId, String userId) {
        this.announcementId = announcementId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
