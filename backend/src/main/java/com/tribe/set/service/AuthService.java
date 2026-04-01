package com.tribe.set.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.dto.LoginResponse;
import com.tribe.set.dto.RegisterRequest;
import com.tribe.set.dto.UserRequest;
import com.tribe.set.Entity.User;
import com.tribe.set.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(UserRequest request) {

        // find user by ID
        User user = userRepository.findByUserID(request.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // check active status
        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // return login response
        return new LoginResponse(
                user.getUserID(),
                user.getRole().name(),
                "Login successful",
                user.getName(),
                user.getEmail(),
                user.getDistrict(),
                user.getTaluka(),
                user.getVillage()
        );
    }

    public String register(RegisterRequest request) {
        if (userRepository.findById(request.getUserID()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setUserID(request.getUserID());
        // Encrypt the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setDistrict(request.getDistrict());
        user.setTaluka(request.getTaluka());
        user.setVillage(request.getVillage());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);

        userRepository.save(user);

        return "User registered successfully";
    }

    public String changePassword(com.tribe.set.dto.ChangePasswordRequest request) {
        User user = userRepository.findByUserID(request.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully";
    }
}