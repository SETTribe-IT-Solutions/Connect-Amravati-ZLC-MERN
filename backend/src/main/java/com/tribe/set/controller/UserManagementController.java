package com.tribe.set.controller;

import com.tribe.set.entity.Role;
import com.tribe.set.dto.*;
import com.tribe.set.service.UsermanagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;

import com.tribe.set.dto.UserStatsDTO;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    @Autowired
    private UsermanagementService userService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserStatsDTO> getGlobalStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> addUser(@Valid @RequestBody CreateuserRequest request) {
        return ResponseEntity.ok(userService.createUser(request, request.getRequesterId()));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable(name = "id") String id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request, request.getRequesterId()));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<String> deleteUser(
            @PathVariable(name = "id") String id,
            @Valid @RequestBody DeleteUserRequest request) {
        userService.deleteUser(id, request.getRequesterId());
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/all")
    @PreAuthorize("authenticated")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false, name = "searchTerm") String searchTerm,
            @RequestParam(required = false, name = "role") Role role,
            @RequestParam(required = false, name = "active") Boolean active,
            @RequestParam(required = false, name = "requesterId") String requesterId) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(userService.getAllUsers(requesterId, searchTerm, role, active, pageable));
    }

    @GetMapping("/profile/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<UserResponse> getUserProfile(
            @PathVariable(name = "id") String id,
            @RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(userService.getUserProfile(id, requesterId));
    }

    // @PostMapping("/toggle-status/{id}")
    // public ResponseEntity<UserResponse> toggleUserStatus(
    // @PathVariable(name = "id") Long id,
    // @RequestBody DeleteUserRequest request) { // Reusing DeleteUserRequest for
    // requesterId
    // return ResponseEntity.ok(userService.toggleUserStatus(id,
    // request.getRequesterId()));
    // }

    @GetMapping("/role/{role}")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @PathVariable(name = "role") Role role,
            @RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(userService.getUsersByRole(role, requesterId));
    }

    @GetMapping("/subordinates")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<UserResponse>> getSubordinates(@RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(userService.getSubordinates(requesterId));
    }
}
