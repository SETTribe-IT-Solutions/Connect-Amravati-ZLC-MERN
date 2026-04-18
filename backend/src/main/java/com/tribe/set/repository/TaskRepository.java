package com.tribe.set.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tribe.set.entity.Task;
import com.tribe.set.entity.TaskStatus;
import com.tribe.set.entity.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedToUserIdOrderByCreatedAtDesc(String assignedToUserId);

    @Query("SELECT t FROM Task t " +
           "WHERE t.assignedToUserId = :assignedToUserId OR t.createdByUserId = :createdByUserId " +
           "ORDER BY t.createdAt DESC")
    org.springframework.data.domain.Page<Task> findByAssignedToUserIdOrCreatedByUserIdOrderByCreatedAtDesc(@Param("assignedToUserId") String assignedToUserId, @Param("createdByUserId") String createdByUserId, org.springframework.data.domain.Pageable pageable);

    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByAssignedToUserId(String assignedToUserId);

    long countByAssignedToUserIdAndStatus(String assignedToUserId, TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedToUserId = :userId OR t.createdByUserId = :userId")
    long countAssociatedTasks(@Param("userId") String userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignedToUserId = :userId OR t.createdByUserId = :userId) AND t.status = :status")
    long countAssociatedTasksByStatus(@Param("userId") String userId, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status NOT IN ('COMPLETED', 'OVERDUE')")
    List<Task> findTasksThatBecameOverdue(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :today AND :soon AND t.status NOT IN ('COMPLETED', 'OVERDUE')")
    List<Task> findTasksDueSoon(@Param("today") LocalDate today, @Param("soon") LocalDate soon);
}
