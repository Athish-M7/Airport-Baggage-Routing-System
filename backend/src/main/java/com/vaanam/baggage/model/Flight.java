package com.vaanam.baggage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Domain entity representing scheduled flight operations.
 */
@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @Column(name = "flight_id", length = 50)
    private String flightId;

    @Column(name = "flight_number", nullable = false, length = 50)
    private String flightNumber;

    @Column(name = "destination", nullable = false, length = 100)
    private String destination;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "loading_cutoff", nullable = false)
    private LocalDateTime loadingCutoff;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_bay_id", nullable = false)
    private LoadingBay assignedLoadingBay;

    @Enumerated(EnumType.STRING)
    @Column(name = "flight_status", nullable = false, length = 50)
    private FlightStatus flightStatus = FlightStatus.SCHEDULED;

    public Flight() {
    }

    public Flight(String flightId, String flightNumber, String destination,
                  LocalDateTime departureTime, LocalDateTime loadingCutoff,
                  LoadingBay assignedLoadingBay, FlightStatus flightStatus) {
        this.flightId = flightId;
        this.flightNumber = flightNumber;
        this.destination = destination;
        this.departureTime = departureTime;
        this.loadingCutoff = loadingCutoff;
        this.assignedLoadingBay = assignedLoadingBay;
        this.flightStatus = flightStatus != null ? flightStatus : FlightStatus.SCHEDULED;
    }

    public void updateFlightTimes(LocalDateTime newDeparture, LocalDateTime newCutoff) {
        if (newDeparture != null) {
            this.departureTime = newDeparture;
        }
        if (newCutoff != null) {
            this.loadingCutoff = newCutoff;
        }
    }

    public void updateLoadingBay(LoadingBay newBay) {
        if (newBay != null) {
            this.assignedLoadingBay = newBay;
        }
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getFlightNumber() {
        return flightNumber;
    }

    public void setFlightNumber(String flightNumber) {
        this.flightNumber = flightNumber;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getLoadingCutoff() {
        return loadingCutoff;
    }

    public void setLoadingCutoff(LocalDateTime loadingCutoff) {
        this.loadingCutoff = loadingCutoff;
    }

    public LoadingBay getAssignedLoadingBay() {
        return assignedLoadingBay;
    }

    public void setAssignedLoadingBay(LoadingBay assignedLoadingBay) {
        this.assignedLoadingBay = assignedLoadingBay;
    }

    public FlightStatus getFlightStatus() {
        return flightStatus;
    }

    public void setFlightStatus(FlightStatus flightStatus) {
        this.flightStatus = flightStatus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Flight flight = (Flight) o;
        return Objects.equals(flightId, flight.flightId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(flightId);
    }

    @Override
    public String toString() {
        return "Flight{" +
                "flightId='" + flightId + '\'' +
                ", flightNumber='" + flightNumber + '\'' +
                ", destination='" + destination + '\'' +
                ", loadingCutoff=" + loadingCutoff +
                '}';
    }
}
