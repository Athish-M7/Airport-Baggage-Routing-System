package com.vaanam.baggage.dto;

/**
 * Dashboard statistics DTO aggregating system-wide counts for the monitoring UI.
 */
public class DashboardStatsDto {

    private int totalBaggage;
    private int readyCount;
    private int inTransitCount;
    private int atRiskCount;
    private int loadedCount;
    private int awaitingClearanceCount;
    private int missedCutoffCount;
    private int unreachableCount;
    private int flightCount;
    private int activeSegmentCount;
    private int failedSegmentCount;
    private int nodeCount;

    public DashboardStatsDto() {
    }

    private DashboardStatsDto(Builder b) {
        this.totalBaggage = b.totalBaggage;
        this.readyCount = b.readyCount;
        this.inTransitCount = b.inTransitCount;
        this.atRiskCount = b.atRiskCount;
        this.loadedCount = b.loadedCount;
        this.awaitingClearanceCount = b.awaitingClearanceCount;
        this.missedCutoffCount = b.missedCutoffCount;
        this.unreachableCount = b.unreachableCount;
        this.flightCount = b.flightCount;
        this.activeSegmentCount = b.activeSegmentCount;
        this.failedSegmentCount = b.failedSegmentCount;
        this.nodeCount = b.nodeCount;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int totalBaggage;
        private int readyCount;
        private int inTransitCount;
        private int atRiskCount;
        private int loadedCount;
        private int awaitingClearanceCount;
        private int missedCutoffCount;
        private int unreachableCount;
        private int flightCount;
        private int activeSegmentCount;
        private int failedSegmentCount;
        private int nodeCount;

        public Builder totalBaggage(int v) { this.totalBaggage = v; return this; }
        public Builder readyCount(int v) { this.readyCount = v; return this; }
        public Builder inTransitCount(int v) { this.inTransitCount = v; return this; }
        public Builder atRiskCount(int v) { this.atRiskCount = v; return this; }
        public Builder loadedCount(int v) { this.loadedCount = v; return this; }
        public Builder awaitingClearanceCount(int v) { this.awaitingClearanceCount = v; return this; }
        public Builder missedCutoffCount(int v) { this.missedCutoffCount = v; return this; }
        public Builder unreachableCount(int v) { this.unreachableCount = v; return this; }
        public Builder flightCount(int v) { this.flightCount = v; return this; }
        public Builder activeSegmentCount(int v) { this.activeSegmentCount = v; return this; }
        public Builder failedSegmentCount(int v) { this.failedSegmentCount = v; return this; }
        public Builder nodeCount(int v) { this.nodeCount = v; return this; }

        public DashboardStatsDto build() {
            return new DashboardStatsDto(this);
        }
    }

    // ---- Getters ----

    public int getTotalBaggage() { return totalBaggage; }
    public int getReadyCount() { return readyCount; }
    public int getInTransitCount() { return inTransitCount; }
    public int getAtRiskCount() { return atRiskCount; }
    public int getLoadedCount() { return loadedCount; }
    public int getAwaitingClearanceCount() { return awaitingClearanceCount; }
    public int getMissedCutoffCount() { return missedCutoffCount; }
    public int getUnreachableCount() { return unreachableCount; }
    public int getFlightCount() { return flightCount; }
    public int getActiveSegmentCount() { return activeSegmentCount; }
    public int getFailedSegmentCount() { return failedSegmentCount; }
    public int getNodeCount() { return nodeCount; }
}
