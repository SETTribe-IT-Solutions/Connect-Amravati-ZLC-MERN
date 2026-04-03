package com.tribe.set.dto;


public class JwtResponse {
  private String accessToken;
  private String message;
  private String type = "Bearer";
  private Long id;
  private String name;
  private String email;
  private String role;
  private String district;
  private String taluka;
  private String village;

  public JwtResponse(String accessToken, Long id, String name, String email, String role, String district, String taluka, String village, String message) {
    this.accessToken = accessToken;
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.district = district;
    this.taluka = taluka;
    this.village = village;
    this.message = message;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getTokenType() {
    return type;
  }

  public void setTokenType(String tokenType) {
    this.type = tokenType;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
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

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
