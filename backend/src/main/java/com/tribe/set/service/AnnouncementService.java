package com.tribe.set.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tribe.set.entity.Announcement;
import com.tribe.set.entity.AnnouncementAcknowledgment;
import com.tribe.set.entity.User;
import com.tribe.set.entity.Role;
import com.tribe.set.dto.CreateAnnouncementRequest;
import com.tribe.set.repository.AnnouncementRepository;
import com.tribe.set.repository.AnnouncementAcknowledgmentRepository;
import com.tribe.set.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AnnouncementService {

    private final String uploadDir = "uploads/";

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementAcknowledgmentRepository acknowledgmentRepository;
    private final UserRepository userRepository;

    @Autowired
    public AnnouncementService(AnnouncementRepository announcementRepository,
                               AnnouncementAcknowledgmentRepository acknowledgmentRepository,
                               UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.acknowledgmentRepository = acknowledgmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Announcement createAnnouncement(CreateAnnouncementRequest request, MultipartFile file) {
        User creator = userRepository.findByUserID(request.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        // Validation: Only senior officials can send
        Role creatorRole = creator.getRole();
        if (creatorRole.getLevel() > 4) {
            throw new RuntimeException("Only senior officials (Collector, Additional Collector, SDO, Tehsildar) can send communications.");
        }

        // Validation: Cannot send to same or higher level
        if (request.getTargetRole() != null) {
            if (creatorRole.getLevel() >= request.getTargetRole().getLevel()) {
                throw new RuntimeException("You cannot send communications to officials at or above your level.");
            }
        }

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setMessage(request.getMessage());
        announcement.setTargetRole(request.getTargetRole());
        announcement.setTargetTaluka(request.getTargetTaluka());
        announcement.setTargetVillage(request.getTargetVillage());
        announcement.setCreatedBy(creator);
        announcement.setCircular(request.isCircular());

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
                    extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
                }

                // File format validation
                java.util.List<String> allowedExtensions = java.util.Arrays.asList(".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".jpg", ".jpeg", ".png");
                if (extension.isEmpty() || !allowedExtensions.contains(extension)) {
                    throw new RuntimeException("Invalid file format. Allowed: pdf, doc, docx, xls, xlsx, csv, txt, jpg, jpeg, png");
                }

                // File size validation (10 MB)
                if (file.getSize() > 10 * 1024 * 1024) {
                    throw new RuntimeException("File size must be less than 10MB");
                }

                String uniqueFileName = UUID.randomUUID().toString() + extension;
                Path filePath = uploadPath.resolve(uniqueFileName).toAbsolutePath();
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                announcement.setAttachment(uniqueFileName);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store file: " + e.getMessage());
            }
        }
        
        return announcementRepository.save(announcement);
    }

    public List<AnnouncementDTO> getAnnouncementsForUser(String userId) {
        User user = userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Announcement> announcements = announcementRepository.findForUser(
                user.getUserID(), user.getRole(), user.getTaluka(), user.getVillage());

        return announcements.stream().map(a -> {
            boolean acknowledged = acknowledgmentRepository.existsByAnnouncementAndUser(a, user);
            return new AnnouncementDTO(a, acknowledged, acknowledgmentRepository.countByAnnouncement(a));
        }).collect(Collectors.toList());
    }

    public List<AnnouncementDTO> getSentAnnouncements(String userId) {
        User user = userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Announcement> announcements = announcementRepository.findByCreatedBy_UserIDOrderByCreatedAtDesc(userId);

        return announcements.stream().map(a -> {
            boolean acknowledged = acknowledgmentRepository.existsByAnnouncementAndUser(a, user);
            return new AnnouncementDTO(a, acknowledged, acknowledgmentRepository.countByAnnouncement(a));
        }).collect(Collectors.toList());
    }

    public List<AcknowledgmentDetailDTO> getAcknowledgmentDetails(Long announcementId) {
        List<AnnouncementAcknowledgment> acks = acknowledgmentRepository.findByAnnouncementIdOrderByAcknowledgedAtDesc(announcementId);
        return acks.stream().map(AcknowledgmentDetailDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public void acknowledgeAnnouncement(Long announcementId, String userId) {
        User user = userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (!acknowledgmentRepository.existsByAnnouncementAndUser(announcement, user)) {
            AnnouncementAcknowledgment acknowledgment = new AnnouncementAcknowledgment(announcement, user);
            acknowledgmentRepository.save(acknowledgment);
        }
    }

    @Transactional
    public Announcement updateAnnouncement(Long announcementId, String userId, String title, String message) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
                
        if (!announcement.getCreatedBy().getUserID().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own communications");
        }
        
        announcement.setTitle(title);
        announcement.setMessage(message);
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId, String userId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
                
        if (!announcement.getCreatedBy().getUserID().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own communications");
        }
        
        // Remove acknowledgments first to respect foreign keys (if cascade type doesn't handle it)
        List<AnnouncementAcknowledgment> acks = acknowledgmentRepository.findByAnnouncementIdOrderByAcknowledgedAtDesc(announcementId);
        acknowledgmentRepository.deleteAll(acks);
        
        announcementRepository.delete(announcement);
    }

    // Inner class for DTO since we're not using Lombok
    public static class AnnouncementDTO {
        private Long id;
        private String title;
        private String message;
        private String creatorName;
        private String creatorRole;
        private String createdAt;
        private boolean acknowledged;
        private long acknowledgmentCount;
        private String targetRole;
        private String targetTaluka;
        private String targetVillage;
        private boolean isCircular;
        private String attachment;

        public AnnouncementDTO(Announcement a, boolean acknowledged, long acknowledgmentCount) {
            this.id = a.getId();
            this.title = a.getTitle();
            this.message = a.getMessage();
            this.creatorName = a.getCreatedBy() != null ? a.getCreatedBy().getName() : "System";
            this.creatorRole = a.getCreatedBy() != null ? a.getCreatedBy().getRole().toString() : "ADMIN";
            this.createdAt = a.getCreatedAt().toString();
            this.acknowledged = acknowledged;
            this.acknowledgmentCount = acknowledgmentCount;
            this.targetRole = a.getTargetRole() != null ? a.getTargetRole().toString() : "ALL ROLES";
            this.targetTaluka = a.getTargetTaluka() != null ? a.getTargetTaluka() : "ALL TALUKAS";
            this.targetVillage = a.getTargetVillage() != null ? a.getTargetVillage() : "ALL VILLAGES";
            this.isCircular = a.isCircular();
            this.attachment = a.getAttachment();
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public String getCreatorName() { return creatorName; }
        public String getCreatorRole() { return creatorRole; }
        public String getCreatedAt() { return createdAt; }
        public boolean isAcknowledged() { return acknowledged; }
        public long getAcknowledgmentCount() { return acknowledgmentCount; }
        public String getTargetRole() { return targetRole; }
        public String getTargetTaluka() { return targetTaluka; }
        public String getTargetVillage() { return targetVillage; }
        public boolean isCircular() { return isCircular; }
        public String getAttachment() { return attachment; }
    }

    public static class AcknowledgmentDetailDTO {
        private String userName;
        private String userRole;
        private String taluka;
        private String village;
        private String acknowledgedAt;

        public AcknowledgmentDetailDTO(AnnouncementAcknowledgment ack) {
            this.userName = ack.getUser().getName();
            this.userRole = ack.getUser().getRole().toString();
            this.taluka = ack.getUser().getTaluka() != null ? ack.getUser().getTaluka() : "N/A";
            this.village = ack.getUser().getVillage() != null ? ack.getUser().getVillage() : "N/A";
            this.acknowledgedAt = ack.getAcknowledgedAt().toString();
        }

        public String getUserName() { return userName; }
        public String getUserRole() { return userRole; }
        public String getTaluka() { return taluka; }
        public String getVillage() { return village; }
        public String getAcknowledgedAt() { return acknowledgedAt; }
    }
}
