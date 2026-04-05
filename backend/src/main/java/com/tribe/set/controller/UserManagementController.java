package com.tribe.set.controller;

import com.tribe.set.entity.Role;
import com.tribe.set.dto.*;
import com.tribe.set.service.UsermanagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserManagementController {

    @Autowired
    private UsermanagementService userService;

    @PostMapping("/add")
    public ResponseEntity<UserResponse> addUser(@Valid @RequestBody CreateuserRequest request) {
        return ResponseEntity.ok(userService.createUser(request, request.getRequesterId()));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request, request.getRequesterId()));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody DeleteUserRequest request) {
        userService.deleteUser(id, request.getRequesterId());
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false, name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getAllUsers(requesterId));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserResponse> getUserProfile(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getUserProfile(id, requesterId));
    }

//    @PostMapping("/toggle-status/{id}")
//    public ResponseEntity<UserResponse> toggleUserStatus(
//            @PathVariable(name = "id") Long id,
//            @RequestBody DeleteUserRequest request) { // Reusing DeleteUserRequest for requesterId
//        return ResponseEntity.ok(userService.toggleUserStatus(id, request.getRequesterId()));
//    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @PathVariable(name = "role") Role role,
            @RequestParam(name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getUsersByRole(role, requesterId));
    }

    @GetMapping("/subordinates")
    public ResponseEntity<List<UserResponse>> getSubordinates(@RequestParam(name = "requesterId") Long requesterId) {
        return ResponseEntity.ok(userService.getSubordinates(requesterId));
    }
}
