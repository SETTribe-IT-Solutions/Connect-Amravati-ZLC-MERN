package com.tribe.set.service;

import java.time.LocalDateTime;
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
    public void send(User user, String title, String message, NotificationType type, Long taskId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setTaskId(taskId);
        notificationRepository.save(notification);

        // Optional: Send push notification (non-blocking)
        try {
            sendPushNotification(user.getUserID(), message);
        } catch (Exception e) {
            // Ignore if push service not configured or fails
            System.err.println("Push notification failed (optional): " + e.getMessage());
        }
    }

    /**
     * Send notification only if a similar one doesn't exist for this user, type, and task.
     */
    public void sendUnique(User user, String title, String message, NotificationType type, Long taskId) {
        if (taskId != null && notificationRepository.existsByUserAndTypeAndTaskId(user, type, taskId)) {
            return; // Skip duplicate
        }
        send(user, title, message, type, taskId);
    }

    public List<Notification> getMyNotifications(String userId) {
        User user = findUser(userId);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get active notifications: unread + read within 15 days
     */
    public List<Notification> getActiveNotifications(String userId) {
        User user = findUser(userId);
        // Requirement: Only return notifications where createdAt >= (current date - 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return notificationRepository.findActiveNotificationsForUser(user, sevenDaysAgo);
    }

    /**
     * Requirement: Get ONLY UNREAD notifications to show in dropdown
     */
    public List<Notification> getUnreadNotifications(String userId) {
        User user = findUser(userId);
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public long getUnreadCount(String userId) {
        User user = findUser(userId);
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public Notification markOneAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security: user can only mark their OWN notifications
        if (!notification.getUser().getUserID().equals(userId)) {
            throw new RuntimeException("Access Denied: This notification does not belong to you");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        User user = findUser(userId);
        notificationRepository.markAllAsReadForUser(user);
    }

    public void createNotification(String userId, String title, String message, NotificationType type, Long taskId) {
        User user = findUser(userId);
        send(user, title, message, type, taskId);
    }

    /**
     * Clean up notifications older than 7 days.
     */
    public void cleanupOldNotifications() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        notificationRepository.deleteByCreatedAtBefore(sevenDaysAgo);
    }

    // ─── Helper method ───
    private User findUser(String userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    // Optional push notification hook (non-blocking)
    private void sendPushNotification(String userId, String message) {
        // TODO: Implement push notification service integration
        // This is a placeholder for future push notification services
        // e.g., Firebase, OneSignal, etc.
        // For now, it does nothing to maintain backward compatibility
    }
}
