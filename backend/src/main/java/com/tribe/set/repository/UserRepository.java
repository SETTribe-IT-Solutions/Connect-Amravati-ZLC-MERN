package com.tribe.set.repository;

import com.tribe.set.entity.Role;
import com.tribe.set.entity.User;
import com.tribe.set.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUserID(String finalUserId);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    List<User> findByRole(Role role);

    List<User> findByStatus(UserStatus status);

    List<User> findAllByUserIDIn(java.util.Collection<String> userIds);

    boolean existsByEmail(String email);

    boolean existsByUserID(String string);
    
    @Query("SELECT DISTINCT u.taluka FROM User u WHERE u.role = :role AND u.status = 'ACTIVE' AND u.taluka IS NOT NULL")
    List<String> findDistinctTalukasByRole(@Param("role") Role role);

    @Query("SELECT DISTINCT u.village FROM User u WHERE u.role = :role AND u.taluka = :taluka AND u.status = 'ACTIVE' AND u.village IS NOT NULL")
    List<String> findDistinctVillagesByRoleAndTaluka(@Param("role") Role role, @Param("taluka") String taluka);

    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.userID = :userId")
    int updateStatus(@Param("userId") String userId, @Param("status") UserStatus status);

    @Query("SELECT DISTINCT u FROM User u WHERE u.isAppreciated = false AND " +
           "EXISTS (SELECT 1 FROM Task t WHERE t.assignedToUserId = u.userID AND t.status = com.tribe.set.entity.TaskStatus.COMPLETED)")
    List<User> findEligibleForAppreciation();

    @Modifying
    @Query("UPDATE User u SET u.isAppreciated = true, u.everAppreciated = true WHERE u.userID = :userId")
    void markUserAsAppreciated(@Param("userId") String userId);

    @Query("SELECT u FROM User u WHERE " +
           "(u.role IN :roles) AND " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR u.phone LIKE CONCAT('%', :searchTerm, '%') " +
           "OR LOWER(u.district) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(u.taluka) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(u.village) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(CAST(u.role AS string)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:filterRole IS NULL OR u.role = :filterRole) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> findAllFiltered(
        @Param("roles") List<Role> visibleRoles,
        @Param("searchTerm") String searchTerm,
        @Param("filterRole") Role filterRole,
        @Param("status") UserStatus status,
        Pageable pageable);

    long countByStatus(UserStatus status);

    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countNewUsersThisMonth(@Param("startDate") LocalDateTime startDate);
}
