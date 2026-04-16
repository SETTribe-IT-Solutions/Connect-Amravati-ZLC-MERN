package com.tribe.set.dto;

public class GlobalStatsDTO {
    private long totalTasks;
    private long completed;
    private long pending;
    private long inProgress;
    private long overdue;
    private double completionRate;

    public GlobalStatsDTO(long totalTasks, long completed, long pending, long inProgress, long overdue, double completionRate) {
        this.totalTasks = totalTasks;
        this.completed = completed;
        this.pending = pending;
        this.inProgress = inProgress;
        this.overdue = overdue;
        this.completionRate = completionRate;
    }

    // Getters and Setters
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public long getCompleted() { return completed; }
    public void setCompleted(long completed) { this.completed = completed; }
    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }
    public long getInProgress() { return inProgress; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }
    public long getOverdue() { return overdue; }
    public void setOverdue(long overdue) { this.overdue = overdue; }
    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
}
