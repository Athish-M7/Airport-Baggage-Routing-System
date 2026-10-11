package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.ConveyorNodeDto;
import com.vaanam.baggage.dto.ConveyorSegmentDto;
import com.vaanam.baggage.dto.RouteRequestDto;
import com.vaanam.baggage.dto.RouteResponseDto;
import com.vaanam.baggage.service.ConveyorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing conveyor network topology and routing endpoints.
 */
@RestController
@RequestMapping("/api/conveyor")
public class ConveyorController {

    private final ConveyorService conveyorService;

    public ConveyorController(ConveyorService conveyorService) {
        this.conveyorService = conveyorService;
    }

    /** GET /api/conveyor/nodes — all conveyor nodes */
    @GetMapping("/nodes")
    public ResponseEntity<List<ConveyorNodeDto>> getAllNodes() {
        return ResponseEntity.ok(conveyorService.getAllNodes());
    }

    /** GET /api/conveyor/segments — all conveyor segments */
    @GetMapping("/segments")
    public ResponseEntity<List<ConveyorSegmentDto>> getAllSegments() {
        return ResponseEntity.ok(conveyorService.getAllSegments());
    }

    /**
     * PATCH /api/conveyor/segments/{id}/toggle — flip a segment's availability.
     * Fetches current state and inverts it.
     */
    @PatchMapping("/segments/{id}/toggle")
    public ResponseEntity<ConveyorSegmentDto> toggleSegment(@PathVariable String id) {
        // Fetch current, invert
        List<ConveyorSegmentDto> all = conveyorService.getAllSegments();
        ConveyorSegmentDto current = all.stream()
                .filter(s -> s.getSegmentId().equals(id))
                .findFirst()
                .orElseThrow(() -> new java.util.NoSuchElementException(
                        "ConveyorSegment not found with id: " + id));
        boolean newAvailability = !current.isAvailable();
        return ResponseEntity.ok(conveyorService.setSegmentAvailability(id, newAvailability));
    }

    /** POST /api/conveyor/route — compute shortest route between two nodes */
    @PostMapping("/route")
    public ResponseEntity<RouteResponseDto> computeRoute(@RequestBody RouteRequestDto request) {
        return ResponseEntity.ok(
                conveyorService.computeRoute(request.startNode(), request.destinationNode()));
    }
}
