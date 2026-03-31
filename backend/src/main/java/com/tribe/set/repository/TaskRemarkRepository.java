package com.tribe.set.repository;

import com.tribe.set.Entity.Task;
import com.tribe.set.Entity.TaskRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRemarkRepository extends JpaRepository<TaskRemark, Long> {

    // Get all remarks for a specific task, newest first
    List<TaskRemark> findByTaskOrderByCreatedAtDesc(Task task);

    // Count how many remarks a task has
    long countByTask(Task task);
}