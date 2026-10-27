package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.CreateFlightRequestDto;
import com.vaanam.baggage.dto.FlightDto;
import com.vaanam.baggage.model.FlightStatus;
import com.vaanam.baggage.service.FlightService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing flight management endpoints.
 */
@RestController
@RequestMapping("/api/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    /** GET /api/flights — list all flights */
    @GetMapping
    public ResponseEntity<List<FlightDto>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    /** POST /api/flights — schedule / create a new flight */
    @PostMapping
    public ResponseEntity<FlightDto> createFlight(@RequestBody CreateFlightRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flightService.createFlight(dto));
    }

    /** DELETE /api/flights/{id} — remove flight */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/flights/{id} — single flight by ID */
    @GetMapping("/{id}")
    public ResponseEntity<FlightDto> getFlightById(@PathVariable String id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    /**
     * PATCH /api/flights/{id}/status — update flight operational status.
     * Accepts the new status as a request parameter or in the request body as a plain string.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<FlightDto> updateFlightStatus(
            @PathVariable String id,
            @RequestParam String status) {
        FlightStatus newStatus = FlightStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(flightService.updateFlightStatus(id, newStatus));
    }
}
