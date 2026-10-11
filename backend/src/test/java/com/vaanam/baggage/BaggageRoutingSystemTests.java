package com.vaanam.baggage;

import com.vaanam.baggage.algorithm.DirectedWeightedGraph;
import com.vaanam.baggage.algorithm.RouteResult;
import com.vaanam.baggage.dto.BaggageDto;
import com.vaanam.baggage.model.*;
import com.vaanam.baggage.repository.*;
import com.vaanam.baggage.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class BaggageRoutingSystemTests {

    @Autowired
    private DijkstraRoutingService dijkstraService;

    @Autowired
    private BaggageQueueService queueService;

    @Autowired
    private BaggageService baggageService;

    @Autowired
    private BaggageRepository baggageRepo;

    @Autowired
    private FlightRepository flightRepo;

    @Autowired
    private ConveyorSegmentRepository segmentRepo;

    @Autowired
    private ConveyorNodeRepository nodeRepo;

    @Autowired
    private LoadingBayRepository bayRepo;

    @Autowired
    private SimulationService simulationService;

    private LoadingBay bay1;
    private LoadingBay bay2;
    private Flight flight101;
    private Flight flight102;

    @BeforeEach
    void setUp() {
        // Reset simulated time to 08:15:00
        simulationService.resetToStart();

        // Ensure nodes exist for routing tests
        ensureNode("CHK-1", "Check-in North", "CHECKIN", 120, 120);
        ensureNode("CHK-2", "Check-in South", "CHECKIN", 120, 260);
        ensureNode("TRF-1", "Transfer Point Alpha", "TRANSFER", 120, 400);
        ensureNode("JNC-A", "Sorting Junction A", "JUNCTION", 320, 160);
        ensureNode("JNC-B", "Sorting Junction B", "JUNCTION", 320, 360);
        ensureNode("SEC-1", "Security Screening 1", "SECURITY", 520, 160);
        ensureNode("SEC-2", "Security Screening 2", "SECURITY", 520, 360);
        ensureNode("JNC-C", "Distributor Hub C", "JUNCTION", 720, 260);
        ensureNode("BAY-01", "Pier A Bay 1", "BAY", 920, 90);
        ensureNode("BAY-02", "Pier B Bay 2", "BAY", 920, 190);
        ensureNode("BAY-04", "Pier D Bay 4", "BAY", 920, 430);

        // Ensure loading bays exist
        bay1 = bayRepo.findById("BAY-01").orElseGet(() ->
                bayRepo.save(new LoadingBay("BAY-01", "Loading Bay 1", "BAY-01", "Domestic Pier A")));
        bay2 = bayRepo.findById("BAY-02").orElseGet(() ->
                bayRepo.save(new LoadingBay("BAY-02", "Loading Bay 2", "BAY-02", "Domestic Pier B")));
        bayRepo.findById("BAY-04").orElseGet(() ->
                bayRepo.save(new LoadingBay("BAY-04", "Loading Bay 4", "BAY-04", "International Pier D")));

        // Ensure flights exist
        LocalDateTime baseTime = LocalDateTime.of(2026, 10, 12, 9, 30, 0);
        flight101 = flightRepo.findById("FL-101").orElseGet(() ->
                flightRepo.save(new Flight("FL-101", "VA-501", "Delhi", baseTime, baseTime.minusMinutes(45), bay1, FlightStatus.BOARDING)));
        flight102 = flightRepo.findById("FL-102").orElseGet(() ->
                flightRepo.save(new Flight("FL-102", "VA-204", "Mumbai", baseTime.plusMinutes(20), baseTime.minusMinutes(25), bay2, FlightStatus.SCHEDULED)));

        // Ensure baseline conveyor segments exist
        ensureSegment("SEG-01", "CHK-1", "JNC-A", 45, true);
        ensureSegment("SEG-02", "CHK-2", "JNC-B", 50, true);
        ensureSegment("SEG-03", "TRF-1", "JNC-B", 35, true);
        ensureSegment("SEG-04", "JNC-A", "JNC-B", 30, true);
        ensureSegment("SEG-05", "JNC-B", "JNC-A", 30, true);
        ensureSegment("SEG-06", "JNC-A", "SEC-1", 60, false); // Failed by default
        ensureSegment("SEG-07", "JNC-A", "SEC-2", 75, true);  // Bypass
        ensureSegment("SEG-08", "JNC-B", "SEC-2", 55, true);
        ensureSegment("SEG-09", "JNC-B", "SEC-1", 70, true);
        ensureSegment("SEG-10", "SEC-1", "JNC-C", 40, true);
        ensureSegment("SEG-11", "SEC-2", "JNC-C", 45, true);
        ensureSegment("SEG-12", "JNC-C", "BAY-01", 50, true);
        ensureSegment("SEG-13", "JNC-C", "BAY-02", 45, true);
        ensureSegment("SEG-15", "JNC-C", "BAY-04", 65, true);
        ensureSegment("SEG-17", "SEC-2", "BAY-04", 85, true);
    }

    private void ensureNode(String id, String name, String type, int x, int y) {
        if (!nodeRepo.existsById(id)) {
            nodeRepo.save(new ConveyorNode(id, name, type, x, y));
        }
    }

    private void ensureSegment(String id, String src, String dst, int time, boolean avail) {
        ConveyorSegment seg = segmentRepo.findById(id).orElse(null);
        if (seg == null) {
            segmentRepo.save(new ConveyorSegment(id, src, dst, time, avail));
        } else {
            seg.setAvailable(avail);
            segmentRepo.save(seg);
        }
    }

    // ==========================================
    // 1. DIJKSTRA ROUTING TESTS
    // ==========================================

    @Test
    @DisplayName("Rule 1: Dijkstra finds optimal route from Check-in 1 to Bay 1")
    void testDijkstraHappyPath_CHK1_to_BAY01() {
        RouteResult result = dijkstraService.findShortestPath("CHK-1", "BAY-01");
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getNodeSequence()).contains("CHK-1", "JNC-A", "BAY-01");
        assertThat(result.getTotalTravelTime()).isGreaterThan(0);
        assertThat(result.getStatus()).isEqualTo(RoutingResultStatus.OPTIMAL_FOUND);
    }

    @Test
    @DisplayName("Rule 2: Dijkstra finds optimal route from Transfer 1 to Bay 4")
    void testDijkstraHappyPath_TRF1_to_BAY04() {
        RouteResult result = dijkstraService.findShortestPath("TRF-1", "BAY-04");
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getNodeSequence().get(0)).isEqualTo("TRF-1");
        assertThat(result.getNodeSequence().get(result.getNodeSequence().size() - 1)).isEqualTo("BAY-04");
        assertThat(result.getTotalTravelTime()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Rule 3: Dijkstra reroutes via SEC-2 when primary SEG-06 is offline")
    void testDijkstraSEG06Down_BypassViaSEC2() {
        // Ensure SEG-06 is unavailable
        ConveyorSegment seg6 = segmentRepo.findById("SEG-06").orElseThrow();
        seg6.setAvailable(false);
        segmentRepo.save(seg6);

        RouteResult result = dijkstraService.findShortestPath("CHK-1", "BAY-01");
        assertThat(result.isSuccess()).isTrue();
        // Since SEG-06 (JNC-A -> SEC-1) is down, route must bypass through SEC-2
        assertThat(result.getNodeSequence()).contains("SEC-2");
        assertThat(result.getNodeSequence()).doesNotContain("SEC-1");
    }

    @Test
    @DisplayName("Rule 4: Dijkstra returns UNREACHABLE for isolated or disconnected nodes")
    void testDijkstraUnreachable_IsolatedNode() {
        ensureNode("ISO-99", "Isolated Checkpoint", "CHECKIN", 50, 50);
        RouteResult result = dijkstraService.findShortestPath("ISO-99", "BAY-01");
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getStatus()).isEqualTo(RoutingResultStatus.UNREACHABLE);
    }

    @Test
    @DisplayName("Rule 5: Dijkstra detects bag already present at destination loading bay")
    void testDijkstraAlreadyAtDestination() {
        RouteResult result = dijkstraService.findShortestPath("BAY-01", "BAY-01");
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getStatus()).isEqualTo(RoutingResultStatus.ALREADY_AT_DESTINATION);
        assertThat(result.getTotalTravelTime()).isEqualTo(0);
        assertThat(result.getNodeSequence()).containsExactly("BAY-01");
    }

    // ==========================================
    // 2. PRIORITY QUEUE DISPATCH RULES
    // ==========================================

    @Test
    @DisplayName("Rule 6: First Class baggage is dispatched ahead of Economy under identical cutoff")
    void testPriorityQueue_FirstClassBeforeEconomy() {
        baggageRepo.deleteAll();
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);

        OriginBag econBag = new OriginBag("TEST-ECON", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 1, cutoff.minusHours(1), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        OriginBag firstBag = new OriginBag("TEST-FIRST", flight101, "CHK-1", bay1,
                PassengerCategory.FIRST, 1, 2, cutoff.minusHours(1), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");

        baggageRepo.save(econBag);
        baggageRepo.save(firstBag);

        List<BaggageDto> queue = queueService.getDispatchQueue();
        assertThat(queue).hasSize(2);
        assertThat(queue.get(0).getBaggageId()).isEqualTo("TEST-FIRST");
        assertThat(queue.get(1).getBaggageId()).isEqualTo("TEST-ECON");
    }

    @Test
    @DisplayName("Rule 7: Bag with earlier departure cutoff always supersedes later cutoff")
    void testPriorityQueue_EarlierCutoffFirst() {
        baggageRepo.deleteAll();
        LocalDateTime earlyCutoff = LocalDateTime.of(2026, 10, 12, 8, 45, 0);
        LocalDateTime lateCutoff = LocalDateTime.of(2026, 10, 12, 9, 30, 0);

        OriginBag econEarly = new OriginBag("TEST-EARLY-ECON", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 1, earlyCutoff.minusHours(1), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, earlyCutoff, "CHK-1");
        OriginBag firstLate = new OriginBag("TEST-LATE-FIRST", flight102, "CHK-1", bay2,
                PassengerCategory.FIRST, 1, 2, earlyCutoff.minusHours(1), true,
                BaggageStatus.READY, "CHK-1 -> BAY-02", 120, lateCutoff, "CHK-1");

        baggageRepo.save(firstLate);
        baggageRepo.save(econEarly);

        List<BaggageDto> queue = queueService.getDispatchQueue();
        assertThat(queue.get(0).getBaggageId()).isEqualTo("TEST-EARLY-ECON");
        assertThat(queue.get(1).getBaggageId()).isEqualTo("TEST-LATE-FIRST");
    }

    @Test
    @DisplayName("Rule 8: Transfer bags outrank Origin bags when loading cutoffs are identical")
    void testPriorityQueue_TransferBeforeOriginOnTieCutoff() {
        baggageRepo.deleteAll();
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);

        OriginBag originBag = new OriginBag("ORIGIN-TIE", flight101, "CHK-1", bay1,
                PassengerCategory.BUSINESS, 2, 1, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        TransferBag transferBag = new TransferBag("TRF-TIE", flight101, "TRF-1", bay1,
                PassengerCategory.BUSINESS, 2, 2, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "TRF-1 -> BAY-01", 120, cutoff, "TRF-1");

        baggageRepo.save(originBag);
        baggageRepo.save(transferBag);

        List<BaggageDto> queue = queueService.getDispatchQueue();
        assertThat(queue.get(0).getBaggageId()).isEqualTo("TRF-TIE");
        assertThat(queue.get(1).getBaggageId()).isEqualTo("ORIGIN-TIE");
    }

    @Test
    @DisplayName("Rule 9: Declared passenger rank breaks tie when cutoffs and transfer status match")
    void testPriorityQueue_DeclaresRankBreaksTie() {
        baggageRepo.deleteAll();
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);

        OriginBag biz = new OriginBag("ORIGIN-BIZ", flight101, "CHK-1", bay1,
                PassengerCategory.BUSINESS, 2, 1, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        OriginBag ff = new OriginBag("ORIGIN-FF", flight101, "CHK-1", bay1,
                PassengerCategory.FREQUENT_FLYER, 3, 2, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");

        baggageRepo.save(ff);
        baggageRepo.save(biz);

        List<BaggageDto> queue = queueService.getDispatchQueue();
        assertThat(queue.get(0).getBaggageId()).isEqualTo("ORIGIN-BIZ");
        assertThat(queue.get(1).getBaggageId()).isEqualTo("ORIGIN-FF");
    }

    @Test
    @DisplayName("Rule 10: Arrival order breaks final tie when all other parameters are identical")
    void testPriorityQueue_ArrivalOrderBreaksFullTie() {
        baggageRepo.deleteAll();
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);

        OriginBag bagA = new OriginBag("BAG-EARLIER-ARR", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 10, cutoff.minusMinutes(40), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        OriginBag bagB = new OriginBag("BAG-LATER-ARR", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 25, cutoff.minusMinutes(35), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");

        baggageRepo.save(bagB);
        baggageRepo.save(bagA);

        List<BaggageDto> queue = queueService.getDispatchQueue();
        assertThat(queue.get(0).getBaggageId()).isEqualTo("BAG-EARLIER-ARR");
        assertThat(queue.get(1).getBaggageId()).isEqualTo("BAG-LATER-ARR");
    }

    // ==========================================
    // 3. BAGGAGE STATE MACHINE TRANSITIONS
    // ==========================================

    @Test
    @DisplayName("Rule 11: Granting clearance moves bag from AWAITING_CLEARANCE to READY")
    void testBaggageStateTransition_GrantClearance() {
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);
        OriginBag bag = new OriginBag("TEST-CLEAR-1", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 1, cutoff.minusMinutes(30), false,
                BaggageStatus.AWAITING_CLEARANCE, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        baggageRepo.save(bag);

        BaggageDto updated = baggageService.grantClearance("TEST-CLEAR-1");
        assertThat(updated.isOperatorClearance()).isTrue();
        assertThat(updated.getBaggageProcessingStatus()).isEqualTo(BaggageStatus.READY);
    }

    @Test
    @DisplayName("Rule 12: Revoking clearance moves bag from READY back to AWAITING_CLEARANCE")
    void testBaggageStateTransition_RevokeClearance() {
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);
        OriginBag bag = new OriginBag("TEST-CLEAR-2", flight101, "CHK-1", bay1,
                PassengerCategory.ECONOMY, 4, 1, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "CHK-1 -> BAY-01", 120, cutoff, "CHK-1");
        baggageRepo.save(bag);

        BaggageDto updated = baggageService.revokeClearance("TEST-CLEAR-2");
        assertThat(updated.isOperatorClearance()).isFalse();
        assertThat(updated.getBaggageProcessingStatus()).isEqualTo(BaggageStatus.AWAITING_CLEARANCE);
    }

    @Test
    @DisplayName("Rule 13: Scanning bag at automated node transitions READY to IN_TRANSIT")
    void testBaggageStateTransition_ScanAtNode() {
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 9, 0, 0);
        OriginBag bag = new OriginBag("TEST-SCAN-1", flight101, "CHK-1", bay1,
                PassengerCategory.BUSINESS, 2, 1, cutoff.minusMinutes(30), true,
                BaggageStatus.READY, "CHK-1 -> JNC-A -> BAY-01", 120, cutoff, "CHK-1");
        baggageRepo.save(bag);

        BaggageDto updated = baggageService.scanBaggageAtNode("TEST-SCAN-1", "JNC-A", 45);
        assertThat(updated.getCurrentLocation()).isEqualTo("JNC-A");
        assertThat(updated.getBaggageProcessingStatus()).isEqualTo(BaggageStatus.IN_TRANSIT);
        assertThat(updated.getEstimatedRemainingTravelTime()).isEqualTo(75);
        assertThat(updated.getScanHistory()).contains("JNC-A");
    }

    @Test
    @DisplayName("Rule 14: Confirm loaded marks bag LOADED when at correct bay before cutoff with clearance")
    void testBaggageStateTransition_ConfirmLoaded_Success() {
        LocalDateTime futureCutoff = LocalDateTime.of(2026, 10, 12, 12, 0, 0);
        OriginBag bag = new OriginBag("TEST-LOAD-OK", flight101, "BAY-01", bay1,
                PassengerCategory.FIRST, 1, 1, LocalDateTime.now(), true,
                BaggageStatus.IN_TRANSIT, "CHK-1 -> BAY-01", 0, futureCutoff, "CHK-1 -> BAY-01");
        baggageRepo.save(bag);

        BaggageDto loaded = baggageService.confirmBaggageLoaded("TEST-LOAD-OK");
        assertThat(loaded.getBaggageProcessingStatus()).isEqualTo(BaggageStatus.LOADED);
        assertThat(loaded.getEstimatedRemainingTravelTime()).isEqualTo(0);
    }

    @Test
    @DisplayName("Rule 15: Bag cannot be confirmed loaded without operator security clearance")
    void testBaggageStateTransition_ConfirmLoaded_NoClearance() {
        LocalDateTime futureCutoff = LocalDateTime.of(2026, 10, 12, 12, 0, 0);
        OriginBag bag = new OriginBag("TEST-NO-CLEAR", flight101, "BAY-01", bay1,
                PassengerCategory.ECONOMY, 4, 1, LocalDateTime.now(), false,
                BaggageStatus.AWAITING_CLEARANCE, "CHK-1 -> BAY-01", 0, futureCutoff, "CHK-1");
        baggageRepo.save(bag);

        assertThatThrownBy(() -> baggageService.confirmBaggageLoaded("TEST-NO-CLEAR"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Rule 16: Bag confirmed past cutoff is rejected and marked MISSED_CUTOFF")
    void testBaggageStateTransition_ConfirmLoaded_MissedCutoff() {
        // Set cutoff in the past relative to simulated time (08:15:00)
        LocalDateTime pastCutoff = LocalDateTime.of(2026, 10, 12, 8, 0, 0);
        OriginBag bag = new OriginBag("TEST-MISSED", flight101, "BAY-01", bay1,
                PassengerCategory.ECONOMY, 4, 1, pastCutoff.minusHours(1), true,
                BaggageStatus.IN_TRANSIT, "CHK-1 -> BAY-01", 0, pastCutoff, "BAY-01");
        baggageRepo.save(bag);

        assertThatThrownBy(() -> baggageService.confirmBaggageLoaded("TEST-MISSED"))
                .isInstanceOf(IllegalStateException.class);

        Baggage missedBag = baggageRepo.findById("TEST-MISSED").orElseThrow();
        assertThat(missedBag.getBaggageProcessingStatus()).isEqualTo(BaggageStatus.MISSED_CUTOFF);
    }

    // ==========================================
    // 4. TRANSFER PRIORITY AND DYNAMIC REROUTE
    // ==========================================

    @Test
    @DisplayName("Rule 17: TransferBag transferPriority returns 1 and OriginBag returns 2")
    void testTransferBagHasHigherPriorityThanOriginBag() {
        TransferBag trf = new TransferBag();
        OriginBag orig = new OriginBag();

        assertThat(trf.transferPriority()).isEqualTo(1);
        assertThat(orig.transferPriority()).isEqualTo(2);
        assertThat(trf.transferPriority()).isLessThan(orig.transferPriority());
    }

    @Test
    @DisplayName("Rule 18: Rerouting recalculates Dijkstra route, updates remaining time, and logs history")
    void testRerouteBaggage_UpdatesPlannedRoute() {
        LocalDateTime cutoff = LocalDateTime.of(2026, 10, 12, 10, 0, 0);
        OriginBag bag = new OriginBag("TEST-REROUTE-1", flight101, "CHK-1", bay1,
                PassengerCategory.BUSINESS, 2, 1, cutoff.minusHours(1), true,
                BaggageStatus.READY, "OLD_OBSOLETE_PATH", 999, cutoff, "CHK-1");
        baggageRepo.save(bag);

        BaggageDto rerouted = baggageService.rerouteBaggage("TEST-REROUTE-1");
        assertThat(rerouted.getPlannedRoute()).isNotEqualTo("OLD_OBSOLETE_PATH");
        assertThat(rerouted.getPlannedRoute()).contains("CHK-1", "BAY-01");
        assertThat(rerouted.getEstimatedRemainingTravelTime()).isGreaterThan(0);

        List<RoutingRecord> history = baggageService.getRoutingHistory("TEST-REROUTE-1");
        assertThat(history).isNotEmpty();
        assertThat(history.get(0).getRoutingReason()).isEqualTo("REROUTE");
    }
}
