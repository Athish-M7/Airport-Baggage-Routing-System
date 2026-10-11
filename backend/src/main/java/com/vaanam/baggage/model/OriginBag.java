package com.vaanam.baggage.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.time.LocalDateTime;

/**
 * Concrete subclass of Baggage representing locally checked-in origin bags.
 */
@Entity
@DiscriminatorValue("ORIGIN")
public class OriginBag extends Baggage {

    public OriginBag() {
        super();
        this.transferStatus = false;
    }

    public OriginBag(String baggageId, Flight assignedFlight, String currentLocation,
                     LoadingBay destinationLoadingBay, PassengerCategory passengerCategory,
                     int declaredCategoryRank, int arrivalOrder, LocalDateTime arrivalTime,
                     boolean operatorClearance, BaggageStatus baggageProcessingStatus,
                     String plannedRoute, int estimatedRemainingTravelTime,
                     LocalDateTime loadingCutoff, String scanHistory) {
        super(baggageId, assignedFlight, currentLocation, destinationLoadingBay,
              passengerCategory, declaredCategoryRank, false, arrivalOrder,
              arrivalTime, operatorClearance, baggageProcessingStatus,
              plannedRoute, estimatedRemainingTravelTime, loadingCutoff, scanHistory);
    }

    /**
     * Origin bags have lower transfer tie-break priority (2) compared to Transfer bags (1).
     * Applied ONLY when loading cutoffs are identical.
     */
    @Override
    public int transferPriority() {
        return 2;
    }
}
