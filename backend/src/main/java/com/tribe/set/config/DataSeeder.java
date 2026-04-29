package com.tribe.set.config;

import com.tribe.set.entity.Role;
import com.tribe.set.entity.User;
import com.tribe.set.entity.UserStatus;
import com.tribe.set.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByPhone("9876543210").isEmpty()) {
            System.out.println("No admin found with phone 9876543210. Seeding initial SYSTEM_ADMINISTRATOR...");

            User admin = new User();
            admin.setUserID("admin"); // Changed from "1" to "admin" to force re-seed
            admin.setName("System Admin");
            admin.setEmail("admin@amravati.gov.in");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.SYSTEM_ADMINISTRATOR);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setDistrict("Amravati");
            admin.setTaluka("Amravati");
            admin.setVillage("Amravati");
            admin.setPhone("9876543210");
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("Initial SYSTEM_ADMINISTRATOR created successfully!");
            System.out.println("UserID: admin");
            System.out.println("Email: admin@amravati.gov.in");
            System.out.println("Password: Admin@123");
        } else {
            System.out.println("Database already populated. Skipping seeding.");
        }
    }
}
