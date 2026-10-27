package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.PassengerCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for manual baggage check-in / creation via user input.
 */
public record CreateBaggageRequestDto(
    String baggageId,
    @NotBlank String bagType,
    @NotBlank String flightId,
    @NotBlank String ingestionNode,
    @NotNull PassengerCategory passengerCategory,
    boolean operatorClearance
) {}
