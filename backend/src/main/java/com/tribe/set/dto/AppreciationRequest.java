package com.tribe.set.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppreciationRequest {

    @NotNull(message = "Sender ID is required")
    private Long fromUserId;

    @NotNull(message = "Receiver ID is required")
    private Long toUserId;

    @NotBlank(message = "Message is required")
    private String message;

    private String badge; // optional category of appreciation

    public AppreciationRequest() {
    }

    public Long getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(Long fromUserId) {
        this.fromUserId = fromUserId;
    }

    public Long getToUserId() {
        return toUserId;
    }

    public void setToUserId(Long toUserId) {
        this.toUserId = toUserId;
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
}