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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import java.time.LocalDate;

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
    public AnnouncementDTO createAnnouncement(CreateAnnouncementRequest request, MultipartFile file) {
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
        announcement.setCreatedByUserId(request.getRequesterId());
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
        
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return new AnnouncementDTO(savedAnnouncement, creator, false, 0);
    }

    public Page<AnnouncementDTO> getAnnouncementsForUser(String userId, String status, LocalDate date, Integer month, Integer year, Pageable pageable) {
        User user = userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<Announcement> announcements;
        if ("acknowledged".equalsIgnoreCase(status)) {
            announcements = announcementRepository.findAcknowledgedForUser(
                    user.getUserID(), user.getRole(), user.getTaluka(), user.getVillage(), date, month, year, pageable);
        } else {
            announcements = announcementRepository.findUnacknowledgedForUser(
                    user.getUserID(), user.getRole(), user.getTaluka(), user.getVillage(), date, month, year, pageable);
        }

        // Fetch all creators in bulk to avoid N+1
        java.util.Set<String> creatorIds = announcements.stream().map(Announcement::getCreatedByUserId).collect(Collectors.toSet());
        java.util.Map<String, User> creatorMap = userRepository.findAllByUserIDIn(creatorIds).stream()
                .collect(Collectors.toMap(User::getUserID, u -> u));

        return announcements.map(a -> {
            boolean acknowledged = acknowledgmentRepository.existsByAnnouncementIdAndUserId(a.getId(), userId);
            User creator = creatorMap.get(a.getCreatedByUserId());
            return new AnnouncementDTO(a, creator, acknowledged, acknowledgmentRepository.countByAnnouncementId(a.getId()));
        });
    }

    public Page<AnnouncementDTO> getSentAnnouncements(String userId, LocalDate date, Integer month, Integer year, Pageable pageable) {
        User user = userRepository.findByUserID(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<Announcement> announcements = announcementRepository.findSentByUserId(userId, date, month, year, pageable);

        return announcements.map(a -> {
            boolean acknowledged = acknowledgmentRepository.existsByAnnouncementIdAndUserId(a.getId(), userId);
            return new AnnouncementDTO(a, user, acknowledged, acknowledgmentRepository.countByAnnouncementId(a.getId()));
        });
    }

    public List<AcknowledgmentDetailDTO> getAcknowledgmentDetails(Long announcementId) {
        List<AnnouncementAcknowledgment> acks = acknowledgmentRepository.findByAnnouncementIdOrderByAcknowledgedAtDesc(announcementId);
        
        java.util.Set<String> userIds = acks.stream().map(AnnouncementAcknowledgment::getUserId).collect(Collectors.toSet());
        java.util.Map<String, User> userMap = userRepository.findAllByUserIDIn(userIds).stream()
                .collect(Collectors.toMap(User::getUserID, u -> u));

        return acks.stream().map(ack -> new AcknowledgmentDetailDTO(ack, userMap.get(ack.getUserId()))).collect(Collectors.toList());
    }

    @Transactional
    public void acknowledgeAnnouncement(Long announcementId, String userId) {
        if (!acknowledgmentRepository.existsByAnnouncementIdAndUserId(announcementId, userId)) {
            AnnouncementAcknowledgment acknowledgment = new AnnouncementAcknowledgment(announcementId, userId);
            acknowledgmentRepository.save(acknowledgment);
        }
    }

    @Transactional
    public AnnouncementDTO updateAnnouncement(Long announcementId, String userId, String title, String message) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
                
        if (!announcement.getCreatedByUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own communications");
        }
        
        announcement.setTitle(title);
        announcement.setMessage(message);
        Announcement updated = announcementRepository.save(announcement);
        
        User creator = userRepository.findByUserID(userId).orElse(null);
        boolean acknowledged = acknowledgmentRepository.existsByAnnouncementIdAndUserId(updated.getId(), userId);
        long count = acknowledgmentRepository.countByAnnouncementId(updated.getId());
        return new AnnouncementDTO(updated, creator, acknowledged, count);
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId, String userId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
                
        if (!announcement.getCreatedByUserId().equals(userId)) {
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

        public AnnouncementDTO(Announcement a, User creator, boolean acknowledged, long acknowledgmentCount) {
            this.id = a.getId();
            this.title = a.getTitle();
            this.message = a.getMessage();
            this.creatorName = creator != null ? creator.getName() : "System";
            this.creatorRole = creator != null ? creator.getRole().toString() : "ADMIN";
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

        public AcknowledgmentDetailDTO(AnnouncementAcknowledgment ack, User user) {
            this.userName = user != null ? user.getName() : "Unknown";
            this.userRole = user != null ? user.getRole().toString() : "N/A";
            this.taluka = (user != null && user.getTaluka() != null) ? user.getTaluka() : "N/A";
            this.village = (user != null && user.getVillage() != null) ? user.getVillage() : "N/A";
            this.acknowledgedAt = ack.getAcknowledgedAt().toString();
        }

        public String getUserName() { return userName; }
        public String getUserRole() { return userRole; }
        public String getTaluka() { return taluka; }
        public String getVillage() { return village; }
        public String getAcknowledgedAt() { return acknowledgedAt; }
    }
}
