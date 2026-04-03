package com.tribe.set.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.entity.Notification;
import com.tribe.set.entity.NotificationType;
import com.tribe.set.entity.User;
import com.tribe.set.repository.NotificationRepository;
import com.tribe.set.repository.UserRepository;

@Service
public class NotificationServices {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Called by OTHER services internally — not directly by controller
    public void send(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(Long userId) {
        User user = findUser(userId);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(Long userId) {
        User user = findUser(userId);
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public Notification markOneAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security: user can only mark their OWN notifications
        if (!notification.getUser().getUserID().equals(userId)) {
            throw new RuntimeException("Access Denied: This notification does not belong to you");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        User user = findUser(userId);
        notificationRepository.markAllAsReadForUser(user);
    }

    // ─── Helper method ───
    private User findUser(Long userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
}
