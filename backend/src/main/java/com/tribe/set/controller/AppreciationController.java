package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.dto.AppreciationRequest;
import com.tribe.set.dto.AppreciationResponse;
import com.tribe.set.dto.UserResponse;
import com.tribe.set.service.AppreciationService;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appreciation")
public class AppreciationController {

    @Autowired
    private AppreciationService appreciationService;

    @PostMapping("/send")
    @PreAuthorize("authenticated")
    public ResponseEntity<AppreciationResponse> sendAppreciation(@Valid @RequestBody AppreciationRequest request) {
        return ResponseEntity.ok(appreciationService.sendAppreciation(request));
    }

    @GetMapping("/all")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<AppreciationResponse>> getAllAppreciations() {
        return ResponseEntity.ok(appreciationService.getAllAppreciations());
    }

    @GetMapping("/received/{userId}")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<AppreciationResponse>> getReceivedAppreciations(
            @PathVariable(name = "userId") String userId) {
        return ResponseEntity.ok(appreciationService.getReceivedAppreciations(userId));
    }

    @GetMapping("/sent/{userId}")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<AppreciationResponse>> getSentAppreciations(@PathVariable(name = "userId") String userId) {
        return ResponseEntity.ok(appreciationService.getSentAppreciations(userId));
    }

    @GetMapping("/eligible-users")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<UserResponse>> getEligibleUsers() {
        return ResponseEntity.ok(appreciationService.getEligibleUsers());
    }
}
