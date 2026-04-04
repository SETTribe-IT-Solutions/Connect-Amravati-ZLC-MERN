
package com.tribe.set.dto;

import com.tribe.set.entity.Role;
import jakarta.validation.constraints.*;

public class UpdateUserRequest {

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private Role role;
    private String district;
    private String taluka;
    private String village;
    @Pattern(regexp = "^$|^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$", message = "Password must contain uppercase, lowercase, number and special character")
    private String password;

    @NotNull(message = "Requester ID is required")
    private Long requesterId;
    
    private Boolean active;

    

    // Getters
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
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

    public String getPassword() {
        return password;
    }
    
    public Boolean getActive() {
        return active;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = (email != null) ? email.toLowerCase().trim() : null;
    }

    public void setRole(Role role) {
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

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }

}
