package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.entity.Notification;
import com.tribe.set.dto.NotificationRequest;
import com.tribe.set.service.NotificationServices;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationServices notificationService;

    /**
     * Fetch unread notifications for the specified user.
     * Filtered by isRead=false to match the "remove from UI" requirement.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark a specific notification as READ.
     * This updates the isRead flag in the database.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, @RequestParam Long userId) {
        Notification notification = notificationService.markOneAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
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