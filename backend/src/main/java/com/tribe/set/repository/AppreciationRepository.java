package com.tribe.set.repository;

import com.tribe.set.entity.Appreciation;
import com.tribe.set.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface AppreciationRepository extends JpaRepository<Appreciation, Long> {

    // Appreciations received by a user
    Page<Appreciation> findByToUserOrderByCreatedAtDesc(User toUser, Pageable pageable);

    // Appreciations sent by a user
    Page<Appreciation> findByFromUserOrderByCreatedAtDesc(User fromUser, Pageable pageable);

    @Query("SELECT a FROM Appreciation a WHERE " +
           "(:searchTerm IS NULL OR LOWER(a.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.fromUser.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.toUser.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Appreciation> findAllFiltered(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Count appreciations received by a user
    long countByToUser(User toUser);
}
