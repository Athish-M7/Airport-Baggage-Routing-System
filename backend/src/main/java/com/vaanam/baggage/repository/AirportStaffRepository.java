package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.AirportStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirportStaffRepository extends JpaRepository<AirportStaff, String> {
    Optional<AirportStaff> findByUsernameIgnoreCase(String username);
    Optional<AirportStaff> findByBadgeIdIgnoreCase(String badgeId);
}
