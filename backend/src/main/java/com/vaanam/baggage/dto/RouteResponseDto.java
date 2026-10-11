package com.vaanam.baggage.dto;

import com.vaanam.baggage.algorithm.RouteResult;

import java.util.List;

/**
 * Response DTO carrying the result of a Dijkstra route computation.
 */
public class RouteResponseDto {

    private boolean success;
    private String formattedRoute;
    private List<String> nodeSequence;
    private List<String> segmentSequence;
    private int totalTravelTimeSeconds;
    private String status;
    private String message;

    public RouteResponseDto() {
    }

    /**
     * Factory method to build a RouteResponseDto from a RouteResult algorithm output.
     */
    public static RouteResponseDto fromRouteResult(RouteResult result) {
        RouteResponseDto dto = new RouteResponseDto();
        dto.success = result.isSuccess();
        dto.formattedRoute = result.getFormattedRoute();
        dto.nodeSequence = result.getNodeSequence();
        dto.segmentSequence = result.getSegmentSequence();
        dto.totalTravelTimeSeconds = result.getTotalTravelTime();
        dto.status = result.getStatus() != null ? result.getStatus().name() : null;
        dto.message = result.getMessage();
        return dto;
    }

    // ---- Getters and Setters ----

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getFormattedRoute() { return formattedRoute; }
    public void setFormattedRoute(String formattedRoute) { this.formattedRoute = formattedRoute; }

    public List<String> getNodeSequence() { return nodeSequence; }
    public void setNodeSequence(List<String> nodeSequence) { this.nodeSequence = nodeSequence; }

    public List<String> getSegmentSequence() { return segmentSequence; }
    public void setSegmentSequence(List<String> segmentSequence) { this.segmentSequence = segmentSequence; }

    public int getTotalTravelTimeSeconds() { return totalTravelTimeSeconds; }
    public void setTotalTravelTimeSeconds(int totalTravelTimeSeconds) { this.totalTravelTimeSeconds = totalTravelTimeSeconds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
