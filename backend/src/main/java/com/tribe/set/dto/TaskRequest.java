
package com.tribe.set.dto;

import java.time.LocalDate;

import com.tribe.set.entity.TaskPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

public class TaskRequest {

	@NotBlank(message = "Title is required")
	private String title;

	private String description; // optional

	@NotNull(message = "RequesterId is required")
	private String requesterId;

	@NotNull(message = "Priority is required")
	private TaskPriority priority;

	@NotNull(message = "AssignedTo userId is required")
	private String assignedTo; // userID of the person to assign to


	@FutureOrPresent(message = "Due date cannot be in the past")
	private LocalDate dueDate; // optional

	private String department;
	private int progress = 0;
	private Integer target;
	private Integer achievement;
	private String location;

	public String getRequesterId() {
		return requesterId;
	}

	public void setRequesterId(@NotNull(message = "RequesterId is required") String requesterId) {
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

	public String getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public int getProgress() {
		return progress;
	}

	public void setProgress(int progress) {
		this.progress = progress;
	}

	public Integer getTarget() {
		return target;
	}

	public void setTarget(Integer target) {
		this.target = target;
	}

	public Integer getAchievement() {
		return achievement;
	}

	public void setAchievement(Integer achievement) {
		this.achievement = achievement;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}
}
