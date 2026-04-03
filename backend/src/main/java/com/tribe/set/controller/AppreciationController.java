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
import com.tribe.set.service.AppreciationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appreciations")
@CrossOrigin("*")
public class AppreciationController {

    @Autowired
    private AppreciationService appreciationService;

    @PostMapping("/send")
    public ResponseEntity<AppreciationResponse> sendAppreciation(@Valid @RequestBody AppreciationRequest request) {
        return ResponseEntity.ok(appreciationService.sendAppreciation(request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AppreciationResponse>> getAllAppreciations() {
        return ResponseEntity.ok(appreciationService.getAllAppreciations());
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<AppreciationResponse>> getReceivedAppreciations(
            @PathVariable(name = "userId") Long userId) {
        return ResponseEntity.ok(appreciationService.getReceivedAppreciations(userId));
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<AppreciationResponse>> getSentAppreciations(@PathVariable(name = "userId") Long userId) {
        return ResponseEntity.ok(appreciationService.getSentAppreciations(userId));
    }
}