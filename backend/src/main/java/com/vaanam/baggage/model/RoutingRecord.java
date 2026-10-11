package com.vaanam.baggage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Domain entity recording the routing history, dynamic reroutes, and reachability events for baggage.
 */
@Entity
@Table(name = "routing_records")
public class RoutingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "baggage_id", nullable = false, length = 50)
    private String baggageId;

    @Column(name = "previous_route", columnDefinition = "TEXT")
    private String previousRoute;

    @Column(name = "new_route", columnDefinition = "TEXT")
    private String newRoute;

    @Column(name = "last_confirmed_node", nullable = false, length = 50)
    private String lastConfirmedNode;

    @Column(name = "total_estimated_travel_time", nullable = false)
    private int totalEstimatedTravelTime;

    @Column(name = "routing_reason", nullable = false)
    private String routingReason;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "routing_result", nullable = false, length = 50)
    private RoutingResultStatus routingResult;

    public RoutingRecord() {
    }

    public RoutingRecord(String baggageId, String previousRoute, String newRoute,
                         String lastConfirmedNode, int totalEstimatedTravelTime,
                         String routingReason, LocalDateTime timestamp,
                         RoutingResultStatus routingResult) {
        this.baggageId = baggageId;
        this.previousRoute = previousRoute;
        this.newRoute = newRoute;
        this.lastConfirmedNode = lastConfirmedNode;
        this.totalEstimatedTravelTime = totalEstimatedTravelTime;
        this.routingReason = routingReason;
        this.timestamp = timestamp;
        this.routingResult = routingResult;
    }

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getBaggageId() {
        return baggageId;
    }

    public void setBaggageId(String baggageId) {
        this.baggageId = baggageId;
    }

    public String getPreviousRoute() {
        return previousRoute;
    }

    public void setPreviousRoute(String previousRoute) {
        this.previousRoute = previousRoute;
    }

    public String getNewRoute() {
        return newRoute;
    }

    public void setNewRoute(String newRoute) {
        this.newRoute = newRoute;
    }

    public String getLastConfirmedNode() {
        return lastConfirmedNode;
    }

    public void setLastConfirmedNode(String lastConfirmedNode) {
        this.lastConfirmedNode = lastConfirmedNode;
    }

    public int getTotalEstimatedTravelTime() {
        return totalEstimatedTravelTime;
    }

    public void setTotalEstimatedTravelTime(int totalEstimatedTravelTime) {
        this.totalEstimatedTravelTime = totalEstimatedTravelTime;
    }

    public String getRoutingReason() {
        return routingReason;
    }

    public void setRoutingReason(String routingReason) {
        this.routingReason = routingReason;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public RoutingResultStatus getRoutingResult() {
        return routingResult;
    }

    public void setRoutingResult(RoutingResultStatus routingResult) {
        this.routingResult = routingResult;
    }

    @Override
    public String toString() {
        return "RoutingRecord{" +
                "baggageId='" + baggageId + '\'' +
                ", lastConfirmedNode='" + lastConfirmedNode + '\'' +
                ", routingReason='" + routingReason + '\'' +
                ", result=" + routingResult +
                '}';
    }
}
