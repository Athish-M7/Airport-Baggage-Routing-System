package com.vaanam.baggage.dto;

import java.time.LocalDateTime;

/**
 * Simulation state DTO exposing the current virtual clock and runtime settings.
 */
public class SimulationStateDto {

    private LocalDateTime currentSimulatedTime;
    private boolean running;
    private int speedMultiplier;

    public SimulationStateDto() {
    }

    public SimulationStateDto(LocalDateTime currentSimulatedTime, boolean running, int speedMultiplier) {
        this.currentSimulatedTime = currentSimulatedTime;
        this.running = running;
        this.speedMultiplier = speedMultiplier;
    }

    // ---- Getters and Setters ----

    public LocalDateTime getCurrentSimulatedTime() { return currentSimulatedTime; }
    public void setCurrentSimulatedTime(LocalDateTime currentSimulatedTime) { this.currentSimulatedTime = currentSimulatedTime; }

    public boolean isRunning() { return running; }
    public void setRunning(boolean running) { this.running = running; }

    public int getSpeedMultiplier() { return speedMultiplier; }
    public void setSpeedMultiplier(int speedMultiplier) { this.speedMultiplier = speedMultiplier; }
}
