package com.tribe.set.dto;

import com.tribe.set.Entity.Role;
import jakarta.validation.constraints.*;

public class RegisterRequest {

    private Long userID;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8)
    @Pattern(
      regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
      message = "Password must contain uppercase, lowercase, number and special character"
    )
    private String password;

    private Role role;

    private String district;
    private String taluka;
    private String village;
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;
	public Long getUserID() {
		return userID;
	}
	public void setUserID(Long userID) {
		this.userID = userID;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	public String getDistrict() {
		return district;
	}
	public void setDistrict(String district) {
		this.district = district;
	}
	public String getTaluka() {
		return taluka;
	}
	public void setTaluka(String taluka) {
		this.taluka = taluka;
	}
	public String getVillage() {
		return village;
	}
	public void setVillage(String village) {
		this.village = village;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}

    
}