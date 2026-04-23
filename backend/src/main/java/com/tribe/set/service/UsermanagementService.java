package com.tribe.set.service;
 
import com.tribe.set.security.SecurityUtils;
import com.tribe.set.entity.*;
import com.tribe.set.dto.*;
import com.tribe.set.repository.*;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
 
import com.tribe.set.dto.UserStatsDTO;
import com.tribe.set.entity.UserStatus;
import java.time.LocalDateTime;

@Service
public class UsermanagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AppreciationRepository appreciationRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ... helper ...
    private User findUser(String userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    @Transactional
    public UserResponse createUser(CreateuserRequest request, String requesterId) {
        SecurityUtils.validateRequester(requesterId);
        User requester = findUser(requesterId);

        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: Only System Administrator can create users");
        }

        if (userRepository.existsByUserID(request.getUserID())) {
            throw new RuntimeException("User ID already exists: " + request.getUserID());
        }

        String normalizedEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null;
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already in use: " + normalizedEmail);
        }

        User user = new User();
        user.setUserID(request.getUserID());
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDistrict(request.getDistrict());
        user.setTaluka(request.getTaluka());
        user.setVillage(request.getVillage());
        user.setVillage(request.getVillage());
        user.setPhone(request.getPhone());
        
        user.setStatus(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE); 
  
        return enrichWithStats(UserResponse.from(userRepository.save(user)));
    }

    public Page<UserResponse> getAllUsers(String requesterId, String searchTerm, Role filterRole, UserStatus status, Pageable pageable) {
        if (requesterId != null && !requesterId.equals("null")) {
            SecurityUtils.validateRequester(requesterId);
        }
        User requester = (requesterId != null && !requesterId.equals("null")) ? findUser(requesterId) : null;
        
        List<Role> visibleRoles;
        if (requester != null && (requester.getRole() == Role.SYSTEM_ADMINISTRATOR || requester.getRole() == Role.COLLECTOR)) {
            visibleRoles = Arrays.asList(Role.values());
        } else {
            visibleRoles = Arrays.stream(Role.values())
                    .filter(r -> r != Role.SYSTEM_ADMINISTRATOR && r != Role.COLLECTOR)
                    .collect(Collectors.toList());
        }

        Page<User> userPage = userRepository.findAllFiltered(visibleRoles, searchTerm, filterRole, status, pageable);
        
        return userPage.map(u -> enrichWithStats(UserResponse.from(u)));
    }

    public UserStatsDTO getUserStats() {
        long total = userRepository.countAllUsers();
        long active = userRepository.countByStatus(UserStatus.ACTIVE);
        long inactive = userRepository.countByStatus(UserStatus.INACTIVE);
        
        LocalDateTime firstDayOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long newThisMonth = userRepository.countNewUsersThisMonth(firstDayOfMonth);
        
        return new UserStatsDTO(total, active, inactive, newThisMonth);
    }
 
    // ═══════════════════════════════════════════════════
    // GET USERS BY ROLE
    // ═══════════════════════════════════════════════════
 
    public List<UserResponse> getUsersByRole(Role role, String requesterId) {
        SecurityUtils.validateRequester(requesterId);
        findUser(requesterId);
 
        return userRepository.findByRole(role)
                .stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
 
    // ═══════════════════════════════════════════════════
    // GET USER PROFILE
    // ═══════════════════════════════════════════════════
 
    public UserResponse getUserProfile(String targetUserId, String requesterId) {
        SecurityUtils.validateRequester(requesterId);
        findUser(requesterId);
        User target = findUser(targetUserId);
        return enrichWithStats(UserResponse.from(target));
    }
 
    // ═══════════════════════════════════════════════════
    // SET STATUS (activate / deactivate / suspend)
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public UserResponse setStatus(String targetUserId, UserStatus status, String requesterId) {
        User requester = findUser(requesterId);
 
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: Only System Administrator can change user status");
        }
 
        User target = findUser(targetUserId);
 
        if (target.getUserID().equals(requesterId)) {
            throw new RuntimeException("You cannot change your own account status");
        }
 
        // Direct SQL UPDATE
        int rows = userRepository.updateStatus(targetUserId, status);
        if (rows == 0) {
            throw new RuntimeException("Failed to update status — no rows affected for user: " + targetUserId);
        }
 
        target.setStatus(status); // keep in-memory object in sync for response
        return enrichWithStats(UserResponse.from(target));
    }
 
    // ═══════════════════════════════════════════════════
    // UPDATE USER ROLE
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public UserResponse updateUserRole(String targetUserId, Role newRole, String requesterId) {
        User requester = findUser(requesterId);
 
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: Only System Administrator can change roles");
        }
 
        User target = findUser(targetUserId);
        target.setRole(newRole);
        return UserResponse.from(userRepository.save(target));
    }
 
    // ═══════════════════════════════════════════════════
    // UPDATE USER
    // Handles all edit-form fields. If 'active' is sent in the request,
    // it uses the direct SQL query (same as setActiveStatus) to update it.
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public UserResponse updateUser(String targetUserId, UpdateUserRequest request, String requesterId) {
        SecurityUtils.validateRequester(requesterId);
        User requester = findUser(requesterId);
 
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR && !requester.getUserID().equals(targetUserId)) {
            throw new RuntimeException("Access Denied: You do not have permission to update this user");
        }
 
        User target = findUser(targetUserId);
 
        if (request.getName() != null)
            target.setName(request.getName());
 
        if (request.getEmail() != null) {
            String updatedEmail = request.getEmail().toLowerCase().trim();
            if (!target.getEmail().equals(updatedEmail) && userRepository.existsByEmail(updatedEmail)) {
                throw new RuntimeException("Email already in use: " + updatedEmail);
            }
            target.setEmail(updatedEmail);
        }
 
        if (request.getRole() != null) {
            if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
                throw new RuntimeException("Access Denied: Only System Administrator can change roles");
            }
            target.setRole(request.getRole());
        }
 
        if (request.getDistrict() != null) target.setDistrict(request.getDistrict());
        if (request.getTaluka() != null)   target.setTaluka(request.getTaluka());
        if (request.getVillage() != null)  target.setVillage(request.getVillage());
        if (request.getPhone() != null)    target.setPhone(request.getPhone());
 
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            target.setPassword(passwordEncoder.encode(request.getPassword()));
        }
 
        // Save all non-status fields first
        userRepository.save(target);
 
        // Handle status separately using direct SQL — avoids JPA caching issues
        if (request.getStatus() != null) {
            if (target.getUserID().equals(requesterId) && request.getStatus() != UserStatus.ACTIVE) {
                throw new RuntimeException("You cannot change your own account status");
            }
            userRepository.updateStatus(targetUserId, request.getStatus());
            target.setStatus(request.getStatus());
        }
 
        return enrichWithStats(UserResponse.from(target));
    }
 
    // ═══════════════════════════════════════════════════
    // DELETE USER
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public void deleteUser(String id, String long1) {
        User requester = findUser(long1);
 
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: Only System Administrator can delete users");
        }
 
        User target = findUser(id);
 
        if (target.getUserID().equals(long1)) {
            throw new RuntimeException("You cannot delete your own account");
        }
 
        userRepository.delete(target);
    }
 
    // ═══════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════
 
    // ═══════════════════════════════════════════════════
    // GET SUBORDINATES
    // ═══════════════════════════════════════════════════
    public List<UserResponse> getSubordinates(String requesterId) {
        User requester = findUser(requesterId);
        int requesterLevel = requester.getRole().getLevel();
        
        return userRepository.findByStatus(UserStatus.ACTIVE)
                .stream()
                .filter(u -> u.getRole() != Role.SYSTEM_ADMINISTRATOR)
                .filter(u -> u.getRole().getLevel() > requesterLevel)
                .filter(u -> {
                    // Collector and Admin can see everyone lower
                    if (requester.getRole() == Role.COLLECTOR || requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {
                        return true;
                    }
                    // Others should stay within their district
                    if (requester.getDistrict() != null && !requester.getDistrict().equalsIgnoreCase(u.getDistrict())) {
                        return false;
                    }
                    // If requester is SDO or Tehsildar or BDO, they should stay within their taluka
                    if (requester.getRole() == Role.SDO || requester.getRole() == Role.TEHSILDAR || requester.getRole() == Role.BDO) {
                        if (requester.getTaluka() != null && !requester.getTaluka().equalsIgnoreCase(u.getTaluka())) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(u -> enrichWithStats(UserResponse.from(u)))
                .collect(Collectors.toList());
    }

 
    private UserResponse enrichWithStats(UserResponse res) {
        String userId = res.getUserID();
        if (userId != null) {
            res.setTasksCompleted(
                    taskRepository.countByAssignedToUserIdAndStatus(userId, com.tribe.set.entity.TaskStatus.COMPLETED));
            res.setAchievements(appreciationRepository.countByToUserId(userId));
 
            long totalTasks = taskRepository.countByAssignedToUserId(userId);
            res.setPendingTasks(totalTasks - res.getTasksCompleted());
        }
        return res;
    }

	
	
	}

