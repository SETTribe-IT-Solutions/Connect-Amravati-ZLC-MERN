package com.tribe.set.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tribe.set.entity.Notification;
import com.tribe.set.entity.User;

import jakarta.transaction.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, Boolean isRead);

    long countByUserIdAndIsRead(String userId, Boolean isRead);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND (n.isRead = false OR (n.isRead = true AND n.readAt >= :expiryDate)) ORDER BY n.createdAt DESC")
    List<Notification> findActiveNotificationsForUser(@Param("userId") String userId, @Param("expiryDate") LocalDateTime expiryDate);

    boolean existsByUserIdAndTypeAndTaskId(String userId, com.tribe.set.entity.NotificationType type, Long taskId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :expiryDate")
    void deleteByCreatedAtBefore(@Param("expiryDate") LocalDateTime expiryDate);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") String userId);
}
