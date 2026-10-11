package com.vaanam.baggage.dto;

/**
 * Request DTO carrying source and destination node IDs for a route computation.
 */
public record RouteRequestDto(String startNode, String destinationNode) {
}
