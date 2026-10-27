package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.BaggageDto;
import com.vaanam.baggage.dto.CreateBaggageRequestDto;
import com.vaanam.baggage.dto.ScanEventDto;
import com.vaanam.baggage.model.BaggageStatus;
import com.vaanam.baggage.model.RoutingRecord;
import com.vaanam.baggage.service.BaggageQueueService;
import com.vaanam.baggage.service.BaggageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing baggage lifecycle and routing endpoints.
 */
@RestController
@RequestMapping("/api/baggage")
public class BaggageController {

    private final BaggageService baggageService;
    private final BaggageQueueService queueService;

    public BaggageController(BaggageService baggageService, BaggageQueueService queueService) {
        this.baggageService = baggageService;
        this.queueService = queueService;
    }

    /** GET /api/baggage — list all baggage items */
    @GetMapping
    public ResponseEntity<List<BaggageDto>> getAllBaggage() {
        return ResponseEntity.ok(baggageService.getAllBaggage());
    }

    /** POST /api/baggage — manual check-in / create baggage */
    @PostMapping
    public ResponseEntity<BaggageDto> createBaggage(@RequestBody CreateBaggageRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(baggageService.createBaggage(dto));
    }

    /** DELETE /api/baggage/{id} — remove baggage */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBaggage(@PathVariable String id) {
        baggageService.deleteBaggage(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/baggage/queue — priority-ordered dispatch queue */
    @GetMapping("/queue")
    public ResponseEntity<List<BaggageDto>> getDispatchQueue() {
        return ResponseEntity.ok(queueService.getDispatchQueue());
    }

    /** GET /api/baggage/{id} — single baggage item by ID */
    @GetMapping("/{id}")
    public ResponseEntity<BaggageDto> getBaggageById(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.getBaggageById(id));
    }

    /** GET /api/baggage/flight/{fid} — all bags on a given flight */
    @GetMapping("/flight/{fid}")
    public ResponseEntity<List<BaggageDto>> getBaggageByFlight(@PathVariable String fid) {
        return ResponseEntity.ok(baggageService.getBaggageByFlight(fid));
    }

    /** GET /api/baggage/status/{s} — bags filtered by processing status */
    @GetMapping("/status/{s}")
    public ResponseEntity<List<BaggageDto>> getBaggageByStatus(@PathVariable String s) {
        BaggageStatus status = BaggageStatus.valueOf(s.toUpperCase());
        return ResponseEntity.ok(baggageService.getBaggageByStatus(status));
    }

    /** POST /api/baggage/{id}/clearance/grant — grant operator clearance */
    @PostMapping("/{id}/clearance/grant")
    public ResponseEntity<BaggageDto> grantClearance(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.grantClearance(id));
    }

    /** POST /api/baggage/{id}/clearance/revoke — revoke operator clearance */
    @PostMapping("/{id}/clearance/revoke")
    public ResponseEntity<BaggageDto> revokeClearance(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.revokeClearance(id));
    }

    /** POST /api/baggage/{id}/scan — record a conveyor node scan event */
    @PostMapping("/{id}/scan")
    public ResponseEntity<BaggageDto> scanBaggageAtNode(
            @PathVariable String id,
            @RequestBody ScanEventDto scanEvent) {
        return ResponseEntity.ok(
                baggageService.scanBaggageAtNode(id, scanEvent.nodeId(), scanEvent.travelTimeDeduction()));
    }

    /** POST /api/baggage/{id}/loaded — confirm baggage has been loaded onto aircraft */
    @PostMapping("/{id}/loaded")
    public ResponseEntity<BaggageDto> confirmBaggageLoaded(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.confirmBaggageLoaded(id));
    }

    /** POST /api/baggage/{id}/reroute — recalculate route from current location */
    @PostMapping("/{id}/reroute")
    public ResponseEntity<BaggageDto> rerouteBaggage(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.rerouteBaggage(id));
    }

    /** GET /api/baggage/{id}/history — full routing record history for a bag */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<RoutingRecord>> getRoutingHistory(@PathVariable String id) {
        return ResponseEntity.ok(baggageService.getRoutingHistory(id));
    }
}
