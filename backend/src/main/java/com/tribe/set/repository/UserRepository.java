package com.tribe.set.repository;

import com.tribe.set.Entity.Role;
import com.tribe.set.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
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
}