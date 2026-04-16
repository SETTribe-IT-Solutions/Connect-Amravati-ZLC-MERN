package com.tribe.set.dto;

import com.tribe.set.entity.Role;

public class PerformanceReportDTO {
    private String userId;
    private String userName;
    private Role role;
    private long totalTasks;
    private long completedTasks;
    private long overdueTasks;
    private double efficiency;

    public PerformanceReportDTO(String userId, String userName, Role role, long totalTasks, long completedTasks, long overdueTasks, double efficiency) {
        this.userId = userId;
        this.userName = userName;
        this.role = role;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.overdueTasks = overdueTasks;
        this.efficiency = efficiency;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
    public double getEfficiency() { return efficiency; }
    public void setEfficiency(double efficiency) { this.efficiency = efficiency; }
}
