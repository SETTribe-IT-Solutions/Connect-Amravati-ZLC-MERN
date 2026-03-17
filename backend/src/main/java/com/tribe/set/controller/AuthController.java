package com.tribe.set.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.tribe.set.dto.UserRequest;
import com.tribe.set.dto.LoginResponse;
import com.tribe.set.dto.RegisterRequest;
import com.tribe.set.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @RequestMapping(value = "/login", method = {RequestMethod.GET, RequestMethod.POST})
    public LoginResponse login(@RequestBody UserRequest request) {

        return authService.login(request);

    }

    @RequestMapping(value = "/register", method = {RequestMethod.GET, RequestMethod.POST})
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}