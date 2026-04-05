package com.tribe.set.dto;

import java.time.LocalDateTime;

import com.tribe.set.entity.Appreciation;

public class AppreciationResponse {

    private Long id;
    private String fromUserName;
    private String toUserName;
    private String fromRole;
    private String toRole;
    private String message;
    private String badge;
    private LocalDateTime createdAt;
    private Boolean toUserEverAppreciated;

    public AppreciationResponse() {
    }

    public static AppreciationResponse from(Appreciation app) {
        AppreciationResponse res = new AppreciationResponse();
        res.setId(app.getId());
        res.setFromUserName(app.getFromUser().getName());
        res.setToUserName(app.getToUser().getName());
        res.setFromRole(app.getFromUser().getRole() != null ? app.getFromUser().getRole().name() : "N/A");
        res.setToRole(app.getToUser().getRole() != null ? app.getToUser().getRole().name() : "N/A");
        res.setMessage(app.getMessage());
        res.setBadge(app.getBadge());
        res.setCreatedAt(app.getCreatedAt());
        res.setToUserEverAppreciated(app.getToUser().getEverAppreciated());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFromUserName() {
        return fromUserName;
    }

    public void setFromUserName(String fromUserName) {
        this.fromUserName = fromUserName;
    }

    public String getToUserName() {
        return toUserName;
    }

    public void setToUserName(String toUserName) {
        this.toUserName = toUserName;
    }

    public String getFromRole() {
        return fromRole;
    }

    public void setFromRole(String fromRole) {
        this.fromRole = fromRole;
    }

    public String getToRole() {
        return toRole;
    }

    public void setToRole(String toRole) {
        this.toRole = toRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getToUserEverAppreciated() {
        return toUserEverAppreciated;
    }

    public void setToUserEverAppreciated(Boolean toUserEverAppreciated) {
        this.toUserEverAppreciated = toUserEverAppreciated;
    }
}
