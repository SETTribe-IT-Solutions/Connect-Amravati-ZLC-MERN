package com.tribe.set.dto;

import com.tribe.set.entity.User;

public class UserResponse {

    private String userID;
    private String name;
    private String email;
    private String role;
    private String district;
    private String taluka;
    private String village;
    private String phone;
    private Double rating;
    private Boolean active;
    private int level;
    private String createdAt;
    private String lastLogin;
    private String lastLoginIP;
    private String lastLoginDevice;

    // Real-time calculated stats
    private Long tasksCompleted = 0L;
    private Long achievements = 0L;
    private Long pendingTasks = 0L;

    public static UserResponse from(User user) {
        UserResponse res = new UserResponse();
        res.userID = user.getUserID();
        res.name = user.getName();
        res.email = user.getEmail();
        res.role = user.getRole().name();
        res.district = user.getDistrict();
        res.taluka = user.getTaluka();
        res.village = user.getVillage();
        res.phone = user.getPhone();
        res.rating = user.getRating();
        res.active = user.getActive();
        res.level = user.getRole().getLevel();
        res.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
        res.lastLogin = user.getLastLogin() != null ? user.getLastLogin().toString() : null;
        res.lastLoginIP = user.getLastLoginIP();
        res.lastLoginDevice = user.getLastLoginDevice();
        return res;
    }

    // Getters
    public String getUserID() {
        return userID;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getDistrict() {
        return district;
    }

    public String getTaluka() {
        return taluka;
    }

    public String getVillage() {
        return village;
    }

    public String getPhone() {
        return phone;
    }

    public Double getRating() {
        return rating;
    }

    public Boolean getActive() {
        return active;
    }

    public int getLevel() {
        return level;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public String getLastLoginIP() {
        return lastLoginIP;
    }

    public String getLastLoginDevice() {
        return lastLoginDevice;
    }

    public Long getTasksCompleted() {
        return tasksCompleted;
    }

    public Long getAchievements() {
        return achievements;
    }

    public Long getPendingTasks() {
        return pendingTasks;
    }

    // Setters
    public void setUserID(String userID) {
        this.userID = userID;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public void setLastLoginIP(String lastLoginIP) {
        this.lastLoginIP = lastLoginIP;
    }

    public void setLastLoginDevice(String lastLoginDevice) {
        this.lastLoginDevice = lastLoginDevice;
    }

    public void setTasksCompleted(Long tasksCompleted) {
        this.tasksCompleted = tasksCompleted;
    }

    public void setAchievements(Long achievements) {
        this.achievements = achievements;
    }

    public void setPendingTasks(Long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }
}
