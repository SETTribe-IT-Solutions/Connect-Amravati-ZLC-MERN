package com.tribe.set.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tribe.set.entity.AnnouncementAcknowledgment;
import com.tribe.set.entity.Announcement;
import com.tribe.set.entity.User;

@Repository
public interface AnnouncementAcknowledgmentRepository extends JpaRepository<AnnouncementAcknowledgment, Long> {
    Optional<AnnouncementAcknowledgment> findByAnnouncementIdAndUserId(Long announcementId, String userId);
    List<AnnouncementAcknowledgment> findAllByUserId(String userId);
    boolean existsByAnnouncementIdAndUserId(Long announcementId, String userId);
    long countByAnnouncementId(Long announcementId);
    List<AnnouncementAcknowledgment> findByAnnouncementIdOrderByCreatedAtDesc(Long announcementId);
}
