package com.tribe.set.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tribe.set.dto.JwtResponse;
import com.tribe.set.dto.UserRequest;
import com.tribe.set.dto.RegisterRequest;
import com.tribe.set.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public JwtResponse login(@Valid @RequestBody UserRequest request) {

        return authService.login(request);

    }

//    @RequestMapping(value = "/register", method = { RequestMethod.GET, RequestMethod.POST })
//    public String register(@Valid @RequestBody RegisterRequest request) {
//        return authService.register(request);
//    }
    
//    @PostMapping("/register")
//    public String register(@Valid @RequestBody RegisterRequest request) {
//        return authService.register(request);
//    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public String changePassword(@Valid @RequestBody com.tribe.set.dto.ChangePasswordRequest request) {
        return authService.changePassword(request);
    }
}
