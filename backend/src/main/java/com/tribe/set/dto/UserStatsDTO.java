package com.tribe.set.dto;

public class UserStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long newUsersThisMonth;

    public UserStatsDTO(long totalUsers, long activeUsers, long inactiveUsers, long newUsersThisMonth) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    public long getInactiveUsers() { return inactiveUsers; }
    public void setInactiveUsers(long inactiveUsers) { this.inactiveUsers = inactiveUsers; }
    public long getNewUsersThisMonth() { return newUsersThisMonth; }
    public void setNewUsersThisMonth(long newUsersThisMonth) { this.newUsersThisMonth = newUsersThisMonth; }
}
