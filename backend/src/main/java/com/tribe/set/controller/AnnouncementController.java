package com.tribe.set.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.dto.CreateAnnouncementRequest;
import com.tribe.set.entity.Announcement;
import com.tribe.set.service.AnnouncementService;
import com.tribe.set.service.AnnouncementService.AnnouncementDTO;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin("*")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping(value = "/create", consumes = { "multipart/form-data" })
    public ResponseEntity<Announcement> createAnnouncement(
            @RequestPart("announcement") @Valid CreateAnnouncementRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request, file));
    }

    @GetMapping("/list")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncements(@RequestParam(name = "userId") String userId) {
        return ResponseEntity.ok(announcementService.getAnnouncementsForUser(userId));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<AnnouncementDTO>> getSentAnnouncements(@RequestParam(name = "userId") String userId) {
        return ResponseEntity.ok(announcementService.getSentAnnouncements(userId));
    }

    @GetMapping("/{id}/acknowledgments")
    public ResponseEntity<List<AnnouncementService.AcknowledgmentDetailDTO>> getAcknowledgmentDetails(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(announcementService.getAcknowledgmentDetails(id));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<String> acknowledgeAnnouncement(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "userId") String userId) {
        announcementService.acknowledgeAnnouncement(id, userId);
        return ResponseEntity.ok("Acknowledged successfully");
    }
}
