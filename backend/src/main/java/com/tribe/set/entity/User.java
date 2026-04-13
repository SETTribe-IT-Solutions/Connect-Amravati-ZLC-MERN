package com.tribe.set.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

	@Id
	@NotBlank(message = "User ID cannot be empty")
	@Pattern(regexp = "^[0-9]+$", message = "User ID must contain only digits")
	@Column(name = "userid")
	private String userID;
	
	
    @NotBlank(message = "Name cannot be empty")
    @Column(nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be empty")
    @Pattern(
        regexp = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
        message = "Email must be in lowercase only"
    )
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String district;
    private String taluka;
    private String village;

    @NotBlank(message = "Phone number cannot be empty")
    @Size(min = 10, max = 10, message = "Phone number must be exactly 10 digits")
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Invalid phone number: must start with 6, 7, 8, or 9. Numbers starting with 1, 2, 3, 4, or 5 are not allowed"
    )
    private String phone;

    private Double rating = 0.0;

    @Column( nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean active = true;

    @Column(name = "is_appreciated", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isAppreciated = false;

    @Column(name = "ever_appreciated", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean everAppreciated = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relationships
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "fromUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appreciation> sentAppreciations = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "toUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appreciation> receivedAppreciations = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> createdTasks = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> assignedTasks = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "addedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskRemark> addedRemarks = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Announcement> createdAnnouncements = new ArrayList<>();

    // Getters and Setters

   

    public String getName() {
        return name;
    }

    public String getUserID() {
		return userID;
	}

	public void setUserID(String userID) {
		this.userID = userID;
	}

	public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = (email != null) ? email.toLowerCase().trim() : null;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getTaluka() {
        return taluka;
    }

    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsAppreciated() {
        return isAppreciated;
    }

    public void setIsAppreciated(Boolean isAppreciated) {
        this.isAppreciated = isAppreciated;
    }

    public Boolean getEverAppreciated() {
        return everAppreciated;
    }

    public void setEverAppreciated(Boolean everAppreciated) {
        this.everAppreciated = everAppreciated;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<Appreciation> getSentAppreciations() {
        return sentAppreciations;
    }

    public void setSentAppreciations(List<Appreciation> sentAppreciations) {
        this.sentAppreciations = sentAppreciations;
    }

    public List<Appreciation> getReceivedAppreciations() {
        return receivedAppreciations;
    }

    public void setReceivedAppreciations(List<Appreciation> receivedAppreciations) {
        this.receivedAppreciations = receivedAppreciations;
    }

    public List<Task> getCreatedTasks() {
        return createdTasks;
    }

    public void setCreatedTasks(List<Task> createdTasks) {
        this.createdTasks = createdTasks;
    }

    public List<Task> getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(List<Task> assignedTasks) {
        this.assignedTasks = assignedTasks;
    }

    public List<TaskRemark> getAddedRemarks() {
        return addedRemarks;
    }

    public void setAddedRemarks(List<TaskRemark> addedRemarks) {
        this.addedRemarks = addedRemarks;
    }

    public List<Announcement> getCreatedAnnouncements() {
        return createdAnnouncements;
    }

    public void setCreatedAnnouncements(List<Announcement> createdAnnouncements) {
        this.createdAnnouncements = createdAnnouncements;
    }
}