package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.CreateFlightRequestDto;
import com.vaanam.baggage.dto.FlightDto;
import com.vaanam.baggage.model.Flight;
import com.vaanam.baggage.model.FlightStatus;
import com.vaanam.baggage.model.LoadingBay;
import com.vaanam.baggage.repository.FlightRepository;
import com.vaanam.baggage.repository.LoadingBayRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final LoadingBayRepository bayRepo;

    public FlightService(FlightRepository flightRepo, LoadingBayRepository bayRepo) {
        this.flightRepo = flightRepo;
        this.bayRepo = bayRepo;
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

    /**
     * Creates a new scheduled flight.
     */
     public FlightDto createFlight(CreateFlightRequestDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Flight request must not be null");
        }
        LoadingBay bay = bayRepo.findById(dto.assignedBayId())
                .orElseThrow(() -> new NoSuchElementException("Loading bay not found with id: " + dto.assignedBayId()));

        String flightId = (dto.flightId() != null && !dto.flightId().trim().isEmpty())
                ? dto.flightId().trim().toUpperCase()
                : "FL-" + dto.flightNumber().replaceAll("[^A-Za-z0-9]", "").toUpperCase();

        LocalDateTime cutoff = dto.loadingCutoff() != null
                ? dto.loadingCutoff()
                : dto.departureTime().minusMinutes(45);

        Flight flight = new Flight(
                flightId,
                dto.flightNumber().trim().toUpperCase(),
                dto.destination().trim(),
                dto.departureTime(),
                cutoff,
                bay,
                dto.flightStatus() != null ? dto.flightStatus() : FlightStatus.SCHEDULED
        );

        Flight saved = flightRepo.save(flight);
        return FlightDto.fromFlight(saved);
    }

    /**
     * Deletes a flight by ID.
     */
    public void deleteFlight(String flightId) {
        if (!flightRepo.existsById(flightId)) {
            throw new NoSuchElementException("Flight not found with id: " + flightId);
        }
        flightRepo.deleteById(flightId);
    }

    // ---- Helper ----

    private Flight fetchOrThrow(String id) {
        return flightRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Flight not found with id: " + id));
    }
}
