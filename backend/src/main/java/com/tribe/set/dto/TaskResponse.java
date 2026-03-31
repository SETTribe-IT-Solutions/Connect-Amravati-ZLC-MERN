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
    private String dueDate;
    private String department;
    private int progress = 0;
    private String target;
<<<<<<< HEAD
=======
    private String achievement;
>>>>>>> upstream/main
    private String location;
    private String attachment;

    private Long createdById;
    private String createdByName;
    private String createdByRole;

    private Long assignedToId;
    private String assignedToName;
    private String assignedToRole;

    private String createdAt;
    private String updatedAt;

    // ─── Static factory method ───
    public static TaskResponse from(Task task) {
        TaskResponse res = new TaskResponse();

        res.id          = task.getId();
        res.title       = task.getTitle();
        res.description = task.getDescription();
        res.priority    = task.getPriority();
        res.status      = task.getStatus();
        res.dueDate     = task.getDueDate() != null ? task.getDueDate().toString() : null;
        res.department  = task.getDepartment();
        res.progress    = task.getProgress();
        res.target      = task.getTarget();
<<<<<<< HEAD
=======
        res.achievement = task.getAchievement();
>>>>>>> upstream/main
        res.location    = task.getLocation();
        res.attachment  = task.getAttachment();
        res.createdAt   = task.getCreatedAt() != null ? task.getCreatedAt().toString() : null;
        res.updatedAt   = task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null;

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
    public String getDueDate() { return dueDate; }
    public String getDepartment() { return department; }
    public int getProgress() { return progress; }
    public String getTarget() { return target; }
<<<<<<< HEAD
=======
    public String getAchievement() { return achievement; }
>>>>>>> upstream/main
    public String getLocation() { return location; }
    public String getAttachment() { return attachment; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByName() { return createdByName; }
    public String getCreatedByRole() { return createdByRole; }
    public Long getAssignedToId() { return assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public String getAssignedToRole() { return assignedToRole; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
}