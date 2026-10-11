package com.vaanam.baggage.model;

/**
 * Processing lifecycle statuses for airport baggage.
 */
public enum BaggageStatus {
    AWAITING_CLEARANCE,
    READY,
    IN_TRANSIT,
    AT_RISK,
    MISSED_CUTOFF,
    LOADED,
    UNREACHABLE
}
