package com.tribe.set.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "announcements")
public class Announcement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    @Enumerated(EnumType.STRING)
    private Role targetRole; // NULL = broadcast to ALL

    private String targetTaluka; // target specific area
    private String targetVillage;

    @jakarta.persistence.Column(name = "created_by_user_id")
    private String createdByUserId;

    private boolean isCircular = false;
    private String attachment;

    public Announcement() {
    }

    public Announcement(String title, String message, Role targetRole, String targetTaluka, String targetVillage,
            String createdByUserId, boolean isCircular) {
        this.title = title;
        this.message = message;
        this.targetRole = targetRole;
        this.targetTaluka = targetTaluka;
        this.targetVillage = targetVillage;
        this.createdByUserId = createdByUserId;
        this.isCircular = isCircular;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Role getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(Role targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetTaluka() {
        return targetTaluka;
    }

    public void setTargetTaluka(String targetTaluka) {
        this.targetTaluka = targetTaluka;
    }

    public String getTargetVillage() {
        return targetVillage;
    }

    public void setTargetVillage(String targetVillage) {
        this.targetVillage = targetVillage;
    }

    public String getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(String createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public boolean isCircular() {
        return isCircular;
    }

    public void setCircular(boolean circular) {
        isCircular = circular;
    }

    public String getAttachment() {
        return attachment;
    }

    public void setAttachment(String attachment) {
        this.attachment = attachment;
    }
}
