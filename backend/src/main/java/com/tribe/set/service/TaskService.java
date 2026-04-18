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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        // Build Task object
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
        task.setCreatedByUserId(creatorId);
        task.setAssignedToUserId(request.getAssignedTo());

        // Handle file upload
        if (file != null && !file.isEmpty()) {
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            }

            // Backend validation
            if (!extension.matches("^\\.(jpg|jpeg|png|gif|pdf|doc|docx)$")) {
                throw new RuntimeException("Validation Error: Invalid file type. Only JPG, JPEG, PNG, GIF, PDF, DOC, and DOCX are allowed.");
            }

            try {
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
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
                request.getAssignedTo(),
                "New Task Assigned",
                "New task assigned to you by " + creator.getName() +
                        " (" + creator.getRole() + "): " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return convertToResponse(saved);
    }

    private TaskResponse convertToResponse(Task task) {
        User creator = userRepository.findByUserID(task.getCreatedByUserId()).orElse(null);
        User assignee = userRepository.findByUserID(task.getAssignedToUserId()).orElse(null);
        List<TaskRemark> remarks = remarkRepository.findByTaskIdOrderByCreatedAtDesc(task.getId());

        java.util.Set<String> authorIds = remarks.stream().map(TaskRemark::getAddedByUserId).collect(Collectors.toSet());
        java.util.Map<String, User> authors = userRepository.findAllByUserIDIn(authorIds).stream()
                .collect(Collectors.toMap(User::getUserID, u -> u));

        return TaskResponse.from(task, creator, assignee, remarks, authors);
    }

    // ═══════════════════════════════════════════════════
    // REASSIGN TASK
    // ═══════════════════════════════════════════════════

	public TaskResponse reassignTask(Long taskId, String newAssigneeId, String requesterId) {

        User requester = findUser(requesterId);
        Task task = findTask(taskId);
        User newAssignee = findUser(newAssigneeId);

        boolean isCreator = task.getCreatedByUserId().equals(requesterId);
        
        // Fetch current assignee to check hierarchy
        User currentAssignee = userRepository.findByUserID(task.getAssignedToUserId())
                .orElseThrow(() -> new RuntimeException("Current assignee not found"));
                
        boolean isHigher = requester.getRole().canAllocateTask() &&
                requester.getRole().canAssignTo(currentAssignee.getRole());

        if (!isCreator && !isHigher) {
            throw new RuntimeException("Access Denied: You cannot reassign this task");
        }

        if (!requester.getRole().canAssignTo(newAssignee.getRole())) {
            throw new RuntimeException(
                    "Access Denied: " + requester.getRole() +
                            " cannot assign tasks to " + newAssignee.getRole());
        }

        String oldAssigneeId = task.getAssignedToUserId();
        task.setAssignedToUserId(newAssigneeId);
        task.setStatus(TaskStatus.PENDING);

        // Reset appreciation status for new assignee
        newAssignee.setIsAppreciated(false);
        userRepository.save(newAssignee);

        Task saved = taskRepository.save(task);

        // Notify old assignee
        notificationService.send(
                oldAssigneeId,
                "Task Reassigned",
                "Task reassigned away from you: " + task.getTitle(),
                NotificationType.TASK_REASSIGNED,
                saved.getId());

        // Notify new assignee
        notificationService.send(
                newAssigneeId,
                "New Task Assigned",
                "Task reassigned to you by " + requester.getName() +
                        ": " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return convertToResponse(saved);
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
        boolean isAssignee = task.getAssignedToUserId().equals(requesterId);

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

        String oldAssigneeId = task.getAssignedToUserId();
        task.setAssignedToUserId(newAssigneeId);

        // Reset appreciation status for new assignee
        newAssignee.setIsAppreciated(false);
        userRepository.save(newAssignee);

        Task saved = taskRepository.save(task);

        // Add a remark that it was forwarded
        TaskRemark remark = new TaskRemark();
        remark.setTaskId(saved.getId());
        remark.setAddedByUserId(requesterId);
        remark.setRemark(
                requester.getName() + " (" + requester.getRole() + ") forwarded this task to " + newAssignee.getName());
        remarkRepository.save(remark);

        // Notify old assignee (if not the requester)
        if (!oldAssigneeId.equals(requesterId)) {
            notificationService.send(
                    oldAssigneeId,
                    "Task Forwarded",
                    "Your task was forwarded to someone else: " + task.getTitle(),
                    NotificationType.TASK_REASSIGNED,
                    saved.getId());
        }

        // Notify new assignee
        notificationService.send(
                newAssigneeId,
                "Task Forwarded",
                requester.getRole() + " " + requester.getName() + " forwarded a task to you: " + task.getTitle(),
                NotificationType.TASK_ASSIGNED,
                saved.getId());

        return convertToResponse(saved);
    }

    // ═══════════════════════════════════════════════════
    // GET TASKS
    // ═══════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(String finalUserId, Pageable pageable) {
        User requester = findUser(finalUserId);

        Page<Task> tasks;

        if (requester.getRole() == Role.SYSTEM_ADMINISTRATOR) {
            // Only system administrator sees all tasks
            tasks = taskRepository.findAll(pageable);
        } else {
            // Everyone else sees only tasks assigned to them or forwarded/created by them
            tasks = taskRepository.findByAssignedToUserIdOrCreatedByUserIdOrderByCreatedAtDesc(finalUserId, finalUserId, pageable);
        }

        return tasks.map(this::convertToResponse);
    }

    // ═══════════════════════════════════════════════════
    // GET SINGLE TASK
    // ═══════════════════════════════════════════════════

    public TaskResponse getTaskById(Long taskId, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only see their own tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedToUserId().equals(requesterId)) {
            throw new RuntimeException(
                    "Access Denied: This task is not assigned to you");
        }

        return convertToResponse(task);
    }

    // ═══════════════════════════════════════════════════
    // UPDATE TASK STATUS
    // ═══════════════════════════════════════════════════

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only update their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedToUserId().equals(requesterId)) {
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
                    task.getCreatedByUserId(),
                    "Task Completed",
                    "Task completed by " + requester.getName() +
                            " (" + requester.getRole() + "): " + task.getTitle(),
                    NotificationType.TASK_COMPLETED,
                    task.getId());
        }

        return convertToResponse(saved);
    }

    // ═══════════════════════════════════════════════════
    // UPDATE TASK PROGRESS
    // ═══════════════════════════════════════════════════

    public TaskResponse updateTaskProgress(Long taskId, Double achievedWorkInput, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        if (achievedWorkInput == null) {
            throw new RuntimeException("Achievement value is required.");
        }
        if (achievedWorkInput % 1 != 0) {
            throw new RuntimeException("Validation Error: Decimal values are not allowed for achievement updates.");
        }
        int achievedWork = achievedWorkInput.intValue();

        boolean isAssignedTo = task.getAssignedToUserId().equals(requesterId);
        boolean isCreatedBy = task.getCreatedByUserId().equals(requesterId);

        // ONLY the assigned user or the creator can update the progress
        if (!isAssignedTo && !isCreatedBy) {
            throw new RuntimeException("Access Denied: Only the assigned user or the assigner can update this task's progress.");
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
                        task.getCreatedByUserId(),
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
                        task.getAssignedToUserId(),
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

        return convertToResponse(saved);
    }

    // ═══════════════════════════════════════════════════
    // ADD REMARK
    // ═══════════════════════════════════════════════════

    public RemarkResponse addRemark(Long taskId, String remarkText, String requesterId) {
        User requester = findUser(requesterId);
        Task task = findTask(taskId);

        // Field officers can only remark on their OWN tasks
        if (requester.getRole().isFieldOfficer() &&
                !task.getAssignedToUserId().equals(requesterId)) {
            throw new RuntimeException(
                    "Access Denied: This task is not assigned to you");
        }

        TaskRemark remark = new TaskRemark();
        remark.setTaskId(taskId);
        remark.setAddedByUserId(requesterId);
        remark.setRemark(remarkText);

        return RemarkResponse.from(remarkRepository.save(remark), requester);
    }

    // ═══════════════════════════════════════════════════
    // GET REMARKS
    // ═══════════════════════════════════════════════════

    public List<RemarkResponse> getRemarks(Long taskId) {
        List<TaskRemark> remarks = remarkRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        
        java.util.Set<String> authorIds = remarks.stream().map(TaskRemark::getAddedByUserId).collect(Collectors.toSet());
        java.util.Map<String, User> userMap = userRepository.findAllByUserIDIn(authorIds).stream()
                .collect(Collectors.toMap(User::getUserID, u -> u));

        return remarks.stream()
                .map(r -> RemarkResponse.from(r, userMap.get(r.getAddedByUserId())))
                .collect(Collectors.toList());
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
            total = taskRepository.countAssociatedTasks(finalUserId);
            pending = taskRepository.countAssociatedTasksByStatus(finalUserId, TaskStatus.PENDING);
            inProgress = taskRepository.countAssociatedTasksByStatus(finalUserId, TaskStatus.IN_PROGRESS);
            completed = taskRepository.countAssociatedTasksByStatus(finalUserId, TaskStatus.COMPLETED);
            overdue = taskRepository.countAssociatedTasksByStatus(finalUserId, TaskStatus.OVERDUE);
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

            // Fetch assignee and creator for notification messages
            User assignee = userRepository.findByUserID(task.getAssignedToUserId()).orElse(null);
            User creator = userRepository.findByUserID(task.getCreatedByUserId()).orElse(null);

            // Notify assignee
            notificationService.sendUnique(
                    task.getAssignedToUserId(),
                    "Task Overdue",
                    "OVERDUE: Task '" + task.getTitle() + "' has passed its due date!",
                    NotificationType.TASK_OVERDUE,
                    task.getId());

            // Notify creator
            if (creator != null) {
                notificationService.sendUnique(
                        task.getCreatedByUserId(),
                        "Task Overdue Alert",
                        "Task is overdue: '" + task.getTitle() +
                                "' assigned to " + (assignee != null ? assignee.getName() : "Unknown"),
                        NotificationType.TASK_OVERDUE,
                        task.getId());
            }
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
                    task.getAssignedToUserId(),
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
