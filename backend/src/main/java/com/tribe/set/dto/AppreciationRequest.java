package com.tribe.set.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AppreciationRequest {

    @NotNull(message = "Sender ID is required")
    private String fromUserId;

    @NotNull(message = "Receiver ID is required")
    private String toUserId;

    @NotBlank(message = "Message is required")
    private String message;

    private String badge; // optional category of appreciation

    public AppreciationRequest() {
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(@NotNull(message = "Sender ID is required") String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getToUserId() {
        return toUserId;
    }

    public void setToUserId(@NotNull(message = "Receiver ID is required") String toUserId) {
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
