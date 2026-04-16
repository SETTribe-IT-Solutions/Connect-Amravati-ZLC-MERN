package com.tribe.set.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String action;

    @Column(name = "user_id")
    private String userID;

    private String ipAddress;

    private String status;

    private String details;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String action, String userID, String ipAddress, String status, String details) {
        this.timestamp = LocalDateTime.now();
        this.action = action;
        this.userID = userID;
        this.ipAddress = ipAddress;
        this.status = status;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getUserID() { return userID; }
    public void setUserID(String userID) { this.userID = userID; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
