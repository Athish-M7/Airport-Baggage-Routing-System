package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.SimulationStateDto;
import com.vaanam.baggage.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing the virtual simulation clock.
 */
@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /** GET /api/simulation/state — current simulation clock state */
    @GetMapping("/state")
    public ResponseEntity<SimulationStateDto> getState() {
        return ResponseEntity.ok(simulationService.getState());
    }

    /** POST /api/simulation/advance?minutes={n} — advance virtual clock */
    @PostMapping("/advance")
    public ResponseEntity<SimulationStateDto> advanceTime(@RequestParam int minutes) {
        return ResponseEntity.ok(simulationService.advanceTime(minutes));
    }

    /** POST /api/simulation/toggle — pause / resume simulation */
    @PostMapping("/toggle")
    public ResponseEntity<SimulationStateDto> toggleRunning() {
        return ResponseEntity.ok(simulationService.toggleRunning());
    }

    /** POST /api/simulation/reset — reset clock to scenario start time */
    @PostMapping("/reset")
    public ResponseEntity<SimulationStateDto> resetToStart() {
        return ResponseEntity.ok(simulationService.resetToStart());
    }

    /** POST /api/simulation/speed?multiplier={n} — set playback speed multiplier */
    @PostMapping("/speed")
    public ResponseEntity<SimulationStateDto> setSpeedMultiplier(@RequestParam int multiplier) {
        return ResponseEntity.ok(simulationService.setSpeedMultiplier(multiplier));
    }
}
