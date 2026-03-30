package com.tribe.set.dto;

import java.time.LocalDate;

import com.tribe.set.Entity.TaskPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;   // optional

    @NotNull(message = "RequesterId is required")
    private Long requesterId;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "AssignedTo userId is required")
    private Long assignedTo;      // userID of the person to assign to

    private LocalDate dueDate;    // optional
    private String department;
    private int progress = 0;
    private String target;
    private String achievement;
    private String location;

	public Long getRequesterId() {
		return requesterId;
	}

	public void setRequesterId(Long requesterId) {
		this.requesterId = requesterId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public TaskPriority getPriority() {
		return priority;
	}

	public void setPriority(TaskPriority priority) {
		this.priority = priority;
	}

	public Long getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(Long assignedTo) {
		this.assignedTo = assignedTo;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getAchievement() { return achievement; }
    public void setAchievement(String achievement) { this.achievement = achievement; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
