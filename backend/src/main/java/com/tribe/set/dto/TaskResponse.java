package com.tribe.set.dto;

import com.tribe.set.Entity.Task;
import com.tribe.set.Entity.TaskPriority;
import com.tribe.set.Entity.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate dueDate;

    private Long createdById;
    private String createdByName;
    private String createdByRole;

    private Long assignedToId;
    private String assignedToName;
    private String assignedToRole;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ─── Static factory method ───
    public static TaskResponse from(Task task) {
        TaskResponse res = new TaskResponse();

        res.id          = task.getId();
        res.title       = task.getTitle();
        res.description = task.getDescription();
        res.priority    = task.getPriority();
        res.status      = task.getStatus();
        res.dueDate     = task.getDueDate();
        res.createdAt   = task.getCreatedAt();
        res.updatedAt   = task.getUpdatedAt();

        if (task.getCreatedBy() != null) {
            res.createdById   = task.getCreatedBy().getUserID();
            res.createdByName = task.getCreatedBy().getName();
            res.createdByRole = task.getCreatedBy().getRole().name();
        }

        if (task.getAssignedTo() != null) {
            res.assignedToId   = task.getAssignedTo().getUserID();
            res.assignedToName = task.getAssignedTo().getName();
            res.assignedToRole = task.getAssignedTo().getRole().name();
        }

        return res;
    }

    // ─── Getters ───

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public TaskPriority getPriority() { return priority; }
    public TaskStatus getStatus() { return status; }
    public LocalDate getDueDate() { return dueDate; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByName() { return createdByName; }
    public String getCreatedByRole() { return createdByRole; }
    public Long getAssignedToId() { return assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public String getAssignedToRole() { return assignedToRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}