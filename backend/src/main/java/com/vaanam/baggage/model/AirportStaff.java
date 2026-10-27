package com.vaanam.baggage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Domain entity representing authorized airport operations personnel.
 */
@Entity
@Table(name = "airport_staff")
public class AirportStaff {

    @Id
    @Column(name = "badge_id", length = 50)
    private String badgeId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "username", nullable = false, length = 50, unique = true)
    private String username;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "staff_role", nullable = false, length = 100)
    private String staffRole;

    @Column(name = "avatar_icon", nullable = false, length = 50)
    private String avatarIcon = "👨‍✈️";

    @Column(name = "password_pin", nullable = false, length = 100)
    private String passwordPin = "vaanam2026";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AirportStaff() {
    }

    public AirportStaff(String badgeId, String fullName, String username, String department,
                        String staffRole, String avatarIcon, String passwordPin, LocalDateTime createdAt) {
        this.badgeId = badgeId;
        this.fullName = fullName;
        this.username = username;
        this.department = department;
        this.staffRole = staffRole;
        this.avatarIcon = avatarIcon != null ? avatarIcon : "👨‍✈️";
        this.passwordPin = passwordPin != null ? passwordPin : "vaanam2026";
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public String getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(String badgeId) {
        this.badgeId = badgeId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStaffRole() {
        return staffRole;
    }

    public void setStaffRole(String staffRole) {
        this.staffRole = staffRole;
    }

    public String getAvatarIcon() {
        return avatarIcon;
    }

    public void setAvatarIcon(String avatarIcon) {
        this.avatarIcon = avatarIcon;
    }

    public String getPasswordPin() {
        return passwordPin;
    }

    public void setPasswordPin(String passwordPin) {
        this.passwordPin = passwordPin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
