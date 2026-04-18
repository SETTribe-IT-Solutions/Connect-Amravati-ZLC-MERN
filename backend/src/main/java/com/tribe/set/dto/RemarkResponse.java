package com.tribe.set.dto;

import java.time.LocalDateTime;
import com.tribe.set.entity.TaskRemark;

public class RemarkResponse {
    private Long id;
    private String addedBy;
    private String addedByRole;
    private String remark;
    private LocalDateTime createdAt;

    public static RemarkResponse from(TaskRemark remark, com.tribe.set.entity.User addedBy) {
        RemarkResponse response = new RemarkResponse();
        response.setId(remark.getId());
        if (addedBy != null) {
            response.setAddedBy(addedBy.getName());
            response.setAddedByRole(addedBy.getRole().name());
        } else {
            response.setAddedBy("System");
            response.setAddedByRole("N/A");
        }
        response.setRemark(remark.getRemark());
        response.setCreatedAt(remark.getCreatedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAddedBy() { return addedBy; }
    public void setAddedBy(String addedBy) { this.addedBy = addedBy; }
    public String getAddedByRole() { return addedByRole; }
    public void setAddedByRole(String addedByRole) { this.addedByRole = addedByRole; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
