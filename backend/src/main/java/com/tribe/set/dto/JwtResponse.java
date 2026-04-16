package com.tribe.set.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class JwtResponse {

    @JsonIgnore
    private String accessToken;
    private String id;
    private String name;
    private String email;
    private String role;
    private String district;
    private String taluka;
    private String village;
    private String message;
    private String tokenType = "Bearer";

    public JwtResponse(String accessToken, String id, String name, String email,
                       String role, String district, String taluka,
                       String village, String message) {

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

    public String getAccessToken() { return accessToken; }
    public String getTokenType() { return tokenType; }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getDistrict() { return district; }
    public String getTaluka() { return taluka; }
    public String getVillage() { return village; }
    public String getMessage() { return message; }
}