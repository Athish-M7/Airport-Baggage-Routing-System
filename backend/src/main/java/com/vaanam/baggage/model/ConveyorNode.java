package com.vaanam.baggage.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;

/**
 * Domain entity representing a node/checkpoint in the conveyor network graph.
 */
@Entity
@Table(name = "conveyor_nodes")
public class ConveyorNode {

    @Id
    @Column(name = "node_id", length = 50)
    private String nodeId;

    @Column(name = "node_name", nullable = false, length = 100)
    private String nodeName;

    @Column(name = "node_type", nullable = false, length = 50)
    private String nodeType;

    @Column(name = "x_pos", nullable = false)
    private int xPos;

    @Column(name = "y_pos", nullable = false)
    private int yPos;

    public ConveyorNode() {
    }

    public ConveyorNode(String nodeId, String nodeName, String nodeType, int xPos, int yPos) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.nodeType = nodeType;
        this.xPos = xPos;
        this.yPos = yPos;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeType() {
        return nodeType;
    }

    public void setNodeType(String nodeType) {
        this.nodeType = nodeType;
    }

    public int getxPos() {
        return xPos;
    }

    public void setxPos(int xPos) {
        this.xPos = xPos;
    }

    public int getyPos() {
        return yPos;
    }

    public void setyPos(int yPos) {
        this.yPos = yPos;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConveyorNode that = (ConveyorNode) o;
        return Objects.equals(nodeId, that.nodeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nodeId);
    }
}
