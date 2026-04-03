package com.tribe.set.dto;

public class LoginResponse {

	private Long userID;
	private String role;
	private String message;
	private String name;
	private String email;
	private String district;
	private String taluka;
	private String village;

	public LoginResponse(Long userID, String role, String message, String name, String email, String district,
			String taluka, String village) {
		this.userID = userID;
		this.role = role;
		this.message = message;
		this.name = name;
		this.email = email;
		this.district = district;
		this.taluka = taluka;
		this.village = village;
	}

	public Long getUserID() {
		return userID;
	}

	public String getRole() {
		return role;
	}

	public String getMessage() {
		return message;
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

}