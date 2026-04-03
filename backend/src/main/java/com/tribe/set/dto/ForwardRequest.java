package com.tribe.set.dto;

import jakarta.validation.constraints.NotNull;

public class ForwardRequest {

    @NotNull(message = "forwardToId is mandatory")
    private Long forwardToId;

    @NotNull(message = "requesterId is mandatory")
    private Long requesterId;

    public Long getForwardToId() {
        return forwardToId;
    }

    public void setForwardToId(Long forwardToId) {
        this.forwardToId = forwardToId;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }
}
