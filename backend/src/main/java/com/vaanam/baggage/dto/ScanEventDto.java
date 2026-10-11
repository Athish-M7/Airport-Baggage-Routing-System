package com.vaanam.baggage.dto;

/**
 * Event DTO carrying a baggage scan at a specific conveyor node.
 *
 * @param baggageId          The ID of the bag being scanned.
 * @param nodeId             The conveyor node where the scan occurred.
 * @param travelTimeDeduction Seconds to deduct from estimatedRemainingTravelTime.
 */
public record ScanEventDto(String baggageId, String nodeId, int travelTimeDeduction) {
}
