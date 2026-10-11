package com.vaanam.baggage.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;

/**
 * Domain entity identifying the destination loading bay assigned to an aircraft.
 */
@Entity
@Table(name = "loading_bays")
public class LoadingBay {

    @Id
    @Column(name = "bay_id", length = 50)
    private String bayId;

    @Column(name = "bay_name", nullable = false, length = 100)
    private String bayName;

    @Column(name = "node_id", nullable = false, length = 50)
    private String nodeId;

    @Column(name = "description")
    private String description;

    public LoadingBay() {
    }

    public LoadingBay(String bayId, String bayName, String nodeId, String description) {
        this.bayId = bayId;
        this.bayName = bayName;
        this.nodeId = nodeId;
        this.description = description;
    }

    public String getBayId() {
        return bayId;
    }

    public void setBayId(String bayId) {
        this.bayId = bayId;
    }

    public String getBayName() {
        return bayName;
    }

    public void setBayName(String bayName) {
        this.bayName = bayName;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoadingBay that = (LoadingBay) o;
        return Objects.equals(bayId, that.bayId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bayId);
    }

    @Override
    public String toString() {
        return "LoadingBay{" +
                "bayId='" + bayId + '\'' +
                ", bayName='" + bayName + '\'' +
                ", nodeId='" + nodeId + '\'' +
                '}';
    }
}
