package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.FlightDto;
import com.vaanam.baggage.model.Flight;
import com.vaanam.baggage.model.FlightStatus;
import com.vaanam.baggage.repository.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * CRUD and lifecycle service for Flight domain objects.
 */
@Service
@Transactional
public class FlightService {

    private final FlightRepository flightRepo;

    public FlightService(FlightRepository flightRepo) {
        this.flightRepo = flightRepo;
    }

    @Transactional(readOnly = true)
    public List<FlightDto> getAllFlights() {
        return flightRepo.findAll().stream()
                .map(FlightDto::fromFlight)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlightDto getFlightById(String id) {
        Flight f = fetchOrThrow(id);
        return FlightDto.fromFlight(f);
    }

    /**
     * Transitions a flight to a new status.
     *
     * @param id        flight ID
     * @param newStatus the target {@link FlightStatus}
     * @return updated {@link FlightDto}
     */
    public FlightDto updateFlightStatus(String id, FlightStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Flight status must not be null.");
        }
        Flight f = fetchOrThrow(id);
        f.setFlightStatus(newStatus);
        flightRepo.save(f);
        return FlightDto.fromFlight(f);
    }

    // ---- Helper ----

    private Flight fetchOrThrow(String id) {
        return flightRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Flight not found with id: " + id));
    }
}
