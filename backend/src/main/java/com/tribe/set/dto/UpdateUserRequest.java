package com.tribe.set.dto;

import com.tribe.set.Entity.Role;
import jakarta.validation.constraints.*;

public class UpdateUserRequest {

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private Role role;
    private String district;
    private String taluka;
    private String village;

    @NotNull(message = "Requester ID is required")
    private Long requesterId;

    // Getters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getDistrict() { return district; }
    public String getTaluka() { return taluka; }
    public String getVillage() { return village; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(Role role) { this.role = role; }
    public void setDistrict(String district) { this.district = district; }
    public void setTaluka(String taluka) { this.taluka = taluka; }
    public void setVillage(String village) { this.village = village; }

    public Long getRequesterId() { return requesterId; }
    public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
}
