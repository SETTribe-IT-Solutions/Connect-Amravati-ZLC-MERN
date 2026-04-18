package com.tribe.set.dto;

import java.time.LocalDateTime;

import com.tribe.set.entity.Appreciation;
import com.tribe.set.entity.User;

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

    public static AppreciationResponse from(Appreciation app, User fromUser, User toUser) {
        AppreciationResponse res = new AppreciationResponse();
        res.setId(app.getId());
        if (fromUser != null) {
            res.setFromUserName(fromUser.getName());
            res.setFromRole(fromUser.getRole() != null ? fromUser.getRole().name() : "N/A");
        }
        if (toUser != null) {
            res.setToUserName(toUser.getName());
            res.setToRole(toUser.getRole() != null ? toUser.getRole().name() : "N/A");
            res.setToUserEverAppreciated(toUser.getEverAppreciated());
        }
        res.setMessage(app.getMessage());
        res.setBadge(app.getBadge());
        res.setCreatedAt(app.getCreatedAt());
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
