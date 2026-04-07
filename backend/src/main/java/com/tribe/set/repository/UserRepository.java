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
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUserID(String finalUserId);

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByActive(Boolean active);

    boolean existsByEmail(String email);

    boolean existsByUserID(String string);
    
    @Query("SELECT DISTINCT u.taluka FROM User u WHERE u.role = :role AND u.active = true AND u.taluka IS NOT NULL")
    List<String> findDistinctTalukasByRole(@Param("role") Role role);

    @Query("SELECT DISTINCT u.village FROM User u WHERE u.role = :role AND u.taluka = :taluka AND u.active = true AND u.village IS NOT NULL")
    List<String> findDistinctVillagesByRoleAndTaluka(@Param("role") Role role, @Param("taluka") String taluka);

    @Modifying
    @Query("UPDATE User u SET u.active = :active WHERE u.userID = :userId")
    int updateActiveStatus(@Param("userId") String userId, @Param("active") Boolean active);

    @Query("SELECT DISTINCT u FROM User u JOIN u.assignedTasks t WHERE u.isAppreciated = false AND t.status = com.tribe.set.entity.TaskStatus.COMPLETED")
    List<User> findEligibleForAppreciation();
}
