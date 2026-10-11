package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.ConveyorSegment;

/**
 * Data Transfer Object for ConveyorSegment entity — no JPA annotations.
 */
public class ConveyorSegmentDto {

    private String segmentId;
    private String sourceNode;
    private String destinationNode;
    private int travelTimeSeconds;
    private boolean available;

    public ConveyorSegmentDto() {
    }

    /**
     * Factory method to convert a ConveyorSegment domain object to its DTO representation.
     */
    public static ConveyorSegmentDto fromSegment(ConveyorSegment s) {
        ConveyorSegmentDto dto = new ConveyorSegmentDto();
        dto.segmentId = s.getSegmentId();
        dto.sourceNode = s.getSourceNode();
        dto.destinationNode = s.getDestinationNode();
        dto.travelTimeSeconds = s.getTravelTimeSeconds();
        dto.available = s.isAvailable();
        return dto;
    }

    // ---- Getters and Setters ----

    public String getSegmentId() { return segmentId; }
    public void setSegmentId(String segmentId) { this.segmentId = segmentId; }

    public String getSourceNode() { return sourceNode; }
    public void setSourceNode(String sourceNode) { this.sourceNode = sourceNode; }

    public String getDestinationNode() { return destinationNode; }
    public void setDestinationNode(String destinationNode) { this.destinationNode = destinationNode; }

    public int getTravelTimeSeconds() { return travelTimeSeconds; }
    public void setTravelTimeSeconds(int travelTimeSeconds) { this.travelTimeSeconds = travelTimeSeconds; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
