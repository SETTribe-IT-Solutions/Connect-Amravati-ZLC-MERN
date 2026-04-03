package com.tribe.set.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tribe.set.Entity.Announcement;
import com.tribe.set.Entity.Role;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE a.targetRole = :role OR a.targetRole IS NULL ORDER BY a.createdAt DESC")
    List<Announcement> findForRole(@Param("role") Role role);

    List<Announcement> findAllByOrderByCreatedAtDesc();
}