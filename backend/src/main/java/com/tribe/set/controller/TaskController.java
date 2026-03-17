package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.Entity.TaskRemark;
import com.tribe.set.dto.DashboardResponse;
import com.tribe.set.dto.RemarkRequest;
import com.tribe.set.dto.TaskRequest;
import com.tribe.set.dto.TaskResponse;
import com.tribe.set.dto.TaskStatusRequest;
import com.tribe.set.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin("*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // requesterId comes from JSON body (inside TaskRequest)
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request) {

        return ResponseEntity.ok(taskService.createTask(request, request.getRequesterId()));
    }

    // GET has no body — requesterId stays as @RequestParam
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(@RequestParam Long requesterId) {
        return ResponseEntity.ok(taskService.getTasks(requesterId));
    }

    // requesterId comes from JSON body (inside TaskStatusRequest)
    @PutMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusRequest request) {

        return ResponseEntity.ok(taskService.updateTaskStatus(id, request.getStatus(), request.getRequesterId()));
    }

    // requesterId comes from JSON body (inside RemarkRequest)
    @PostMapping("/{id}/remark")
    public ResponseEntity<TaskRemark> addRemark(
            @PathVariable Long id,
            @Valid @RequestBody RemarkRequest request) {

        return ResponseEntity.ok(taskService.addRemark(id, request.getRemark(), request.getRequesterId()));
    }

    // GET has no body — requesterId stays as @RequestParam
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(@RequestParam Long requesterId) {
        return ResponseEntity.ok(taskService.getDashboard(requesterId));
    }
}
