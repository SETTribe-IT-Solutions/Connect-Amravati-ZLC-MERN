package com.tribe.set.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;
    
    @Enumerated(EnumType.STRING)
    private Role targetRole; // NULL = broadcast to ALL
    
    private String targetTaluka; // target specific area
    private String targetVillage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", referencedColumnName = "userid")
    private User createdBy;

    private boolean isCircular = false;
    private String attachment;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Announcement() {
    }

    public Announcement(String title, String message, Role targetRole, String targetTaluka, String targetVillage, User createdBy, boolean isCircular) {
        this.title = title;
        this.message = message;
        this.targetRole = targetRole;
        this.targetTaluka = targetTaluka;
        this.targetVillage = targetVillage;
        this.createdBy = createdBy;
        this.isCircular = isCircular;
        this.createdAt = LocalDateTime.now();
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
