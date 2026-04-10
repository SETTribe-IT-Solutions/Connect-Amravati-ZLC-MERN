package com.tribe.set.service;

import org.springframework.stereotype.Service;

import com.tribe.set.entity.User;
import com.tribe.set.dto.TaskRequest;
import com.tribe.set.dto.TaskResponse;

import com.tribe.set.entity.*;
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

import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    // Store uploaded files in 'uploads' directory
    private final String uploadDir = "uploads/";

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private TaskRemarkRepository remarkRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationServices notificationService;

    // ═══════════════════════════════════════════════════
    // CREATE TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse createTask(TaskRequest request, String creatorId, MultipartFile file) {

        User creator = findUser(creatorId);
        User assignee = findUser(request.getAssignedTo());

        // CHECK 1: Only senior officers can create tasks
        if (!creator.getRole().canAllocateTask()) {
            throw new RuntimeException(
                    "Access Denied: Your role (" + creator.getRole() + ") cannot create tasks.");
        }

        // CHECK 2: Hierarchy rule — creator must be HIGHER than assignee
        if (!creator.getRole().canAssignTo(assignee.getRole())) {
            throw new RuntimeException(
                    "Access Denied: " + creator.getRole() +
                            " cannot assign tasks to " + assignee.getRole());
        }

        // CHECK 3: Cannot assign to inactive user
        if (!assignee.getActive()) {
            throw new RuntimeException(
                    "Cannot assign task to inactive user: " + assignee.getName());
        }

        // CHECK 4: Due date cannot be in the past
        if (request.getDueDate() != null && request.getDueDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Validation Error: Due date cannot be in the past.");
        }

        // Build Task object — use setAssignedTo() and setCreatedBy() NOT
        // setAssignedToId()
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setDepartment(request.getDepartment());
        task.setProgress(request.getProgress());
        task.setTarget(request.getTarget());
        task.setAchievement(request.getAchievement());
        task.setLocation(request.getLocation());
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedBy(creator); // ← pass User object directly
        task.setAssignedTo(assignee); // ← pass User object directly

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

        // Reset appreciation status for assignee as they have a new task
        assignee.setIsAppreciated(false);
        userRepository.save(assignee);

        Task saved = taskRepository.save(task);

        // Auto-notify assignee
        notificationService.send(
                assignee,
                "New Task Assigned",
                "New task assigned to you by " + creator.getName() +
                        " (" + creator.getRole() + "): " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // REASSIGN TASK
    // ═══════════════════════════════════════════════════

	public TaskResponse reassignTask(Long taskId, String newAssigneeId, String requesterId) {

        User requester = findUser(requesterId);
        Task task = findTask(taskId);
        User newAssignee = findUser(newAssigneeId);

        boolean isCreator = task.getCreatedBy().getUserID().equals(requesterId);
        boolean isHigher = requester.getRole().canAllocateTask() &&
                requester.getRole().canAssignTo(task.getAssignedTo().getRole());

        if (!isCreator && !isHigher) {
            throw new RuntimeException("Access Denied: You cannot reassign this task");
        }

        if (!requester.getRole().canAssignTo(newAssignee.getRole())) {
            throw new RuntimeException(
                    "Access Denied: " + requester.getRole() +
                            " cannot assign tasks to " + newAssignee.getRole());
        }

        User oldAssignee = task.getAssignedTo();
        task.setAssignedTo(newAssignee);
        task.setStatus(TaskStatus.PENDING);

        // Reset appreciation status for new assignee
        newAssignee.setIsAppreciated(false);
        userRepository.save(newAssignee);

        Task saved = taskRepository.save(task);

        // Notify old assignee
        notificationService.send(
                oldAssignee,
                "Task Reassigned",
                "Task reassigned away from you: " + task.getTitle(),
                NotificationType.TASK_REASSIGNED,
                saved.getId());

        // Notify new assignee
        notificationService.send(
                newAssignee,
                "New Task Assigned",
                "Task reassigned to you by " + requester.getName() +
                        ": " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // FORWARD TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse forwardTask(Long taskId, String newAssigneeId, String requesterId) {

        User requester = findUser(requesterId);
        Task task = findTask(taskId);
        User newAssignee = findUser(newAssigneeId);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new RuntimeException("Validation Error: Cannot forward a completed task");
        }

        // Verify that the task is assigned to the requester
        boolean isAssignee = task.getAssignedTo().getUserID().equals(requesterId);

        if (!isAssignee) {
            throw new RuntimeException("Access Denied: You cannot forward this task because you are not the current assignee");
        }

        // CHECK 2: Hierarchy rule — requester must be HIGHER than assignee
        if (!requester.getRole().canAssignTo(newAssignee.getRole())) {
            throw new RuntimeException(
                    "Access Denied: " + requester.getRole() +
                            " cannot forward tasks to " + newAssignee.getRole());
        }

        // Check if user is active
        if (!newAssignee.getActive()) {
            throw new RuntimeException("Cannot forward task to an inactive user");
        }

        User oldAssignee = task.getAssignedTo();
        task.setAssignedTo(newAssignee);

        // Reset appreciation status for new assignee
        newAssignee.setIsAppreciated(false);
        userRepository.save(newAssignee);

        Task saved = taskRepository.save(task);

        // Add a remark that it was forwarded
        TaskRemark remark = new TaskRemark();
        remark.setTask(saved);
        remark.setAddedBy(requester);
        remark.setRemark(
                requester.getName() + " (" + requester.getRole() + ") forwarded this task to " + newAssignee.getName());
        remarkRepository.save(remark);

        // Notify old assignee (if not the requester)
        if (!oldAssignee.getUserID().equals(requesterId)) {
            notificationService.send(
                    oldAssignee,
                    "Task Forwarded",
                    "Your task was forwarded to someone else: " + task.getTitle(),
                    NotificationType.TASK_REASSIGNED,
                    saved.getId());
        }

        // Notify new assignee
        notificationService.send(
                newAssignee,
                "Task Forwarded",
                requester.getRole() + " " + requester.getName() + " forwarded a task to you: " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // GET TASKS
    // ═══════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(String finalUserId) {
        User requester = findUser(finalUserId);

        List<Task> tasks;

        if (requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            // Only system administrator sees all tasks
            tasks = taskRepository.findAll();
        } else {
            // Everyone else sees only tasks assigned to them or forwarded/created by them
            tasks = taskRepository.findByAssignedToOrCreatedByOrderByCreatedAtDesc(requester, requester);
        }

        return tasks.stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════
    // GET SINGLE TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse getTaskById(Long taskId, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only see their own tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                    "Access Denied: This task is not assigned to you");
        }

        return TaskResponse.from(task);
    }

    // ═══════════════════════════════════════════════════
    // UPDATE TASK STATUS
    // ═══════════════════════════════════════════════════

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only update their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                    "Access Denied: This task is not assigned to you");
        }

        // Nobody can manually set OVERDUE — only scheduler does that
        if (requester.getRole().isFieldOfficer() &&
                newStatus == TaskStatus.OVERDUE) {
            throw new RuntimeException(
                    "You cannot manually set a task as OVERDUE");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);

        // Notify creator when task is completed
        if (newStatus == TaskStatus.COMPLETED &&
                oldStatus != TaskStatus.COMPLETED) {
            notificationService.send(
                    task.getCreatedBy(),
                    "Task Completed",
                    "Task completed by " + requester.getName() +
                            " (" + requester.getRole() + "): " + task.getTitle(),
                    NotificationType.TASK_COMPLETED,
                    task.getId());
        }

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // UPDATE TASK PROGRESS
    // ═══════════════════════════════════════════════════

    public TaskResponse updateTaskProgress(Long taskId, int achievedWork, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        boolean isAssignedTo = task.getAssignedTo().getUserID().equals(requesterId);
        boolean isCreatedBy = task.getCreatedBy().getUserID().equals(requesterId);

        // ONLY the assigned user or the creator can update the progress
        if (!isAssignedTo && !isCreatedBy) {
            throw new RuntimeException("Access Denied: Only the assigned user (" +
                    task.getAssignedTo().getName() + ") or the assigner can update this task's progress.");
        }

        if (achievedWork < 0) {
            throw new RuntimeException("Achievement cannot be negative.");
        }

        // Target processing
        Integer target = task.getTarget();
        if (target != null && target > 0) {
            if (achievedWork > target) {
                throw new RuntimeException(
                        "Achievement (" + achievedWork + ") cannot exceed the target (" + target + ").");
            }
        }

        // Progress can only increase for assignee — cannot decrease achievement once recorded. Assigner can bypass.
        if (isAssignedTo && !isCreatedBy) {
            if (task.getAchievement() != null && achievedWork < task.getAchievement()) {
                throw new RuntimeException("Validation Error: As the assignee, you can only update achievement in increasing order. You cannot enter less than " + task.getAchievement() + ". Contact the assigner for corrections.");
            }
        }

        task.setAchievement(achievedWork);

        // Calculate progress percentage with safety check
        if (target == null || target <= 0) {
            int newProgress = Math.min(100, Math.max(0, achievedWork));
            task.setProgress(newProgress);
        } else {
            double percentage = ((double) achievedWork / target) * 100;
            task.setProgress((int) Math.min(100, Math.max(0, percentage)));
        }

        // Auto-update status based on progress
        if (task.getProgress() >= 100) {
            task.setStatus(TaskStatus.COMPLETED);
        } else if (task.getProgress() > 0) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        }

        Task saved = taskRepository.save(task);

        // Notify appropriately
        try {
            if (isAssignedTo && !isCreatedBy) {
                // Assignee updated it, notify creator
                notificationService.send(
                        task.getCreatedBy(),
                        "Task Progress Updated",
                        "Progress update by " + requester.getName() + " on task '" + task.getTitle() +
                                "': " + achievedWork + "/" + (target != null ? target : "NA") +
                                " (" + task.getProgress() + "%)",
                        NotificationType.TASK_COMPLETED,
                        task.getId()
                );
            } else if (isCreatedBy && !isAssignedTo) {
                // Creator updated it, notify assignee
                notificationService.send(
                        task.getAssignedTo(),
                        "Task Progress Modified",
                        "Progress update modified by Assigner on task '" + task.getTitle() +
                                "': " + achievedWork + "/" + (target != null ? target : "NA") +
                                " (" + task.getProgress() + "%)",
                        NotificationType.TASK_COMPLETED,
                        task.getId()
                );
            }
            
        } catch (Exception e) {
            // Silently log and allow transaction to complete if DB schema is outdated
            System.err.println("Notification failed (DB Schema mismatch): " + e.getMessage());
        }

        return TaskResponse.from(saved);
    }

    // ═══════════════════════════════════════════════════
    // ADD REMARK
    // ═══════════════════════════════════════════════════

    public TaskRemark addRemark(Long taskId, String remarkText, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only remark on their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedTo().getUserID().equals(requesterId)) {
            throw new RuntimeException(
                    "Access Denied: This task is not assigned to you");
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

    public DashboardResponse getDashboard(String finalUserId) {
        User requester = findUser(finalUserId);

        long total, pending, inProgress, completed, overdue;

        if (requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {

            // Admin sees stats of ALL tasks
            total = taskRepository.count();
            pending = taskRepository.countByStatus(TaskStatus.PENDING);
            inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
            completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
            overdue = taskRepository.countByStatus(TaskStatus.OVERDUE);

        } else {

            // Everyone else sees stats only for their own associated tasks
            total = taskRepository.countAssociatedTasks(requester);
            pending = taskRepository.countAssociatedTasksByStatus(requester, TaskStatus.PENDING);
            inProgress = taskRepository.countAssociatedTasksByStatus(requester, TaskStatus.IN_PROGRESS);
            completed = taskRepository.countAssociatedTasksByStatus(requester, TaskStatus.COMPLETED);
            overdue = taskRepository.countAssociatedTasksByStatus(requester, TaskStatus.OVERDUE);
        }

        return new DashboardResponse(total, pending, inProgress, completed, overdue);
    }

    // ═══════════════════════════════════════════════════
    // OVERDUE CHECK — called by scheduler at midnight
    // ═══════════════════════════════════════════════════

    public void markOverdueTasks() {
        List<Task> overdueTasks = taskRepository.findTasksThatBecameOverdue(LocalDate.now());

        for (Task task : overdueTasks) {
            task.setStatus(TaskStatus.OVERDUE);
            taskRepository.save(task);

            // Notify assignee
            notificationService.sendUnique(
                    task.getAssignedTo(),
                    "Task Overdue",
                    "OVERDUE: Task '" + task.getTitle() + "' has passed its due date!",
                    NotificationType.TASK_OVERDUE,
                    task.getId());

            // Notify creator
            notificationService.sendUnique(
                    task.getCreatedBy(),
                    "Task Overdue Alert",
                    "Task is overdue: '" + task.getTitle() +
                            "' assigned to " + task.getAssignedTo().getName(),
                    NotificationType.TASK_OVERDUE,
                    task.getId());
        }
    }

    // ═══════════════════════════════════════════════════
    // DUE SOON — called by scheduler at 8 AM
    // ═══════════════════════════════════════════════════

    public void sendDueSoonNotifications() {
        // Requirement: Due within next 24 hours (1 day)
        List<Task> dueSoon = taskRepository.findTasksDueSoon(
                LocalDate.now(),
                LocalDate.now().plusDays(1));

        for (Task task : dueSoon) {
            notificationService.sendUnique(
                    task.getAssignedTo(),
                    "Upcoming Task Due Date",
                    "Reminder: Task '" + task.getTitle() +
                            "' is due on " + task.getDueDate(),
                    NotificationType.TASK_DUE_SOON,
                    task.getId());
        }
    }

    // ═══════════════════════════════════════════════════
    // HELPER METHODS — used internally by all methods above
    // ═══════════════════════════════════════════════════

    private User findUser(String finalUserId) {
        return userRepository.findByUserID(finalUserId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with ID: " + finalUserId));
    }

    private Task findTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found with ID: " + taskId));
    }
}
