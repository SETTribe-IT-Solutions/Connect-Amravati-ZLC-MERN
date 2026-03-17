package com.tribe.set.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RemarkRequest {

    @NotNull(message = "RequesterId is required")
    private Long requesterId;

    @NotBlank(message = "Remark cannot be empty")
    private String remark;

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
