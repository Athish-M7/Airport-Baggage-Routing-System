package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.Baggage;
import com.vaanam.baggage.model.BaggageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BaggageRepository extends JpaRepository<Baggage, String> {

    List<Baggage> findByAssignedFlightFlightId(String flightId);

    List<Baggage> findByBaggageProcessingStatus(BaggageStatus status);

    List<Baggage> findByCurrentLocation(String nodeId);

    List<Baggage> findByLoadingCutoffBeforeAndBaggageProcessingStatusNot(
            LocalDateTime cutoff, BaggageStatus status);

    @Query("SELECT b FROM Baggage b WHERE b.operatorClearance = true " +
           "AND b.baggageProcessingStatus IN ('READY','IN_TRANSIT','AT_RISK')")
    List<Baggage> findDispatchableByStatus();
}
