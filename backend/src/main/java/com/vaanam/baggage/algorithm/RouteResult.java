package com.vaanam.baggage.algorithm;

import com.vaanam.baggage.model.RoutingResultStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result DTO containing the outcome of a Dijkstra shortest-path route calculation.
 */
public class RouteResult {
    private final boolean success;
    private final List<String> nodeSequence;
    private final List<String> segmentSequence;
    private final int totalTravelTime;
    private final RoutingResultStatus status;
    private final String message;

    public RouteResult(boolean success, List<String> nodeSequence, List<String> segmentSequence,
                       int totalTravelTime, RoutingResultStatus status, String message) {
        this.success = success;
        this.nodeSequence = nodeSequence != null ? Collections.unmodifiableList(new ArrayList<>(nodeSequence)) : Collections.emptyList();
        this.segmentSequence = segmentSequence != null ? Collections.unmodifiableList(new ArrayList<>(segmentSequence)) : Collections.emptyList();
        this.totalTravelTime = totalTravelTime;
        this.status = status;
        this.message = message;
    }

    public static RouteResult unreachable(String startNode, String destNode, String reason) {
        return new RouteResult(
                false,
                Collections.emptyList(),
                Collections.emptyList(),
                0,
                RoutingResultStatus.UNREACHABLE,
                "No viable route from " + startNode + " to " + destNode + ": " + reason
        );
    }

    public static RouteResult alreadyAtDestination(String node) {
        return new RouteResult(
                true,
                Collections.singletonList(node),
                Collections.emptyList(),
                0,
                RoutingResultStatus.ALREADY_AT_DESTINATION,
                "Baggage already at target destination: " + node
        );
    }

    public boolean isSuccess() {
        return success;
    }

    public List<String> getNodeSequence() {
        return nodeSequence;
    }

    public List<String> getSegmentSequence() {
        return segmentSequence;
    }

    public int getTotalTravelTime() {
        return totalTravelTime;
    }

    public RoutingResultStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public String getFormattedRoute() {
        if (nodeSequence.isEmpty()) {
            return "NONE";
        }
        return String.join(" -> ", nodeSequence);
    }

    @Override
    public String toString() {
        return "RouteResult{" +
                "success=" + success +
                ", path=" + getFormattedRoute() +
                ", time=" + totalTravelTime + "s" +
                ", status=" + status +
                '}';
    }
}
