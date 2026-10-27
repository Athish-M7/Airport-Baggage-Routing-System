package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.AirportStaff;

import java.time.LocalDateTime;

public record AirportStaffDto(
        String badgeId,
        String fullName,
        String username,
        String department,
        String staffRole,
        String avatarIcon,
        String passwordPin,
        LocalDateTime createdAt
) {
    public static AirportStaffDto fromEntity(AirportStaff s) {
        return new AirportStaffDto(
                s.getBadgeId(),
                s.getFullName(),
                s.getUsername(),
                s.getDepartment(),
                s.getStaffRole(),
                s.getAvatarIcon(),
                s.getPasswordPin(),
                s.getCreatedAt()
        );
    }
}
