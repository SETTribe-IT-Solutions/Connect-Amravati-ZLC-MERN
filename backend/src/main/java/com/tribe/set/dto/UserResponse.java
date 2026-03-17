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
    // NO password field !

    public static UserResponse from(User user) {
        UserResponse res = new UserResponse();
        res.userID = user.getUserID();
        res.name = user.getName();
        res.village=user.getVillage();
        res.taluka=user.getTaluka();
        res.district=user.getDistrict();
        return res;
    }
}
