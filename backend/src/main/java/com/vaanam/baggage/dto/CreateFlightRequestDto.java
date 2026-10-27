package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.FlightStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Request payload for scheduling/creating a flight via user input.
 */
public record CreateFlightRequestDto(
    String flightId,
    @NotBlank String flightNumber,
    @NotBlank String destination,
    @NotNull LocalDateTime departureTime,
    LocalDateTime loadingCutoff,
    @NotBlank String assignedBayId,
    FlightStatus flightStatus
) {}
