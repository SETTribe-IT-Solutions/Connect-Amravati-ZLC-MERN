package com.tribe.set.dto;

import com.tribe.set.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateAnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private Role targetRole; // null means all roles

    private String targetTaluka; // null means all areas

    private String targetVillage; // null means all villages

    private boolean isCircular;

    @NotNull(message = "Requester ID is required")
    private String requesterId;

    public CreateAnnouncementRequest() {
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

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public boolean isCircular() {
        return isCircular;
    }

    public void setCircular(boolean circular) {
        isCircular = circular;
    }
}
