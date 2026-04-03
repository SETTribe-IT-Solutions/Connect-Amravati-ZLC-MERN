package com.tribe.set.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.Entity.User;
import com.tribe.set.repository.UserRepository;
import com.tribe.set.security.JwtUtils;
import com.tribe.set.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tribe.set.dto.JwtResponse;
import com.tribe.set.dto.RegisterRequest;
import com.tribe.set.dto.UserRequest;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse login(UserRequest request) {

        // find user by ID first to get their email (username)
        User user = userRepository.findByUserID(request.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Authenticate using AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // return JWT response
        return new JwtResponse(
                jwt,
                user.getUserID(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getDistrict(),
                user.getTaluka(),
                user.getVillage(),
                "Login successful");
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