package com.tribe.set.repository;

import com.tribe.set.entity.Role;
import com.tribe.set.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserID(Long userID);

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByActive(Boolean active);

    boolean existsByEmail(String email);

    boolean existsByUserID(Long userID);
    
    @Modifying
    @Query("UPDATE User u SET u.active = :active WHERE u.userID = :userId")
    int updateActiveStatus(Long userId, Boolean active);
}
