package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.dto.NotificationRequest;
import com.tribe.set.dto.NotificationResponse;
import com.tribe.set.service.NotificationServices;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationServices notificationService;

    /**
     * Fetch active notifications for the specified user.
     * Active = unread + read within 15 days
     */
    @GetMapping
    @PreAuthorize("authenticated")
    public ResponseEntity<List<NotificationResponse>> getActiveNotifications(@RequestParam String userId) {
        List<NotificationResponse> notifications = notificationService.getActiveNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark a specific notification as READ.
     * This updates the isRead flag in the database.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("authenticated")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id, @RequestParam String userId) {
        NotificationResponse notification = notificationService.markOneAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    @PreAuthorize("authenticated")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> createNotification(@RequestBody NotificationRequest request) {
        notificationService.createNotification(
                request.getUserId(),
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getTaskId());
        return ResponseEntity.ok().build();
    }
}