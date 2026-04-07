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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

import com.tribe.set.entity.TaskRemark;
import com.tribe.set.dto.DashboardResponse;
import com.tribe.set.dto.RemarkRequest;
import com.tribe.set.dto.TaskRequest;
import com.tribe.set.dto.TaskResponse;
import com.tribe.set.dto.TaskStatusRequest;
import com.tribe.set.dto.ForwardRequest;
import com.tribe.set.dto.TaskProgressUpdateRequest;
import com.tribe.set.security.UserDetailsImpl;
import com.tribe.set.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin("*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR')")
    public ResponseEntity<TaskResponse> createTask(
            @RequestPart("task") @Valid TaskRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(taskService.createTask(request, request.getRequesterId(), file));
    }

    // GET accepts a requesterId as a fallback if Authentication is stale in the environment
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskResponse>> getTasks(
            Authentication authentication,
            @RequestParam(name = "requesterId", required = false) String requesterId) {
        
        String finalUserId = (requesterId != null) ? requesterId : ((UserDetailsImpl) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(taskService.getTasks(finalUserId));
    }

    // requesterId comes from JSON body (inside TaskStatusRequest)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('BDO', 'TALATHI', 'GRAMSEVAK', 'COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody TaskStatusRequest request) {

        return ResponseEntity.ok(taskService.updateTaskStatus(id, request.getStatus(), request.getRequesterId()));
    }

    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('BDO', 'TALATHI', 'GRAMSEVAK', 'COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TaskResponse> updateProgress(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody TaskProgressUpdateRequest request) {

        return ResponseEntity.ok(taskService.updateTaskProgress(id, request.getAchieved(), request.getRequesterId()));
    }

    // requesterId comes from JSON body (inside RemarkRequest)
    @PostMapping("/{id}/remark")
    @PreAuthorize("hasAnyRole('BDO', 'TALATHI', 'GRAMSEVAK', 'COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TaskRemark> addRemark(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody RemarkRequest request) {

        return ResponseEntity.ok(taskService.addRemark(id, request.getRemark(), request.getRequesterId()));
    }

    // GET dashboard stats using requesterId from the client to ensure sync
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication,
            @RequestParam(name = "requesterId", required = false) String requesterId) {
        
        String finalUserId = (requesterId != null) ? requesterId : ((UserDetailsImpl) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(taskService.getDashboard(finalUserId));
    }

    // requesterId comes from JSON body (inside ForwardRequest)
    @PutMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('BDO', 'TALATHI', 'GRAMSEVAK', 'COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TaskResponse> forwardTask(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody ForwardRequest request) {

        return ResponseEntity.ok(taskService.forwardTask(id, request.getForwardToId(), request.getRequesterId()));
    }
}
