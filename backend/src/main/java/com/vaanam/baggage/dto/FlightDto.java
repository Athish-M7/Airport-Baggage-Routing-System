package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.Flight;
import com.vaanam.baggage.model.FlightStatus;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Flight entity — no JPA annotations.
 */
public class FlightDto {

    private String flightId;
    private String flightNumber;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime loadingCutoff;
    private String assignedBayId;
    private String bayName;
    private FlightStatus flightStatus;

    public FlightDto() {
    }

    /**
     * Factory method to convert a Flight domain object to its DTO representation.
     */
    public static FlightDto fromFlight(Flight f) {
        FlightDto dto = new FlightDto();
        dto.flightId = f.getFlightId();
        dto.flightNumber = f.getFlightNumber();
        dto.destination = f.getDestination();
        dto.departureTime = f.getDepartureTime();
        dto.loadingCutoff = f.getLoadingCutoff();
        dto.flightStatus = f.getFlightStatus();
        if (f.getAssignedLoadingBay() != null) {
            dto.assignedBayId = f.getAssignedLoadingBay().getBayId();
            dto.bayName = f.getAssignedLoadingBay().getBayName();
        }
        return dto;
    }

    // ---- Getters and Setters ----

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public LocalDateTime getLoadingCutoff() { return loadingCutoff; }
    public void setLoadingCutoff(LocalDateTime loadingCutoff) { this.loadingCutoff = loadingCutoff; }

    public String getAssignedBayId() { return assignedBayId; }
    public void setAssignedBayId(String assignedBayId) { this.assignedBayId = assignedBayId; }

    public String getBayName() { return bayName; }
    public void setBayName(String bayName) { this.bayName = bayName; }

    public FlightStatus getFlightStatus() { return flightStatus; }
    public void setFlightStatus(FlightStatus flightStatus) { this.flightStatus = flightStatus; }
}
