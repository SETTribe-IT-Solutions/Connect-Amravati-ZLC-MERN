package com.tribe.set.service;

import com.tribe.set.Entity.Role;
import com.tribe.set.Entity.User;

import com.tribe.set.dto.CreateuserRequest;
import com.tribe.set.dto.UpdateUserRequest;
import com.tribe.set.dto.UserResponse;
import com.tribe.set.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsermanagementService {

    @Autowired
    private UserRepository userRepository;

    // ═══════════════════════════════════════════════════
    // CREATE USER
    // ═══════════════════════════════════════════════════

    public UserResponse createUser(CreateuserRequest request, Long requesterId) {

        User requester = findUser(requesterId);

        // Only SYSTEM_ADMINISTRATOR can create users
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException(
                "Access Denied: Only System Administrator can create users"
            );
        }

        // Check duplicate userID
        if (userRepository.existsByUserID(request.getUserID())) {
            throw new RuntimeException(
                "User ID already exists: " + request.getUserID()
            );
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                "Email already in use: " + request.getEmail()
            );
        }

        // Build new User object
        User user = new User();
        user.setUserID(request.getUserID());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setDistrict(request.getDistrict());
        user.setTaluka(request.getTaluka());
        user.setVillage(request.getVillage());
        user.setActive(true);

        return UserResponse.from(userRepository.save(user));
    }

    // ═══════════════════════════════════════════════════
    // GET ALL USERS
    // ═══════════════════════════════════════════════════

    public List<UserResponse> getAllUsers(Long requesterId) {
        User requester = findUser(requesterId);

        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException(
                "Access Denied: Only System Administrator can view all users"
            );
        }

        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════
    // GET USERS BY ROLE
    // ═══════════════════════════════════════════════════

    public List<UserResponse> getUsersByRole(Role role, Long requesterId) {
        findUser(requesterId); // just validate requester exists

        return userRepository.findByRole(role)
                .stream()
                .filter(User::getActive)
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════
    // GET USER PROFILE
    // ═══════════════════════════════════════════════════

    public UserResponse getUserProfile(Long targetUserId, Long requesterId) {
        findUser(requesterId);
        User target = findUser(targetUserId);
        return UserResponse.from(target);
    }

    // ═══════════════════════════════════════════════════
    // TOGGLE USER STATUS (activate / deactivate)
    // ═══════════════════════════════════════════════════

    public UserResponse toggleUserStatus(Long targetUserId, Long requesterId) {
        User requester = findUser(requesterId);

        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException(
                "Access Denied: Only System Administrator can change user status"
            );
        }

        User target = findUser(targetUserId);

        // Cannot deactivate yourself
        if (target.getUserID().equals(requesterId)) {
            throw new RuntimeException(
                "You cannot deactivate your own account"
            );
        }

        // Flip the status: true → false OR false → true
        target.setActive(!target.getActive());
        return UserResponse.from(userRepository.save(target));
    }

    // ═══════════════════════════════════════════════════
    // UPDATE USER ROLE
    // ═══════════════════════════════════════════════════

    public UserResponse updateUserRole(Long targetUserId, Role newRole, Long requesterId) {
        User requester = findUser(requesterId);

        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException(
                "Access Denied: Only System Administrator can change roles"
            );
        }

        User target = findUser(targetUserId);
        target.setRole(newRole);
        return UserResponse.from(userRepository.save(target));
    }

    // ═══════════════════════════════════════════════════
    // UPDATE USER
    // ═══════════════════════════════════════════════════

    public UserResponse updateUser(Long targetUserId, UpdateUserRequest request, Long requesterId) {
        User requester = findUser(requesterId);

        // Only SYSTEM_ADMINISTRATOR or the user themselves can update profile
        // But usually "Management" implies Admin. Let's stick with Admin for management controller.
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR && !requester.getUserID().equals(targetUserId)) {
            throw new RuntimeException(
                "Access Denied: You do not have permission to update this user"
            );
        }

        User target = findUser(targetUserId);

        if (request.getName() != null) target.setName(request.getName());
        if (request.getEmail() != null) {
            // Check duplicate email if it's changing
            if (!target.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use: " + request.getEmail());
            }
            target.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
                throw new RuntimeException("Access Denied: Only System Administrator can change roles");
            }
            target.setRole(request.getRole());
        }
        if (request.getDistrict() != null) target.setDistrict(request.getDistrict());
        if (request.getTaluka() != null) target.setTaluka(request.getTaluka());
        if (request.getVillage() != null) target.setVillage(request.getVillage());

        return UserResponse.from(userRepository.save(target));
    }

    // ═══════════════════════════════════════════════════
    // DELETE USER
    // ═══════════════════════════════════════════════════

    public void deleteUser(Long targetUserId, Long requesterId) {
        User requester = findUser(requesterId);

        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException(
                "Access Denied: Only System Administrator can delete users"
            );
        }

        User target = findUser(targetUserId);
        
        // Cannot delete yourself
        if (target.getUserID().equals(requesterId)) {
            throw new RuntimeException("You cannot delete your own account");
        }

        userRepository.delete(target);
    }

    // ═══════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════

    private User findUser(Long userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException(
                    "User not found with ID: " + userId));
    }
}