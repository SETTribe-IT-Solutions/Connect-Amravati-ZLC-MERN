package com.tribe.set.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.entity.User;
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
import com.tribe.set.repository.AuditLogRepository;
import com.tribe.set.entity.AuditLog;
import jakarta.servlet.http.HttpServletRequest;

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

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public Authentication authenticateUser(UserRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        
        try {
            // find user by ID first to get their email (username)
            User user = userRepository.findByUserID(request.getUserID())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getActive()) {
                auditLogRepository.save(new AuditLog("LOGIN_FAILED", request.getUserID(), ip, "FAILURE", "Account inactive"));
                throw new RuntimeException("User account is inactive");
            }

            // Authenticate using AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            auditLogRepository.save(new AuditLog("LOGIN_SUCCESS", request.getUserID(), ip, "SUCCESS", "User logged in successfully"));
            
            return authentication;
        } catch (Exception e) {
            auditLogRepository.save(new AuditLog("LOGIN_FAILED", request.getUserID(), ip, "FAILURE", e.getMessage()));
            throw e;
        }
    }

//    public String register(RegisterRequest request) {
//        if (userRepository.findByUserID(request.getUserID()).isPresent()) {
//            throw new RuntimeException("User already exists");
//        }

//        User user = new User();
//        user.setUserID(request.getUserID());
//        // Encrypt the password before saving
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        user.setName(request.getName());
//        user.setEmail(request.getEmail());
//        user.setDistrict(request.getDistrict());
//        user.setTaluka(request.getTaluka());
//        user.setVillage(request.getVillage());
//        user.setRole(request.getRole());
//        user.setActive(true);
//
//        userRepository.save(user);
//
//        return "User registered successfully";
//    }
        
    public String register(RegisterRequest request) {

        if (userRepository.findByUserID(request.getUserID()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setUserID(request.getUserID());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setDistrict(request.getDistrict());
        user.setTaluka(request.getTaluka());
        user.setVillage(request.getVillage());
        user.setRole(request.getRole());
        user.setActive(true);

        // 🔥 MISSING LINE (THIS FIXES YOUR ERROR)
        user.setPhone(request.getPhone());

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
