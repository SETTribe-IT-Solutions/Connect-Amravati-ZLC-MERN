package com.tribe.set.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.tribe.set.dto.AppreciationRequest;
import com.tribe.set.dto.AppreciationResponse;
import com.tribe.set.dto.UserResponse;
import com.tribe.set.service.AppreciationService;

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
    public ResponseEntity<Page<AppreciationResponse>> getAllAppreciations(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(appreciationService.getAllAppreciations(searchTerm, pageable));
    }

    @GetMapping("/received/{userId}")
    @PreAuthorize("authenticated")
    public ResponseEntity<Page<AppreciationResponse>> getReceivedAppreciations(
            @PathVariable(name = "userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(appreciationService.getReceivedAppreciations(userId, pageable));
    }

    @GetMapping("/sent/{userId}")
    @PreAuthorize("authenticated")
    public ResponseEntity<Page<AppreciationResponse>> getSentAppreciations(
            @PathVariable(name = "userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(appreciationService.getSentAppreciations(userId, pageable));
    }

    @GetMapping("/eligible-users")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<UserResponse>> getEligibleUsers() {
        return ResponseEntity.ok(appreciationService.getEligibleUsers());
    }
}
