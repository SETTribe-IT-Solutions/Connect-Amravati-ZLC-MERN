package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class TaskProgressUpdateRequest {

    @NotNull(message = "RequesterId is required")
    private Long requesterId;

    @NotNull(message = "Achieved units are required")
    private Integer achieved;

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public Integer getAchieved() {
        return achieved;
    }

    public void setAchieved(Integer achieved) {
        this.achieved = achieved;
    }
}