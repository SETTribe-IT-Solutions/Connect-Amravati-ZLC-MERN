package com.tribe.set.config;

import com.tribe.set.security.UserDetailsImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
                return Optional.of("SYSTEM"); // Default if no user authenticated
            }

            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetailsImpl) {
                return Optional.of(((UserDetailsImpl) principal).getId());
            } else {
                return Optional.of(principal.toString());
            }
        };
    }
}
