package com.tribe.set.dto;

public class DashboardResponse {

    private long totalTasks;
    private long pending;
    private long inProgress;
    private long completed;
    private long overdue;
    private String completionRate;

    // Constructor — called in TaskService.getDashboard()
    public DashboardResponse(long total, long pending, long inProgress,
                              long completed, long overdue) {
        this.totalTasks     = total;
        this.pending        = pending;
        this.inProgress     = inProgress;
        this.completed      = completed;
        this.overdue        = overdue;

        // Calculate completion rate automatically
        this.completionRate = total == 0 ? "0%" :
                Math.round((completed * 100.0) / total) + "%";
    }

    // ─── Getters ───

    public long getTotalTasks() {
        return totalTasks;
    }

    public long getPending() {
        return pending;
    }

    public long getInProgress() {
        return inProgress;
    }

    public long getCompleted() {
        return completed;
    }

    public long getOverdue() {
        return overdue;
    }

    public String getCompletionRate() {
        return completionRate;
    }
}