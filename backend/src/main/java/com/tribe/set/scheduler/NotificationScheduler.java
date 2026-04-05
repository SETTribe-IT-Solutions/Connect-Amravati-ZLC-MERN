package com.tribe.set.scheduler;

import com.tribe.set.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    @Autowired
    private TaskService taskService;

    /**
     * Runs every hour to check for overdue tasks and tasks due soon.
     * Cron: "0 0 * * * *" (top of every hour)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void hourlyNotificationChecks() {
        System.out.println("Running hourly notification checks...");
        
        // 1. Mark tasks as overdue and notify both assignee and assigner
        taskService.markOverdueTasks();
        
        // 2. Send reminders for tasks due within the next 2 days
        taskService.sendDueSoonNotifications();
    }
}