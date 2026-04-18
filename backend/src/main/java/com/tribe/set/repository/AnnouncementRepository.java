package com.tribe.set.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tribe.set.entity.Announcement;
import com.tribe.set.entity.Role;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE " +
           "(a.createdByUserId != :userId) AND " +
           "(a.targetRole IS NULL OR a.targetRole = :role) AND " +
           "(a.targetTaluka IS NULL OR a.targetTaluka = :taluka) AND " +
           "(a.targetVillage IS NULL OR a.targetVillage = :village) " +
           "ORDER BY a.createdAt DESC")
    Page<Announcement> findForUser(@Param("userId") String userId,
                                  @Param("role") Role role, 
                                  @Param("taluka") String taluka, 
                                  @Param("village") String village,
                                  Pageable pageable);

    @Query("SELECT a FROM Announcement a WHERE a.createdByUserId = :userId ORDER BY a.createdAt DESC")
    Page<Announcement> findSentByUserId(@Param("userId") String userId, Pageable pageable);

    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
