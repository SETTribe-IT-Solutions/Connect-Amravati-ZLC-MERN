package com.tribe.set.controller;

import com.tribe.set.Entity.Role;
import com.tribe.set.dto.*;
import com.tribe.set.service.UsermanagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserManagementController {

    @Autowired
    private UsermanagementService userService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> addUser(@Valid @RequestBody CreateuserRequest request) {
        return ResponseEntity.ok(userService.createUser(request, request.getRequesterId()));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request, request.getRequesterId()));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<String> deleteUser(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody DeleteUserRequest request) {
        userService.deleteUser(id, request.getRequesterId());
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMINISTRATOR', 'ROLE_COLLECTOR', 'ROLE_ADDITIONAL_DEPUTY_COLLECTOR', 'ROLE_SDO', 'ROLE_TEHSILDAR', 'ROLE_BDO', 'ROLE_TALATHI', 'ROLE_GRAMSEVAK')")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false, name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getAllUsers(requesterId));
    }

    @GetMapping("/profile/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasAnyRole('SYSTEM_ADMINISTRATOR', 'COLLECTOR')")
    public ResponseEntity<UserResponse> getUserProfile(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getUserProfile(id, requesterId));
    }

    @PostMapping("/toggle-status/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<UserResponse> toggleUserStatus(
            @PathVariable(name = "id") Long id,
            @RequestBody DeleteUserRequest request) { // Reusing DeleteUserRequest for requesterId
        return ResponseEntity.ok(userService.toggleUserStatus(id, request.getRequesterId()));
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMINISTRATOR', 'ROLE_COLLECTOR', 'ROLE_ADDITIONAL_DEPUTY_COLLECTOR', 'ROLE_SDO', 'ROLE_TEHSILDAR', 'ROLE_BDO', 'ROLE_TALATHI', 'ROLE_GRAMSEVAK')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @PathVariable(name = "role") Role role,
            @RequestParam(name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getUsersByRole(role, requesterId));
    }
}
