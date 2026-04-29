package com.tribe.set.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.tribe.set.dto.JwtResponse;
import com.tribe.set.dto.UserRequest;
import com.tribe.set.dto.RegisterRequest;
import com.tribe.set.service.AuthService;
import com.tribe.set.entity.User;
import com.tribe.set.security.JwtUtils;
import com.tribe.set.security.UserDetailsImpl;
import com.tribe.set.entity.RefreshToken;
import com.tribe.set.service.RefreshTokenService;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody UserRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authService.authenticateUser(request, httpRequest);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateAccessCookie(userDetails);
        
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshCookie(refreshToken.getToken());

        JwtResponse responseBody = new JwtResponse(
                jwtCookie.getValue(), // Access token is now returned in body
                userDetails.getUserID(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getPhone(),
                userDetails.getRole(),
                userDetails.getDistrict(),
                userDetails.getTaluka(),
                userDetails.getVillage(),
                "Login successful");

        logger.info("Successful login for Email: {} from IP: {}", userDetails.getEmail(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(responseBody);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshToken = jwtUtils.getRefreshJwtFromCookies(request);

        if ((refreshToken != null) && (refreshToken.length() > 0)) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(token -> {
                        User user = authService.getUserById(token.getUserId());
                        
                        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                        ResponseCookie jwtCookie = jwtUtils.generateAccessCookie(userDetails);

                        // Optional: Rotate the refresh token as well for maximum security
                        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getUserID());
                        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshCookie(newRefreshToken.getToken());

                        logger.info("Successful token refresh for User ID: {}", user.getUserID());
                        return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                                .body("Token is refreshed successfully!");
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }

        return ResponseEntity.badRequest().body("Refresh Token is empty!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            String userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            refreshTokenService.deleteByUserId(userId);
            logger.info("User logged out successfully. User ID: {}", userId);
        }

        ResponseCookie jwtCookie = jwtUtils.getCleanAccessCookie();
        ResponseCookie jwtRefreshCookie = jwtUtils.getCleanRefreshCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body("You've been signed out!");
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

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody com.tribe.set.dto.EmailRequest request) {
        boolean exists = authService.verifyEmail(request.getEmail());
        if (exists) {
            return ResponseEntity.ok("Email verified");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email ID does not match our records");
        }
    }

    @PostMapping("/reset-password-email")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody com.tribe.set.dto.ResetPasswordRequest request) {
        String res = authService.resetPasswordByEmail(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired or invalid");
        }
        
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        // Return profile data that frontend needs for UI state
        JwtResponse response = new JwtResponse(
                null, 
                userPrincipal.getId(),
                userPrincipal.getName(),
                userPrincipal.getEmail(),
                userPrincipal.getPhone(),
                userPrincipal.getRole(),
                userPrincipal.getDistrict(),
                userPrincipal.getTaluka(),
                userPrincipal.getVillage(),
                "Session active");
                
        return ResponseEntity.ok(response);
    }
}
