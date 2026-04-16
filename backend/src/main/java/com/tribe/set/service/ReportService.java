package com.tribe.set.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.entity.Role;
import com.tribe.set.entity.Task;
import com.tribe.set.entity.TaskStatus;
import com.tribe.set.entity.User;
import com.tribe.set.repository.TaskRepository;
import com.tribe.set.repository.UserRepository;
import com.tribe.set.dto.GlobalStatsDTO;
import com.tribe.set.dto.PerformanceReportDTO;

@Service
public class ReportService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public GlobalStatsDTO getGlobalStats(String requesterId) {
        checkAccess(requesterId);
        List<Task> allTasks = taskRepository.findAll();

        long total = allTasks.size();
        long completed = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pending = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long progress = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

        double completionRate = Math.round((total > 0 ? (double) completed / total * 100 : 0) * 10.0) / 10.0;

        return new GlobalStatsDTO(total, completed, pending, progress, overdue, completionRate);
    }

    public List<PerformanceReportDTO> getPerformanceReport(String requesterId) {
        checkAccess(requesterId);

        List<Task> allTasks = taskRepository.findAll();

        // Group tasks by which user they are assigned to
        Map<String, List<Task>> tasksByUser = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignedTo().getUserID()));

        List<PerformanceReportDTO> performanceList = new ArrayList<>();

        for (Entry<String, List<Task>> entry : tasksByUser.entrySet()) {
            List<Task> userTasks = entry.getValue();
            User assignee = userTasks.get(0).getAssignedTo();

            long total = userTasks.size();
            long completed = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            long overdue = userTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();

            double efficiency = total > 0 ? (double) completed / total * 100 : 0;
            efficiency = Math.round(efficiency * 100.0) / 100.0;

            performanceList.add(new PerformanceReportDTO(
                assignee.getUserID(),
                assignee.getName(),
                assignee.getRole(),
                total,
                completed,
                overdue,
                efficiency
            ));
        }

        return performanceList;
    }

    private void checkAccess(String requesterId) {
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
