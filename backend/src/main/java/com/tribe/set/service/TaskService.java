package com.tribe.set.service;

import org.springframework.stereotype.Service;

import com.tribe.set.Entity.User;
import com.tribe.set.dto.TaskRequest;
import com.tribe.set.dto.TaskResponse;


import com.tribe.set.Entity.*;
import com.tribe.set.dto.*;
import com.tribe.set.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class TaskService {

    // Store uploaded files in 'uploads' directory
    private final String uploadDir = "uploads/";

    @Autowired private TaskRepository       taskRepository;
    @Autowired private TaskRemarkRepository remarkRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private NotificationServices notificationService;

    // ═══════════════════════════════════════════════════
    // CREATE TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse createTask(TaskRequest request, Long creatorId, MultipartFile file) {

        User creator  = findUser(creatorId);
        User assignee = findUser(request.getAssignedTo());

        // CHECK 1: Only senior officers can create tasks
        if (!creator.getRole().canAllocateTask()) {
            throw new RuntimeException(
                "Access Denied: Your role (" + creator.getRole() + ") cannot create tasks."
            );
        }

        // CHECK 2: Hierarchy rule — creator must be HIGHER than assignee
        if (!creator.getRole().canAssignTo(assignee.getRole())) {
            throw new RuntimeException(
                "Access Denied: " + creator.getRole() +
                " cannot assign tasks to " + assignee.getRole()
            );
        }

        // CHECK 3: Cannot assign to inactive user
        if (!assignee.getActive()) {
            throw new RuntimeException(
                "Cannot assign task to inactive user: " + assignee.getName()
            );
        }

        // Build Task object — use setAssignedTo() and setCreatedBy() NOT setAssignedToId()
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setDepartment(request.getDepartment());
        task.setProgress(request.getProgress());
        task.setTarget(request.getTarget());
        task.setLocation(request.getLocation());
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedBy(creator);       // ← pass User object directly
        task.setAssignedTo(assignee);     // ← pass User object directly

        // Handle file upload
        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                String originalFileName = file.getOriginalFilename();
                String extension = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }
                
                String uniqueFileName = UUID.randomUUID().toString() + extension;
                Path filePath = uploadPath.resolve(uniqueFileName).toAbsolutePath();
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                task.setAttachment(uniqueFileName);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store file: " + e.getMessage());
            }
        }

        Task saved = taskRepository.save(task);

        // Auto-notify assignee
        notificationService.send(
            assignee,
            "New task assigned to you by " + creator.getName() +
            " (" + creator.getRole() + "): " + task.getTitle(),
            NotificationType.TASK_ASSIGNED
        );

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // REASSIGN TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse reassignTask(Long taskId, Long newAssigneeId, Long requesterId) {

        User requester  = findUser(requesterId);
        Task task       = findTask(taskId);
        User newAssignee= findUser(newAssigneeId);

        boolean isCreator = task.getCreatedBy().getUserID().equals(requesterId);
        boolean isHigher  = requester.getRole().canAllocateTask() &&
                            requester.getRole().canAssignTo(task.getAssignedTo().getRole());

        if (!isCreator && !isHigher) {
            throw new RuntimeException("Access Denied: You cannot reassign this task");
        }

        if (!requester.getRole().canAssignTo(newAssignee.getRole())) {
            throw new RuntimeException(
                "Access Denied: " + requester.getRole() +
                " cannot assign tasks to " + newAssignee.getRole()
            );
        }

        User oldAssignee = task.getAssignedTo();
        task.setAssignedTo(newAssignee);
        task.setStatus(TaskStatus.PENDING);
        Task saved = taskRepository.save(task);

        // Notify old assignee
        notificationService.send(
            oldAssignee,
            "Task reassigned away from you: " + task.getTitle(),
            NotificationType.TASK_REASSIGNED
        );

        // Notify new assignee
        notificationService.send(
            newAssignee,
            "Task reassigned to you by " + requester.getName() +
            ": " + task.getTitle(),
            NotificationType.TASK_ASSIGNED
        );

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // GET TASKS
    // ═══════════════════════════════════════════════════

    public List<TaskResponse> getTasks(Long requesterId) {
        User requester = findUser(requesterId);

        List<Task> tasks;

        if (requester.getRole().canAllocateTask() ||
            requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            // Senior officers and admin see ALL tasks
            tasks = taskRepository.findAll();
        } else {
            // Field officers see only THEIR assigned tasks
            tasks = taskRepository.findByAssignedToOrderByCreatedAtDesc(requester);
        }

        return tasks.stream()
                    .map(TaskResponse::from)
                    .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════
    // GET SINGLE TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse getTaskById(Long taskId, Long requesterId) {
        User requester = findUser(requesterId);
        Task task      = findTask(taskId);

        // Field officers can only see their own tasks
        if (requester.getRole().isFieldOfficer() &&
            !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                "Access Denied: This task is not assigned to you"
            );
        }

        return TaskResponse.from(task);
    }

    // ═══════════════════════════════════════════════════
    // UPDATE TASK STATUS
    // ═══════════════════════════════════════════════════

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus, Long requesterId) {
        User requester = findUser(requesterId);
        Task task      = findTask(taskId);

        // Field officers can only update their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
            !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                "Access Denied: This task is not assigned to you"
            );
        }

        // Nobody can manually set OVERDUE — only scheduler does that
        if (requester.getRole().isFieldOfficer() &&
            newStatus == TaskStatus.OVERDUE) {
            throw new RuntimeException(
                "You cannot manually set a task as OVERDUE"
            );
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);

        // Notify creator when task is completed
        if (newStatus == TaskStatus.COMPLETED &&
            oldStatus != TaskStatus.COMPLETED) {
            notificationService.send(
                task.getCreatedBy(),
                "Task completed by " + requester.getName() +
                " (" + requester.getRole() + "): " + task.getTitle(),
                NotificationType.TASK_COMPLETED
            );
        }

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // ADD REMARK
    // ═══════════════════════════════════════════════════

    public TaskRemark addRemark(Long taskId, String remarkText, Long requesterId) {
        User requester = findUser(requesterId);
        Task task      = findTask(taskId);

        // Field officers can only remark on their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
            !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                "Access Denied: This task is not assigned to you"
            );
        }

        TaskRemark remark = new TaskRemark();
        remark.setTask(task);
        remark.setAddedBy(requester);
        remark.setRemark(remarkText);

        return remarkRepository.save(remark);
    }

    // ═══════════════════════════════════════════════════
    // GET REMARKS
    // ═══════════════════════════════════════════════════

    public List<TaskRemark> getRemarks(Long taskId) {
        Task task = findTask(taskId);
        return remarkRepository.findByTaskOrderByCreatedAtDesc(task);
    }

    // ═══════════════════════════════════════════════════
    // DASHBOARD STATS
    // ═══════════════════════════════════════════════════

    public DashboardResponse getDashboard(Long requesterId) {
        User requester = findUser(requesterId);

        long total, pending, inProgress, completed, overdue;

        if (requester.getRole().canAllocateTask() ||
            requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {

            // Admin sees stats of ALL tasks
            total      = taskRepository.count();
            pending    = taskRepository.countByStatus(TaskStatus.PENDING);
            inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
            completed  = taskRepository.countByStatus(TaskStatus.COMPLETED);
            overdue    = taskRepository.countByStatus(TaskStatus.OVERDUE);

        } else {

            // Field officer sees stats of only THEIR tasks
            total      = taskRepository.countByAssignedTo(requester);
            pending    = taskRepository.countByAssignedToAndStatus(requester, TaskStatus.PENDING);
            inProgress = taskRepository.countByAssignedToAndStatus(requester, TaskStatus.IN_PROGRESS);
            completed  = taskRepository.countByAssignedToAndStatus(requester, TaskStatus.COMPLETED);
            overdue    = taskRepository.countByAssignedToAndStatus(requester, TaskStatus.OVERDUE);
        }

        return new DashboardResponse(total, pending, inProgress, completed, overdue);
    }

    // ═══════════════════════════════════════════════════
    // OVERDUE CHECK — called by scheduler at midnight
    // ═══════════════════════════════════════════════════

    public void markOverdueTasks() {
        List<Task> overdueTasks =
            taskRepository.findTasksThatBecameOverdue(LocalDate.now());

        for (Task task : overdueTasks) {
            task.setStatus(TaskStatus.OVERDUE);
            taskRepository.save(task);

            notificationService.send(
                task.getAssignedTo(),
                "OVERDUE: Task '" + task.getTitle() + "' has passed its due date!",
                NotificationType.TASK_OVERDUE
            );

            notificationService.send(
                task.getCreatedBy(),
                "Task is overdue: '" + task.getTitle() +
                "' assigned to " + task.getAssignedTo().getName(),
                NotificationType.TASK_OVERDUE
            );
        }
    }

    // ═══════════════════════════════════════════════════
    // DUE SOON — called by scheduler at 8 AM
    // ═══════════════════════════════════════════════════

    public void sendDueSoonNotifications() {
        List<Task> dueSoon = taskRepository.findTasksDueSoon(
            LocalDate.now(),
            LocalDate.now().plusDays(2)
        );

        for (Task task : dueSoon) {
            notificationService.send(
                task.getAssignedTo(),
                "Reminder: Task '" + task.getTitle() +
                "' is due on " + task.getDueDate(),
                NotificationType.TASK_DUE_SOON
            );
        }
    }

    // ═══════════════════════════════════════════════════
    // HELPER METHODS — used internally by all methods above
    // ═══════════════════════════════════════════════════

    private User findUser(Long userId) {
        return userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException(
                    "User not found with ID: " + userId));
    }

    private Task findTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                    "Task not found with ID: " + taskId));
    }
}