package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.ConveyorNodeDto;
import com.vaanam.baggage.dto.ConveyorSegmentDto;
import com.vaanam.baggage.dto.RouteResponseDto;
import com.vaanam.baggage.model.ConveyorSegment;
import com.vaanam.baggage.repository.ConveyorNodeRepository;
import com.vaanam.baggage.repository.ConveyorSegmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * Service for querying and managing the conveyor network topology.
 */
@Service
@Transactional
public class ConveyorService {

    private final ConveyorNodeRepository nodeRepo;
    private final ConveyorSegmentRepository segmentRepo;
    private final DijkstraRoutingService dijkstraService;

    public ConveyorService(ConveyorNodeRepository nodeRepo,
                           ConveyorSegmentRepository segmentRepo,
                           DijkstraRoutingService dijkstraService) {
        this.nodeRepo = nodeRepo;
        this.segmentRepo = segmentRepo;
        this.dijkstraService = dijkstraService;
    }

    @Transactional(readOnly = true)
    public List<ConveyorNodeDto> getAllNodes() {
        return nodeRepo.findAll().stream()
                .map(ConveyorNodeDto::fromNode)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConveyorSegmentDto> getAllSegments() {
        return segmentRepo.findAll().stream()
                .map(ConveyorSegmentDto::fromSegment)
                .collect(Collectors.toList());
    }

    /**
     * Toggles the availability of a conveyor segment.
     *
     * @param segmentId the ID of the segment to toggle
     * @return updated {@link ConveyorSegmentDto}
     */
    public ConveyorSegmentDto setSegmentAvailability(String segmentId, boolean available) {
        ConveyorSegment seg = segmentRepo.findById(segmentId)
                .orElseThrow(() -> new NoSuchElementException(
                        "ConveyorSegment not found with id: " + segmentId));
        seg.setAvailable(available);
        segmentRepo.save(seg);
        return ConveyorSegmentDto.fromSegment(seg);
    }

    /**
     * Computes the shortest route between two nodes and returns the result as a DTO.
     *
     * @param startNode source node ID
     * @param destNode  destination node ID
     * @return {@link RouteResponseDto} with route details or failure information
     */
    public RouteResponseDto computeRoute(String startNode, String destNode) {
        return RouteResponseDto.fromRouteResult(
                dijkstraService.findShortestPath(startNode, destNode));
    }
}
