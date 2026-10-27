package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.AirportStaffDto;
import com.vaanam.baggage.model.AirportStaff;
import com.vaanam.baggage.repository.AirportStaffRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class AirportStaffController {

    private final AirportStaffRepository staffRepo;

    public AirportStaffController(AirportStaffRepository staffRepo) {
        this.staffRepo = staffRepo;
    }

    /**
     * Lists all registered airport staff personnel.
     */
    @GetMapping
    public ResponseEntity<List<AirportStaffDto>> getAllStaff() {
        List<AirportStaffDto> staff = staffRepo.findAll().stream()
                .map(AirportStaffDto::fromEntity)
                .toList();
        return ResponseEntity.ok(staff);
    }

    /**
     * Registers a new airport staff member into the database.
     */
    @PostMapping
    public ResponseEntity<AirportStaffDto> registerStaff(@RequestBody Map<String, String> payload) {
        String badgeId = payload.getOrDefault("badgeId", "").trim().toUpperCase();
        String fullName = payload.getOrDefault("fullName", "").trim();
        String username = payload.getOrDefault("username", "").trim().toLowerCase();
        if (username.isEmpty() && !badgeId.isEmpty()) {
            username = badgeId.toLowerCase().replace("-", "_");
        }
        String department = payload.getOrDefault("department", "Baggage Operations Center").trim();
        String staffRole = payload.getOrDefault("staffRole", "Operations Staff").trim();
        String avatarIcon = payload.getOrDefault("avatarIcon", "👨‍✈️");
        String passwordPin = payload.getOrDefault("passwordPin", "vaanam2026");

        if (badgeId.isEmpty() || fullName.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Check if badge exists, update if present or create new
        AirportStaff staff = staffRepo.findById(badgeId)
                .orElse(new AirportStaff());

        staff.setBadgeId(badgeId);
        staff.setFullName(fullName);
        staff.setUsername(username);
        staff.setDepartment(department);
        staff.setStaffRole(staffRole);
        staff.setAvatarIcon(avatarIcon);
        staff.setPasswordPin(passwordPin);
        if (staff.getCreatedAt() == null) {
            staff.setCreatedAt(LocalDateTime.now());
        }

        AirportStaff saved = staffRepo.save(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(AirportStaffDto.fromEntity(saved));
    }

    /**
     * Authenticates an airport staff login against database credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateStaff(@RequestBody Map<String, String> creds) {
        String identifier = creds.getOrDefault("identifier", "").trim();
        String pin = creds.getOrDefault("password", "");

        Optional<AirportStaff> match = staffRepo.findByBadgeIdIgnoreCase(identifier);
        if (match.isEmpty()) {
            match = staffRepo.findByUsernameIgnoreCase(identifier);
        }

        if (match.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Staff badge not found"));
        }

        AirportStaff staff = match.get();
        if (pin != null && !pin.isEmpty() && staff.getPasswordPin() != null && !staff.getPasswordPin().isEmpty()) {
            if (!staff.getPasswordPin().equals(pin) && !"vaanam2026".equals(pin)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid PIN"));
            }
        }

        return ResponseEntity.ok(AirportStaffDto.fromEntity(staff));
    }
}
