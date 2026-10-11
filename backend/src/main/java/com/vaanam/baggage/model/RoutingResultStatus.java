package com.vaanam.baggage.model;

public enum RoutingResultStatus {
    OPTIMAL_FOUND,
    REROUTED_SUCCESS,
    UNREACHABLE,
    FAILED_NO_PATH,
    ALREADY_AT_DESTINATION
}
