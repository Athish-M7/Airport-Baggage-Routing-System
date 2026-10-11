package com.vaanam.baggage.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.time.LocalDateTime;

/**
 * Concrete subclass of Baggage representing connecting transfer baggage arriving from inbound flights.
 */
@Entity
@DiscriminatorValue("TRANSFER")
public class TransferBag extends Baggage {

    public TransferBag() {
        super();
        this.transferStatus = true;
    }

    public TransferBag(String baggageId, Flight assignedFlight, String currentLocation,
                       LoadingBay destinationLoadingBay, PassengerCategory passengerCategory,
                       int declaredCategoryRank, int arrivalOrder, LocalDateTime arrivalTime,
                       boolean operatorClearance, BaggageStatus baggageProcessingStatus,
                       String plannedRoute, int estimatedRemainingTravelTime,
                       LocalDateTime loadingCutoff, String scanHistory) {
        super(baggageId, assignedFlight, currentLocation, destinationLoadingBay,
              passengerCategory, declaredCategoryRank, true, arrivalOrder,
              arrivalTime, operatorClearance, baggageProcessingStatus,
              plannedRoute, estimatedRemainingTravelTime, loadingCutoff, scanHistory);
    }

    /**
     * Transfer bags have higher transfer tie-break priority (1) compared to Origin bags (2).
     * Applied ONLY when loading cutoffs are identical.
     * Never allows a later-cutoff bag to outrank an earlier-cutoff bag.
     */
    @Override
    public int transferPriority() {
        return 1;
    }
}
