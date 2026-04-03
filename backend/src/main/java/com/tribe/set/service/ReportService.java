package com.tribe.set.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.entity.Role;
import com.tribe.set.entity.Task;
import com.tribe.set.entity.TaskStatus;
import com.tribe.set.entity.User;
import com.tribe.set.repository.TaskRepository;
import com.tribe.set.repository.UserRepository;

@Service
public class ReportService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getGlobalStats(Long requesterId) {
        checkAccess(requesterId);
        List<Task> allTasks = taskRepository.findAll();

        long total = allTasks.size();
        long completed = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pending = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long progress = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("completed", completed);
        stats.put("pending", pending);
        stats.put("inProgress", progress);
        stats.put("overdue", overdue);
        stats.put("completionRate", Math.round((total > 0 ? (double) completed / total * 100 : 0) * 10.0) / 10.0);

        return stats;
    }

    public List<Map<String, Object>> getPerformanceReport(Long requesterId) {
        checkAccess(requesterId);

        List<Task> allTasks = taskRepository.findAll();

        // Group tasks by which user they are assigned to
        Map<Long, List<Task>> tasksByUser = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignedTo().getUserID()));

        List<Map<String, Object>> performanceList = new ArrayList<>();

        for (Map.Entry<Long, List<Task>> entry : tasksByUser.entrySet()) {
            List<Task> userTasks = entry.getValue();
            User assignee = userTasks.get(0).getAssignedTo();

            long total = userTasks.size();
            long completed = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            long overdue = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

            double efficiency = total > 0 ? (double) completed / total * 100 : 0;

            Map<String, Object> stats = new HashMap<>();
            stats.put("userId", assignee.getUserID());
            stats.put("userName", assignee.getName());
            stats.put("role", assignee.getRole());
            stats.put("totalTasks", total);
            stats.put("completedTasks", completed);
            stats.put("overdueTasks", overdue);
            stats.put("efficiency", Math.round(efficiency * 100.0) / 100.0);

            performanceList.add(stats);
        }

        return performanceList;
    }

    private void checkAccess(Long requesterId) {
        User requester = userRepository.findByUserID(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + requesterId));

        // Allow access if user is System Admin, can allocate tasks (Higher officials),
        // or is a Field Officer (BDO, Talathi, Gramsevak)
        if (!requester.getRole().canAllocateTask() &&
                !requester.getRole().isFieldOfficer() &&
                requester.getRole() != Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Access Denied: You do not have permission to view reports.");
        }
    }
}
