package com.tribe.set.service;
 
import com.tribe.set.entity.Role;
import com.tribe.set.entity.User;
 
import com.tribe.set.dto.CreateuserRequest;
import com.tribe.set.dto.UpdateUserRequest;
import com.tribe.set.dto.UserResponse;
import com.tribe.set.repository.AppreciationRepository;
import com.tribe.set.repository.TaskRepository;
import com.tribe.set.repository.UserRepository;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.stream.Collectors;
 
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
 
    // ═══════════════════════════════════════════════════
    // CREATE USER
    // New user is ALWAYS created as active = true.
    // The CreateuserRequest has no 'active' field at all.
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public UserResponse createUser(CreateuserRequest request, String requesterId) {
 
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
        user.setPhone(request.getPhone());
        user.setActive(true); // always true on create — no option to set inactive here
 
        return enrichWithStats(UserResponse.from(userRepository.save(user)));
    }
 
    // ═══════════════════════════════════════════════════
    // GET ALL USERS
    // ═══════════════════════════════════════════════════
 
    public List<UserResponse> getAllUsers(String requesterId) {
        User requester = (requesterId != null) ? findUser(requesterId) : null;
 
        return userRepository.findAll()
                .stream()
                .filter(u -> {
                    if (requester != null && requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {
                        return true;
                    }
                    return u.getRole() != Role.SYSTEM_ADMINISTRATOR && u.getRole() != Role.COLLECTOR;
                })
                .map(u -> enrichWithStats(UserResponse.from(u)))
                .collect(Collectors.toList());
    }
 
    // ═══════════════════════════════════════════════════
    // GET USERS BY ROLE
    // ═══════════════════════════════════════════════════
 
    public List<UserResponse> getUsersByRole(Role role, String requesterId) {
        findUser(requesterId);
 
        return userRepository.findByRole(role)
                .stream()
                .filter(User::getActive)
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
 
    // ═══════════════════════════════════════════════════
    // GET USER PROFILE
    // ═══════════════════════════════════════════════════
 
    public UserResponse getUserProfile(String targetUserId, String requesterId) {
        findUser(requesterId);
        User target = findUser(targetUserId);
        return enrichWithStats(UserResponse.from(target));
    }
 
    // ═══════════════════════════════════════════════════
    // SET ACTIVE STATUS (activate / deactivate)
    // This is the dedicated method called from PATCH /{id}/status.
    // Uses a direct @Modifying SQL query — guaranteed to hit the DB.
    // ═══════════════════════════════════════════════════
 
    @Transactional
    public UserResponse setActiveStatus(String targetUserId, Boolean active, String requesterId) {
        User requester = findUser(requesterId);
 
        if (requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: Only System Administrator can change user status");
        }
 
        User target = findUser(targetUserId);
 
        if (target.getUserID().equals(requesterId)) {
            throw new RuntimeException("You cannot deactivate your own account");
        }
 
        // Direct SQL UPDATE — does not rely on JPA dirty checking or entity state
        int rows = userRepository.updateActiveStatus(targetUserId, active);
        if (rows == 0) {
            throw new RuntimeException("Failed to update status — no rows affected for user: " + targetUserId);
        }
 
        target.setActive(active); // keep in-memory object in sync for response
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
 
        // Save all non-active fields first
        userRepository.save(target);
 
        // Handle active separately using direct SQL — avoids JPA caching issues
        if (request.getActive() != null) {
            if (target.getUserID().equals(requesterId) && !request.getActive()) {
                throw new RuntimeException("You cannot deactivate your own account");
            }
            userRepository.updateActiveStatus(targetUserId, request.getActive());
            target.setActive(request.getActive());
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
        
        return userRepository.findByActive(true)
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

    private User findUser(String userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
 
    private UserResponse enrichWithStats(UserResponse res) {
        User user = userRepository.findByUserID(res.getUserID()).orElse(null);
        if (user != null) {
            res.setTasksCompleted(
                    taskRepository.countByAssignedToAndStatus(user, com.tribe.set.entity.TaskStatus.COMPLETED));
            res.setAchievements(appreciationRepository.countByToUser(user));
 
            long totalTasks = taskRepository.countByAssignedTo(user);
            res.setPendingTasks(totalTasks - res.getTasksCompleted());
        }
        return res;
    }

	
	
	}

