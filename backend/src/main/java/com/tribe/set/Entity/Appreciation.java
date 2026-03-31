package com.tribe.set.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "appreciations")
public class Appreciation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user", referencedColumnName = "userid")
    private User fromUser;   // senior officer sending

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user", referencedColumnName = "userid")
    private User toUser;     // field officer receiving

    private String message;
    private String badge; // e.g., "Excellence Award"

    private LocalDateTime createdAt = LocalDateTime.now();

    public Appreciation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getFromUser() { return fromUser; }
    public void setFromUser(User fromUser) { this.fromUser = fromUser; }

    public User getToUser() { return toUser; }
    public void setToUser(User toUser) { this.toUser = toUser; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
