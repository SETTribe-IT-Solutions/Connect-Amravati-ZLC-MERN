package com.tribe.set.security;

import javax.crypto.SecretKey;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.web.util.WebUtils;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${amravati.app.jwtSecret}")
    private String jwtSecret;

    @Value("${amravati.app.jwtExpirationMs:900000}")
    private int jwtExpirationMs;

    @Value("${amravati.app.jwtRefreshExpirationMs:604800000}")
    private long refreshExpirationMs;

    @Value("${amravati.app.jwtCookieName:amravati-access}")
    private String jwtAccessCookieName;

    @Value("${amravati.app.jwtRefreshCookieName:amravati-refresh}")
    private String jwtRefreshCookieName;

    @Value("${amravati.app.cookie.secure:false}")
    private boolean secureCookie;

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtAccessCookieName);
        return (cookie != null) ? cookie.getValue() : null;
    }

    public String getRefreshJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtRefreshCookieName);
        return (cookie != null) ? cookie.getValue() : null;
    }

    public ResponseCookie generateAccessCookie(UserDetailsImpl userPrincipal) {
        String jwt = generateTokenFromUserId(userPrincipal.getId(), jwtExpirationMs);
        return ResponseCookie.from(jwtAccessCookieName, jwt)
                .path("/")
                .maxAge(jwtExpirationMs / 1000)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie generateRefreshCookie(String refreshToken) {
        return ResponseCookie.from(jwtRefreshCookieName, refreshToken)
                .path("/")
                .maxAge(refreshExpirationMs / 1000)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie getCleanAccessCookie() {
        return ResponseCookie.from(jwtAccessCookieName, null).path("/").maxAge(0).build();
    }

    public ResponseCookie getCleanRefreshCookie() {
        return ResponseCookie.from(jwtRefreshCookieName, null).path("/").maxAge(0).build();
    }

    public String generateTokenFromUserId(String userId, int expirationMs) {
        return Jwts.builder()
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + expirationMs))
                .signWith(key())
                .compact();
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUserIdFromJwtToken(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            if (authToken != null && !authToken.contains(".")) {
                logger.error("DEBUG: Token contains no dots. Value received: [{}]", authToken);
            }
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}. Token content beginning: {}", e.getMessage(),
                    (authToken != null && authToken.length() > 10 ? authToken.substring(0, 10) : authToken));
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
