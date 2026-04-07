package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class DeleteUserRequest {

    @NotNull(message = "Requester ID is required")
    private String requesterId;

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(@NotNull(message = "Requester ID is required") String requesterId) {
        this.requesterId = requesterId;
    }
}
