package com.tribe.set.dto;

import java.time.LocalDateTime;

import com.tribe.set.Entity.User;

public class UserResponse {

    private Long userID;
    private String name;
    private String email;
    private String role;
    private String district;
    private String taluka;
    private String village;
    private Boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse res = new UserResponse();
        res.userID = user.getUserID();
        res.name = user.getName();
        res.email = user.getEmail();
        res.role = user.getRole().name();
        res.district = user.getDistrict();
        res.taluka = user.getTaluka();
        res.village = user.getVillage();
        res.active = user.getActive();
        res.createdAt = user.getCreatedAt();
        return res;
    }

    // Getters
    public Long getUserID() { return userID; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getDistrict() { return district; }
    public String getTaluka() { return taluka; }
    public String getVillage() { return village; }
    public Boolean getActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setUserID(Long userID) { this.userID = userID; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(String role) { this.role = role; }
    public void setDistrict(String district) { this.district = district; }
    public void setTaluka(String taluka) { this.taluka = taluka; }
    public void setVillage(String village) { this.village = village; }
    public void setActive(Boolean active) { this.active = active; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
