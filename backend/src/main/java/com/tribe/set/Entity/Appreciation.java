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
    @JoinColumn(name = "from_user", referencedColumnName = "userID")
    private User fromUser;   // senior officer sending

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user", referencedColumnName = "userID")
    private User toUser;     // field officer receiving

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}
