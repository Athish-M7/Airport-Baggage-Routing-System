package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.Baggage;
import com.vaanam.baggage.model.BaggageStatus;
import com.vaanam.baggage.model.PassengerCategory;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Baggage entity — no JPA annotations.
 */
public class BaggageDto {

    private String baggageId;
    private String bagType;
    private String assignedFlightId;
    private String flightNumber;
    private String currentLocation;
    private String destinationBayId;
    private String destinationBayName;
    private PassengerCategory passengerCategory;
    private int declaredCategoryRank;
    private boolean transferStatus;
    private int arrivalOrder;
    private LocalDateTime arrivalTime;
    private boolean operatorClearance;
    private BaggageStatus baggageProcessingStatus;
    private String plannedRoute;
    private int estimatedRemainingTravelTime;
    private LocalDateTime loadingCutoff;
    private String scanHistory;

    public BaggageDto() {
    }

    /**
     * Factory method to convert a Baggage domain object to its DTO representation.
     */
    public static BaggageDto fromBaggage(Baggage b) {
        BaggageDto dto = new BaggageDto();
        dto.baggageId = b.getBaggageId();
        // Derive bag type from discriminator value via simple class name check
        dto.bagType = b.getClass().getSimpleName().toUpperCase().replace("BAG", "");
        if (dto.bagType.equals("ORIGIN")) {
            dto.bagType = "ORIGIN";
        } else if (dto.bagType.equals("TRANSFER")) {
            dto.bagType = "TRANSFER";
        }
        dto.currentLocation = b.getCurrentLocation();
        dto.passengerCategory = b.getPassengerCategory();
        dto.declaredCategoryRank = b.getDeclaredCategoryRank();
        dto.transferStatus = b.isTransferStatus();
        dto.arrivalOrder = b.getArrivalOrder();
        dto.arrivalTime = b.getArrivalTime();
        dto.operatorClearance = b.isOperatorClearance();
        dto.baggageProcessingStatus = b.getBaggageProcessingStatus();
        dto.plannedRoute = b.getPlannedRoute();
        dto.estimatedRemainingTravelTime = b.getEstimatedRemainingTravelTime();
        dto.loadingCutoff = b.getLoadingCutoff();
        dto.scanHistory = b.getScanHistory();
        if (b.getAssignedFlight() != null) {
            dto.assignedFlightId = b.getAssignedFlight().getFlightId();
            dto.flightNumber = b.getAssignedFlight().getFlightNumber();
        }
        if (b.getDestinationLoadingBay() != null) {
            dto.destinationBayId = b.getDestinationLoadingBay().getBayId();
            dto.destinationBayName = b.getDestinationLoadingBay().getBayName();
        }
        return dto;
    }

    // ---- Getters and Setters ----

    public String getBaggageId() { return baggageId; }
    public void setBaggageId(String baggageId) { this.baggageId = baggageId; }

    public String getBagType() { return bagType; }
    public void setBagType(String bagType) { this.bagType = bagType; }

    public String getAssignedFlightId() { return assignedFlightId; }
    public void setAssignedFlightId(String assignedFlightId) { this.assignedFlightId = assignedFlightId; }

    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getDestinationBayId() { return destinationBayId; }
    public void setDestinationBayId(String destinationBayId) { this.destinationBayId = destinationBayId; }

    public String getDestinationBayName() { return destinationBayName; }
    public void setDestinationBayName(String destinationBayName) { this.destinationBayName = destinationBayName; }

    public PassengerCategory getPassengerCategory() { return passengerCategory; }
    public void setPassengerCategory(PassengerCategory passengerCategory) { this.passengerCategory = passengerCategory; }

    public int getDeclaredCategoryRank() { return declaredCategoryRank; }
    public void setDeclaredCategoryRank(int declaredCategoryRank) { this.declaredCategoryRank = declaredCategoryRank; }

    public boolean isTransferStatus() { return transferStatus; }
    public void setTransferStatus(boolean transferStatus) { this.transferStatus = transferStatus; }

    public int getArrivalOrder() { return arrivalOrder; }
    public void setArrivalOrder(int arrivalOrder) { this.arrivalOrder = arrivalOrder; }

    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public boolean isOperatorClearance() { return operatorClearance; }
    public void setOperatorClearance(boolean operatorClearance) { this.operatorClearance = operatorClearance; }

    public BaggageStatus getBaggageProcessingStatus() { return baggageProcessingStatus; }
    public void setBaggageProcessingStatus(BaggageStatus baggageProcessingStatus) { this.baggageProcessingStatus = baggageProcessingStatus; }

    public String getPlannedRoute() { return plannedRoute; }
    public void setPlannedRoute(String plannedRoute) { this.plannedRoute = plannedRoute; }

    public int getEstimatedRemainingTravelTime() { return estimatedRemainingTravelTime; }
    public void setEstimatedRemainingTravelTime(int estimatedRemainingTravelTime) { this.estimatedRemainingTravelTime = estimatedRemainingTravelTime; }

    public LocalDateTime getLoadingCutoff() { return loadingCutoff; }
    public void setLoadingCutoff(LocalDateTime loadingCutoff) { this.loadingCutoff = loadingCutoff; }

    public String getScanHistory() { return scanHistory; }
    public void setScanHistory(String scanHistory) { this.scanHistory = scanHistory; }
}
