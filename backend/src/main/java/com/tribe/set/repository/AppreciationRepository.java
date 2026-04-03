package com.tribe.set.repository;

import com.tribe.set.entity.Appreciation;
import com.tribe.set.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppreciationRepository extends JpaRepository<Appreciation, Long> {

    // Appreciations received by a user
    List<Appreciation> findByToUserOrderByCreatedAtDesc(User toUser);

    // Appreciations sent by a user
    List<Appreciation> findByFromUserOrderByCreatedAtDesc(User fromUser);

    // All appreciations (admin view)
    List<Appreciation> findAllByOrderByCreatedAtDesc();

    // Count appreciations received by a user
    long countByToUser(User toUser);
}
