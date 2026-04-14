package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class TaskProgressUpdateRequest {

    @NotNull(message = "RequesterId is required")
    private String requesterId;

    @NotNull(message = "Achieved units are required")
    private Double achieved;

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public Double getAchieved() {
        return achieved;
    }

    public void setAchieved(Double achieved) {
        this.achieved = achieved;
    }
}
