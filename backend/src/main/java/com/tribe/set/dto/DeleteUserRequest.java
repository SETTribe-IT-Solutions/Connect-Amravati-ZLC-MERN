package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class DeleteUserRequest {

    @NotNull(message = "Requester ID is required")
    private Long requesterId;

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }
}
