package com.tribe.set.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tribe.set.entity.RefreshToken;
import com.tribe.set.repository.RefreshTokenRepository;
import com.tribe.set.repository.UserRepository;
import com.tribe.set.security.JwtUtils;

@Service
public class RefreshTokenService {
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(String userId) {
        // ✅ Check if token exists for user
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserId(userId);

        RefreshToken refreshToken;
        if (existingToken.isPresent()) {
            // ✅ Update existing token
            refreshToken = existingToken.get();
        } else {
            // ✅ Create new token if none exists
            refreshToken = new RefreshToken();
            refreshToken.setUserId(userId);
        }

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtUtils.getRefreshExpirationMs()));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }

        return token;
    }

    @Transactional
    public int deleteByUserId(String userId) {
        return refreshTokenRepository.deleteByUserId(userId);
    }
}
