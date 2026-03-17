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
    
}
