package com.vaanam.baggage.service;

import com.vaanam.baggage.algorithm.RouteResult;
import com.vaanam.baggage.dto.BaggageDto;
import com.vaanam.baggage.model.*;
import com.vaanam.baggage.dto.CreateBaggageRequestDto;
import com.vaanam.baggage.repository.BaggageRepository;
import com.vaanam.baggage.repository.FlightRepository;
import com.vaanam.baggage.repository.RoutingRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * Full CRUD and lifecycle service for Baggage domain objects.
 */
@Service
@Transactional
public class BaggageService {

    private final BaggageRepository baggageRepo;
    private final FlightRepository flightRepo;
    private final RoutingRecordRepository routingRecordRepo;
    private final DijkstraRoutingService dijkstraService;
    private final SimulationService simulationService;

    public BaggageService(BaggageRepository baggageRepo,
                          FlightRepository flightRepo,
                          RoutingRecordRepository routingRecordRepo,
                          DijkstraRoutingService dijkstraService,
                          SimulationService simulationService) {
        this.baggageRepo = baggageRepo;
        this.flightRepo = flightRepo;
        this.routingRecordRepo = routingRecordRepo;
        this.dijkstraService = dijkstraService;
        this.simulationService = simulationService;
    }

    // ---- Read operations ----

    @Transactional(readOnly = true)
    public List<BaggageDto> getAllBaggage() {
        return baggageRepo.findAll().stream()
                .map(BaggageDto::fromBaggage)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BaggageDto getBaggageById(String id) {
        Baggage b = fetchOrThrow(id);
        return BaggageDto.fromBaggage(b);
    }

    @Transactional(readOnly = true)
    public List<BaggageDto> getBaggageByFlight(String flightId) {
        return baggageRepo.findByAssignedFlightFlightId(flightId).stream()
                .map(BaggageDto::fromBaggage)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BaggageDto> getBaggageByStatus(BaggageStatus status) {
        return baggageRepo.findByBaggageProcessingStatus(status).stream()
                .map(BaggageDto::fromBaggage)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoutingRecord> getRoutingHistory(String baggageId) {
        return routingRecordRepo.findByBaggageIdOrderByTimestampDesc(baggageId);
    }

    // ---- Clearance operations ----

    public BaggageDto grantClearance(String baggageId) {
        Baggage b = fetchOrThrow(baggageId);
        b.grantOperatorClearance();
        baggageRepo.save(b);
        return BaggageDto.fromBaggage(b);
    }

    public BaggageDto revokeClearance(String baggageId) {
        Baggage b = fetchOrThrow(baggageId);
        b.revokeOperatorClearance();
        baggageRepo.save(b);
        return BaggageDto.fromBaggage(b);
    }

    // ---- Scan at node ----

    /**
     * Records a conveyor node scan: updates location, deducts travel time, transitions status.
     * Saves a RoutingRecord entry capturing the event.
     */
    public BaggageDto scanBaggageAtNode(String baggageId, String nodeId, int travelTimeDeduction) {
        Baggage b = fetchOrThrow(baggageId);
        String previousRoute = b.getPlannedRoute();
        b.scanAtNode(nodeId, travelTimeDeduction);
        baggageRepo.save(b);

        RoutingRecord record = new RoutingRecord(
                baggageId,
                previousRoute,
                b.getPlannedRoute(),
                nodeId,
                b.getEstimatedRemainingTravelTime(),
                "NODE_SCAN",
                simulationService.getCurrentTime(),
                RoutingResultStatus.OPTIMAL_FOUND
        );
        routingRecordRepo.save(record);
        return BaggageDto.fromBaggage(b);
    }

    // ---- Confirm loaded ----

    /**
     * Confirms baggage has been physically loaded onto the aircraft.
     * Validates clearance, location, and cutoff via domain logic.
     *
     * @throws IllegalStateException if the bag cannot be confirmed loaded
     */
    public BaggageDto confirmBaggageLoaded(String baggageId) {
        Baggage b = fetchOrThrow(baggageId);
        boolean success = b.confirmLoaded(simulationService.getCurrentTime());
        if (!success) {
            baggageRepo.save(b); // persist any status changes (e.g. MISSED_CUTOFF)
            throw new IllegalStateException(
                    "Bag '" + baggageId + "' could not be confirmed as loaded. " +
                    "Check clearance, location, and loading cutoff. Current status: " +
                    b.getBaggageProcessingStatus());
        }
        baggageRepo.save(b);
        return BaggageDto.fromBaggage(b);
    }

    // ---- Reroute ----

    /**
     * Re-runs Dijkstra from the bag's current location to its destination bay node
     * and updates plannedRoute and estimatedRemainingTravelTime. Saves a RoutingRecord.
     */
    public BaggageDto rerouteBaggage(String baggageId) {
        Baggage b = fetchOrThrow(baggageId);

        if (b.getDestinationLoadingBay() == null) {
            throw new IllegalStateException("Bag '" + baggageId + "' has no destination loading bay assigned.");
        }

        String startNode = b.getCurrentLocation();
        String destNode = b.getDestinationLoadingBay().getNodeId();
        String previousRoute = b.getPlannedRoute();

        RouteResult result = dijkstraService.findShortestPath(startNode, destNode);

        String newRoute = result.getFormattedRoute();
        b.setPlannedRoute(newRoute);
        if (result.isSuccess()) {
            b.setEstimatedRemainingTravelTime(result.getTotalTravelTime());
            if (b.getBaggageProcessingStatus() == BaggageStatus.UNREACHABLE) {
                b.setBaggageProcessingStatus(BaggageStatus.IN_TRANSIT);
            }
        } else {
            b.setBaggageProcessingStatus(BaggageStatus.UNREACHABLE);
        }

        baggageRepo.save(b);

        RoutingRecord record = new RoutingRecord(
                baggageId,
                previousRoute,
                newRoute,
                startNode,
                b.getEstimatedRemainingTravelTime(),
                "REROUTE",
                simulationService.getCurrentTime(),
                result.getStatus()
        );
        routingRecordRepo.save(record);

        return BaggageDto.fromBaggage(b);
    }

    // ---- Create / Ingest Baggage ----

    public BaggageDto createBaggage(CreateBaggageRequestDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Baggage request must not be null");
        }
        Flight flight = flightRepo.findById(dto.flightId())
                .orElseThrow(() -> new NoSuchElementException("Assigned flight not found with id: " + dto.flightId()));

        LoadingBay destinationBay = flight.getAssignedLoadingBay();
        if (destinationBay == null) {
            throw new IllegalStateException("Flight " + flight.getFlightNumber() + " has no assigned loading bay");
        }

        String bagId = (dto.baggageId() != null && !dto.baggageId().trim().isEmpty())
                ? dto.baggageId().trim().toUpperCase()
                : "BAG-" + (System.currentTimeMillis() % 1000000);

        String ingestionNode = dto.ingestionNode() != null ? dto.ingestionNode().trim().toUpperCase() : "CHK-1";
        String bayNode = destinationBay.getNodeId();

        RouteResult routeResult = dijkstraService.findShortestPath(ingestionNode, bayNode);
        String plannedRoute = routeResult.getFormattedRoute();
        int travelTime = routeResult.isSuccess() ? routeResult.getTotalTravelTime() : 0;

        BaggageStatus initialStatus;
        if (!routeResult.isSuccess()) {
            initialStatus = BaggageStatus.UNREACHABLE;
        } else if (dto.operatorClearance()) {
            initialStatus = BaggageStatus.READY;
        } else {
            initialStatus = BaggageStatus.AWAITING_CLEARANCE;
        }

        int rank = dto.passengerCategory() != null ? dto.passengerCategory().getRank() : 4;
        int arrivalOrder = (int) baggageRepo.count() + 1;
        LocalDateTime arrivalTime = simulationService.getCurrentTime();
        LocalDateTime loadingCutoff = flight.getLoadingCutoff();

        Baggage bag;
        boolean isTransfer = "TRANSFER".equalsIgnoreCase(dto.bagType());
        if (isTransfer) {
            bag = new TransferBag(
                    bagId,
                    flight,
                    ingestionNode,
                    destinationBay,
                    dto.passengerCategory(),
                    rank,
                    arrivalOrder,
                    arrivalTime,
                    dto.operatorClearance(),
                    initialStatus,
                    plannedRoute,
                    travelTime,
                    loadingCutoff,
                    ingestionNode
            );
        } else {
            bag = new OriginBag(
                    bagId,
                    flight,
                    ingestionNode,
                    destinationBay,
                    dto.passengerCategory(),
                    rank,
                    arrivalOrder,
                    arrivalTime,
                    dto.operatorClearance(),
                    initialStatus,
                    plannedRoute,
                    travelTime,
                    loadingCutoff,
                    ingestionNode
            );
        }

        Baggage saved = baggageRepo.save(bag);

        RoutingRecord record = new RoutingRecord(
                bagId,
                null,
                plannedRoute,
                ingestionNode,
                travelTime,
                "INITIAL_CHECK_IN",
                arrivalTime,
                routeResult.getStatus()
        );
        routingRecordRepo.save(record);

        return BaggageDto.fromBaggage(saved);
    }

    public void deleteBaggage(String baggageId) {
        if (!baggageRepo.existsById(baggageId)) {
            throw new NoSuchElementException("Baggage not found with id: " + baggageId);
        }
        baggageRepo.deleteById(baggageId);
    }

    // ---- Helper ----

    private Baggage fetchOrThrow(String id) {
        return baggageRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Baggage not found with id: " + id));
    }
}
