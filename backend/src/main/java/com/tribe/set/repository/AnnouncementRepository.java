package com.tribe.set.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tribe.set.entity.Announcement;
import com.tribe.set.entity.Role;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE " +
           "(a.createdBy.userID != :userId) AND " +
           "(a.targetRole IS NULL OR a.targetRole = :role) AND " +
           "(a.targetTaluka IS NULL OR a.targetTaluka = :taluka) AND " +
           "(a.targetVillage IS NULL OR a.targetVillage = :village) " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findForUser(@Param("userId") Long userId,
                                  @Param("role") Role role, 
                                  @Param("taluka") String taluka, 
                                  @Param("village") String village);

    List<Announcement> findByCreatedBy_UserIDOrderByCreatedAtDesc(String userId);

    List<Announcement> findAllByOrderByCreatedAtDesc();
}
