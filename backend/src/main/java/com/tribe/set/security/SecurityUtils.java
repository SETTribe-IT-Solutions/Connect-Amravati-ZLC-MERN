package com.tribe.set.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.tribe.set.entity.Role;

public class SecurityUtils {

    public static void validateRequester(String requesterId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Access Denied: User not authenticated");
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            throw new RuntimeException("Access Denied: Invalid authentication principal");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        
        // Allow if user is SYSTEM_ADMINISTRATOR or if they are the owner of the requesterId
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && !userDetails.getId().equals(requesterId)) {
            throw new RuntimeException("Access Denied: You cannot impersonate another user (Requester ID mismatch)");
        }
    }
}
