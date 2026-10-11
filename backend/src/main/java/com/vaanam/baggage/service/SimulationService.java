package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.SimulationStateDto;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Manages the simulation virtual clock.
 * State is held in-memory; no database persistence for the clock itself.
 */
@Service
public class SimulationService {

    /** Initial simulated start time for Vaanam Airport scenario. */
    private static final LocalDateTime INITIAL_TIME = LocalDateTime.of(2026, 10, 12, 8, 15, 0);

    private LocalDateTime simulatedTime;
    private boolean running;
    private int speedMultiplier;

    @PostConstruct
    public void init() {
        this.simulatedTime = INITIAL_TIME;
        this.running = true;
        this.speedMultiplier = 1;
    }

    /**
     * Returns the current virtual simulated time.
     */
    public LocalDateTime getCurrentTime() {
        return simulatedTime;
    }

    /**
     * Returns a DTO snapshot of the current simulation state.
     */
    public SimulationStateDto getState() {
        return new SimulationStateDto(simulatedTime, running, speedMultiplier);
    }

    /**
     * Advances the virtual clock by the given number of minutes.
     *
     * @param minutes number of minutes to advance (must be > 0)
     * @return updated simulation state
     */
    public SimulationStateDto advanceTime(int minutes) {
        if (minutes <= 0) {
            throw new IllegalArgumentException("Minutes to advance must be greater than zero.");
        }
        simulatedTime = simulatedTime.plusMinutes(minutes);
        return getState();
    }

    /**
     * Sets the playback speed multiplier.
     *
     * @param multiplier speed factor (must be >= 1)
     * @return updated simulation state
     */
    public SimulationStateDto setSpeedMultiplier(int multiplier) {
        if (multiplier < 1) {
            throw new IllegalArgumentException("Speed multiplier must be at least 1.");
        }
        this.speedMultiplier = multiplier;
        return getState();
    }

    /**
     * Toggles between running and paused states.
     *
     * @return updated simulation state
     */
    public SimulationStateDto toggleRunning() {
        this.running = !this.running;
        return getState();
    }

    /**
     * Resets the virtual clock back to the initial scenario start time.
     *
     * @return updated simulation state
     */
    public SimulationStateDto resetToStart() {
        this.simulatedTime = INITIAL_TIME;
        this.running = true;
        this.speedMultiplier = 1;
        return getState();
    }
}
