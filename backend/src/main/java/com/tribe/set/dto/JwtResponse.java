package com.tribe.set.dto;

//public class JwtResponse {
//    private String accessToken;
//    private String message;
//    private String type = "Bearer";
//    private Long id;
//    private String name;
//    private String email;
//    private String role;
//    private String district;
//    private String taluka;
//    private String village;
//
//    public JwtResponse(String accessToken, Long id, String name, String email, String role, String district,
//            String taluka, String village, String message) {
//        this.accessToken = accessToken;
//        this.id = id;
//        this.name = name;
//        this.email = email;
//        this.role = role;
//        this.district = district;
//        this.taluka = taluka;
//        this.village = village;
//        this.message = message;
////    }
//
//public class JwtResponse {
//
//    private String accessToken;
//    private String id;
//    private String name;
//    private String email;
//    private String role;
//    private String district;
//    private String taluka;
//    private String village;
//    private String message;
//    private String tokenType = "Bearer";
//
//    public JwtResponse(String accessToken, String id, String name, String email,
//                       String role, String district, String taluka,
//                       String village, String message) {
//
//        this.accessToken = accessToken;
//        this.id = id;
//        this.name = name;
//        this.email = email;
//        this.role = role;
//        this.district = district;
//        this.taluka = taluka;
//        this.village = village;
//        this.message = message;
//    }
//
//    // getters
//
//    
//
//	public String getAccessToken() {
//        return accessToken;
//    }
//
//    public void setAccessToken(String accessToken) {
//        this.accessToken = accessToken;
//    }
//
//    public String getTokenType() {
//        return tokenType;
//    }
//
//    public void setTokenType(String tokenType) {
//        this.tokenType = tokenType;
//    
//    }
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getRole() {
//        return role;
//    }
//
//    public void setRole(String role) {
//        this.role = role;
//    }
//
//    public String getDistrict() {
//        return district;
//    }
//
//    public void setDistrict(String district) {
//        this.district = district;
//    }
//
//    public String getTaluka() {
//        return taluka;
//    }
//
//    public void setTaluka(String taluka) {
//        this.taluka = taluka;
//    }
//
//    public String getVillage() {
//        return village;
//    }
//
//    public void setVillage(String village) {
//        this.village = village;
//    }
//
//    public String getMessage() {
//        return message;
//    }
//
//    public void setMessage(String message) {
//        this.message = message;
//    }
//}

public class JwtResponse {

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