package com.vaanam.baggage.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;

/**
 * Domain entity representing a directed edge segment within the automated conveyor system.
 */
@Entity
@Table(name = "conveyor_segments")
public class ConveyorSegment {

    @Id
    @Column(name = "segment_id", length = 50)
    private String segmentId;

    @Column(name = "source_node", nullable = false, length = 50)
    private String sourceNode;

    @Column(name = "destination_node", nullable = false, length = 50)
    private String destinationNode;

    @Column(name = "travel_time_seconds", nullable = false)
    private int travelTimeSeconds;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    public ConveyorSegment() {
    }

    public ConveyorSegment(String segmentId, String sourceNode, String destinationNode,
                           int travelTimeSeconds, boolean isAvailable) {
        if (travelTimeSeconds <= 0) {
            throw new IllegalArgumentException("Travel time must be strictly positive (> 0 seconds).");
        }
        this.segmentId = segmentId;
        this.sourceNode = sourceNode;
        this.destinationNode = destinationNode;
        this.travelTimeSeconds = travelTimeSeconds;
        this.isAvailable = isAvailable;
    }

    public void markFailed() {
        this.isAvailable = false;
    }

    public void markAvailable() {
        this.isAvailable = true;
    }

    public String getSegmentId() {
        return segmentId;
    }

    public void setSegmentId(String segmentId) {
        this.segmentId = segmentId;
    }

    public String getSourceNode() {
        return sourceNode;
    }

    public void setSourceNode(String sourceNode) {
        this.sourceNode = sourceNode;
    }

    public String getDestinationNode() {
        return destinationNode;
    }

    public void setDestinationNode(String destinationNode) {
        this.destinationNode = destinationNode;
    }

    public int getTravelTimeSeconds() {
        return travelTimeSeconds;
    }

    public void setTravelTimeSeconds(int travelTimeSeconds) {
        if (travelTimeSeconds <= 0) {
            throw new IllegalArgumentException("Travel time must be strictly positive (> 0 seconds).");
        }
        this.travelTimeSeconds = travelTimeSeconds;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConveyorSegment that = (ConveyorSegment) o;
        return Objects.equals(segmentId, that.segmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(segmentId);
    }

    @Override
    public String toString() {
        return "ConveyorSegment{" +
                "segmentId='" + segmentId + '\'' +
                ", " + sourceNode + " -> " + destinationNode +
                ", travelTime=" + travelTimeSeconds + "s" +
                ", available=" + isAvailable +
                '}';
    }
}
