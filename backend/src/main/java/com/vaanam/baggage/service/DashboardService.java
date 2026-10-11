package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.DashboardStatsDto;
import com.vaanam.baggage.model.BaggageStatus;
import com.vaanam.baggage.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service aggregating system-wide statistics for the dashboard UI.
 */
@Service
public class DashboardService {

    private final BaggageRepository baggageRepo;
    private final FlightRepository flightRepo;
    private final ConveyorNodeRepository nodeRepo;
    private final ConveyorSegmentRepository segmentRepo;

    public DashboardService(BaggageRepository baggageRepo,
                            FlightRepository flightRepo,
                            ConveyorNodeRepository nodeRepo,
                            ConveyorSegmentRepository segmentRepo) {
        this.baggageRepo = baggageRepo;
        this.flightRepo = flightRepo;
        this.nodeRepo = nodeRepo;
        this.segmentRepo = segmentRepo;
    }

    /**
     * Computes and returns aggregated dashboard statistics in a single call.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long total = baggageRepo.count();

        int ready         = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.READY).size();
        int inTransit     = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.IN_TRANSIT).size();
        int atRisk        = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.AT_RISK).size();
        int loaded        = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.LOADED).size();
        int awaiting      = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.AWAITING_CLEARANCE).size();
        int missed        = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.MISSED_CUTOFF).size();
        int unreachable   = baggageRepo.findByBaggageProcessingStatus(BaggageStatus.UNREACHABLE).size();

        int flights       = (int) flightRepo.count();
        int nodes         = (int) nodeRepo.count();

        int activeSegs    = segmentRepo.findByAvailable(true).size();
        int failedSegs    = segmentRepo.findByAvailable(false).size();

        return DashboardStatsDto.builder()
                .totalBaggage((int) total)
                .readyCount(ready)
                .inTransitCount(inTransit)
                .atRiskCount(atRisk)
                .loadedCount(loaded)
                .awaitingClearanceCount(awaiting)
                .missedCutoffCount(missed)
                .unreachableCount(unreachable)
                .flightCount(flights)
                .activeSegmentCount(activeSegs)
                .failedSegmentCount(failedSegs)
                .nodeCount(nodes)
                .build();
    }
}
