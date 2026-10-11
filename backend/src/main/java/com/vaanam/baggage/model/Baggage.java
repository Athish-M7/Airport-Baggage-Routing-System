package com.vaanam.baggage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Abstract domain class representing an airport baggage item.
 * Encapsulates core state and enforces state transition invariants.
 */
@Entity
@Table(name = "baggage")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "bag_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Baggage {

    @Id
    @Column(name = "baggage_id", length = 50)
    protected String baggageId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_flight_id", nullable = false)
    protected Flight assignedFlight;

    @Column(name = "current_location", nullable = false, length = 50)
    protected String currentLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_loading_bay_id", nullable = false)
    protected LoadingBay destinationLoadingBay;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_category", nullable = false, length = 50)
    protected PassengerCategory passengerCategory;

    @Column(name = "declared_category_rank", nullable = false)
    protected int declaredCategoryRank;

    @Column(name = "is_transfer", nullable = false)
    protected boolean transferStatus;

    @Column(name = "arrival_order", nullable = false)
    protected int arrivalOrder;

    @Column(name = "arrival_time", nullable = false)
    protected LocalDateTime arrivalTime;

    @Column(name = "operator_clearance", nullable = false)
    protected boolean operatorClearance;

    @Enumerated(EnumType.STRING)
    @Column(name = "baggage_processing_status", nullable = false, length = 50)
    protected BaggageStatus baggageProcessingStatus = BaggageStatus.AWAITING_CLEARANCE;

    @Column(name = "planned_route", columnDefinition = "TEXT")
    protected String plannedRoute;

    @Column(name = "estimated_remaining_travel_time", nullable = false)
    protected int estimatedRemainingTravelTime;

    @Column(name = "loading_cutoff", nullable = false)
    protected LocalDateTime loadingCutoff;

    @Column(name = "scan_history", columnDefinition = "TEXT")
    protected String scanHistory;

    protected Baggage() {
    }

    protected Baggage(String baggageId, Flight assignedFlight, String currentLocation,
                      LoadingBay destinationLoadingBay, PassengerCategory passengerCategory,
                      int declaredCategoryRank, boolean transferStatus, int arrivalOrder,
                      LocalDateTime arrivalTime, boolean operatorClearance,
                      BaggageStatus baggageProcessingStatus, String plannedRoute,
                      int estimatedRemainingTravelTime, LocalDateTime loadingCutoff,
                      String scanHistory) {
        this.baggageId = baggageId;
        this.assignedFlight = assignedFlight;
        this.currentLocation = currentLocation;
        this.destinationLoadingBay = destinationLoadingBay;
        this.passengerCategory = passengerCategory;
        this.declaredCategoryRank = declaredCategoryRank;
        this.transferStatus = transferStatus;
        this.arrivalOrder = arrivalOrder;
        this.arrivalTime = arrivalTime;
        this.operatorClearance = operatorClearance;
        this.baggageProcessingStatus = baggageProcessingStatus != null ? baggageProcessingStatus : BaggageStatus.AWAITING_CLEARANCE;
        this.plannedRoute = plannedRoute;
        this.estimatedRemainingTravelTime = estimatedRemainingTravelTime;
        this.loadingCutoff = loadingCutoff;
        this.scanHistory = scanHistory != null ? scanHistory : currentLocation;
    }

    /**
     * Polymorphic method to determine priority rank for transfer tie-breaking.
     * Subclasses override this method.
     * Lower score indicates higher dispatch priority during cutoff tie-breaking.
     */
    public abstract int transferPriority();

    /**
     * Mandatory method: scan baggage when detected at an automated conveyor node.
     */
    public void scanAtNode(String nodeId, int travelTimeDeduction) {
        if (this.baggageProcessingStatus == BaggageStatus.LOADED) {
            throw new IllegalStateException("Cannot scan baggage that is already confirmed LOADED.");
        }
        this.currentLocation = nodeId;
        if (this.scanHistory == null || this.scanHistory.isEmpty()) {
            this.scanHistory = nodeId;
        } else {
            this.scanHistory = this.scanHistory + " -> " + nodeId;
        }
        this.estimatedRemainingTravelTime = Math.max(0, this.estimatedRemainingTravelTime - travelTimeDeduction);
        if (this.baggageProcessingStatus == BaggageStatus.READY) {
            this.baggageProcessingStatus = BaggageStatus.IN_TRANSIT;
        }
    }

    /**
     * Mandatory method: reassign baggage to a flight and synchronize loading bay and cutoff.
     */
    public void assignFlight(Flight newFlight) {
        if (newFlight == null) {
            throw new IllegalArgumentException("Assigned flight cannot be null.");
        }
        this.assignedFlight = newFlight;
        this.loadingCutoff = newFlight.getLoadingCutoff();
        this.destinationLoadingBay = newFlight.getAssignedLoadingBay();
    }

    /**
     * Mandatory method: validates all loading criteria and confirms successful aircraft loading.
     */
    public boolean confirmLoaded(LocalDateTime currentSimulatedTime) {
        // Must have security/operator clearance
        if (!this.operatorClearance) {
            return false;
        }
        // Flight and target bay must exist
        if (this.assignedFlight == null || this.destinationLoadingBay == null) {
            return false;
        }
        // Must have arrived at the exact bay assigned to its flight
        if (!Objects.equals(this.currentLocation, this.destinationLoadingBay.getNodeId())) {
            return false;
        }
        // If simulated cutoff has passed, mark MISSED_CUTOFF and fail
        if (currentSimulatedTime.isAfter(this.loadingCutoff)) {
            this.baggageProcessingStatus = BaggageStatus.MISSED_CUTOFF;
            return false;
        }
        this.baggageProcessingStatus = BaggageStatus.LOADED;
        this.estimatedRemainingTravelTime = 0;
        return true;
    }

    public void grantOperatorClearance() {
        this.operatorClearance = true;
        if (this.baggageProcessingStatus == BaggageStatus.AWAITING_CLEARANCE) {
            this.baggageProcessingStatus = BaggageStatus.READY;
        }
    }

    public void revokeOperatorClearance() {
        this.operatorClearance = false;
        if (this.baggageProcessingStatus == BaggageStatus.READY) {
            this.baggageProcessingStatus = BaggageStatus.AWAITING_CLEARANCE;
        }
    }

    // Getters and encapsulated setters
    public String getBaggageId() {
        return baggageId;
    }

    public Flight getAssignedFlight() {
        return assignedFlight;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public LoadingBay getDestinationLoadingBay() {
        return destinationLoadingBay;
    }

    public void setDestinationLoadingBay(LoadingBay destinationLoadingBay) {
        this.destinationLoadingBay = destinationLoadingBay;
    }

    public PassengerCategory getPassengerCategory() {
        return passengerCategory;
    }

    public int getDeclaredCategoryRank() {
        return declaredCategoryRank;
    }

    public void setDeclaredCategoryRank(int rank) {
        this.declaredCategoryRank = rank;
    }

    public boolean isTransferStatus() {
        return transferStatus;
    }

    public int getArrivalOrder() {
        return arrivalOrder;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public boolean isOperatorClearance() {
        return operatorClearance;
    }

    public BaggageStatus getBaggageProcessingStatus() {
        return baggageProcessingStatus;
    }

    public void setBaggageProcessingStatus(BaggageStatus status) {
        this.baggageProcessingStatus = status;
    }

    public String getPlannedRoute() {
        return plannedRoute;
    }

    public void setPlannedRoute(String plannedRoute) {
        this.plannedRoute = plannedRoute;
    }

    public int getEstimatedRemainingTravelTime() {
        return estimatedRemainingTravelTime;
    }

    public void setEstimatedRemainingTravelTime(int estimatedRemainingTravelTime) {
        this.estimatedRemainingTravelTime = estimatedRemainingTravelTime;
    }

    public LocalDateTime getLoadingCutoff() {
        return loadingCutoff;
    }

    public void setLoadingCutoff(LocalDateTime loadingCutoff) {
        this.loadingCutoff = loadingCutoff;
    }

    public String getScanHistory() {
        return scanHistory;
    }

    public void setScanHistory(String scanHistory) {
        this.scanHistory = scanHistory;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Baggage baggage = (Baggage) o;
        return Objects.equals(baggageId, baggage.baggageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(baggageId);
    }

    @Override
    public String toString() {
        return "Baggage{" +
                "baggageId='" + baggageId + '\'' +
                ", flight=" + (assignedFlight != null ? assignedFlight.getFlightNumber() : "none") +
                ", status=" + baggageProcessingStatus +
                ", cutoff=" + loadingCutoff +
                '}';
    }
}
