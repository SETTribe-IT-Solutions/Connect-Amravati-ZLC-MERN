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

    List<Task> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    List<Task> findByAssignedToOrCreatedByOrderByCreatedAtDesc(User assignedTo, User createdBy);

    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByAssignedTo(User assignedTo);

    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :user OR t.createdBy = :user")
    long countAssociatedTasks(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignedTo = :user OR t.createdBy = :user) AND t.status = :status")
    long countAssociatedTasksByStatus(@Param("user") User user, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status NOT IN ('COMPLETED', 'OVERDUE')")
    List<Task> findTasksThatBecameOverdue(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :today AND :soon AND t.status NOT IN ('COMPLETED', 'OVERDUE')")
    List<Task> findTasksDueSoon(@Param("today") LocalDate today, @Param("soon") LocalDate soon);
}
