package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class ForwardRequest {

    @NotNull(message = "forwardToId is mandatory")
    private String forwardToId;

    @NotNull(message = "requesterId is mandatory")
    private String requesterId;

    public String getForwardToId() {
        return forwardToId;
    }

    public void setForwardToId(String forwardToId) {
        this.forwardToId = forwardToId;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }
}
