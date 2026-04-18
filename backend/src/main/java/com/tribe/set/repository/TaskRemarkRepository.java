package com.tribe.set.repository;

import com.tribe.set.entity.Task;
import com.tribe.set.entity.TaskRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRemarkRepository extends JpaRepository<TaskRemark, Long> {

    // Get all remarks for a specific task, newest first
    List<TaskRemark> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    // Count how many remarks a task has
    long countByTaskId(Long taskId);
}
