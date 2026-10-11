package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.Flight;
import com.vaanam.baggage.model.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {

    List<Flight> findByFlightStatus(FlightStatus status);

    Optional<Flight> findByFlightNumber(String flightNumber);

    List<Flight> findByAssignedLoadingBayBayId(String bayId);
}
