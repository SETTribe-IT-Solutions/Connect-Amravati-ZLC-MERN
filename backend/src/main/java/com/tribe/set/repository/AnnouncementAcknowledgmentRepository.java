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
    Optional<AnnouncementAcknowledgment> findByAnnouncementAndUser(Announcement announcement, User user);
    List<AnnouncementAcknowledgment> findAllByUser(User user);
    boolean existsByAnnouncementAndUser(Announcement announcement, User user);
    long countByAnnouncement(Announcement announcement);
    List<AnnouncementAcknowledgment> findByAnnouncementIdOrderByAcknowledgedAtDesc(Long announcementId);
}
