package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.tribe.set.dto.CreateAnnouncementRequest;
import com.tribe.set.service.AnnouncementService;
import com.tribe.set.service.AnnouncementService.AnnouncementDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping(value = "/create", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @RequestPart("announcement") @Valid CreateAnnouncementRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request, file));
    }

    @GetMapping("/list")
    @PreAuthorize("authenticated")
    public ResponseEntity<Page<AnnouncementDTO>> getAnnouncements(
            @RequestParam(name = "userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(announcementService.getAnnouncementsForUser(userId, pageable));
    }

    @GetMapping("/sent")
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Page<AnnouncementDTO>> getSentAnnouncements(
            @RequestParam(name = "userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(announcementService.getSentAnnouncements(userId, pageable));
    }

    @GetMapping("/{id}/acknowledgments")
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<AnnouncementService.AcknowledgmentDetailDTO>> getAcknowledgmentDetails(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(announcementService.getAcknowledgmentDetails(id));
    }

    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("authenticated")
    public ResponseEntity<String> acknowledgeAnnouncement(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "userId") String userId) {
        announcementService.acknowledgeAnnouncement(id, userId);
        return ResponseEntity.ok("Acknowledged successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "userId") String userId,
            @RequestBody UpdateRequest request) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, userId, request.getTitle(), request.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COLLECTOR', 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO', 'TEHSILDAR', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<String> deleteAnnouncement(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "userId") String userId) {
        announcementService.deleteAnnouncement(id, userId);
        return ResponseEntity.ok("Deleted successfully");
    }

    public static class UpdateRequest {
        private String title;
        private String message;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
