package com.vaanam.baggage.dto;

import com.vaanam.baggage.model.ConveyorNode;

/**
 * Data Transfer Object for ConveyorNode entity — no JPA annotations.
 */
public class ConveyorNodeDto {

    private String nodeId;
    private String nodeName;
    private String nodeType;
    private int xPos;
    private int yPos;

    public ConveyorNodeDto() {
    }

    /**
     * Factory method to convert a ConveyorNode domain object to its DTO representation.
     */
    public static ConveyorNodeDto fromNode(ConveyorNode n) {
        ConveyorNodeDto dto = new ConveyorNodeDto();
        dto.nodeId = n.getNodeId();
        dto.nodeName = n.getNodeName();
        dto.nodeType = n.getNodeType();
        dto.xPos = n.getxPos();
        dto.yPos = n.getyPos();
        return dto;
    }

    // ---- Getters and Setters ----

    public String getNodeId() { return nodeId; }
    public void setNodeId(String nodeId) { this.nodeId = nodeId; }

    public String getNodeName() { return nodeName; }
    public void setNodeName(String nodeName) { this.nodeName = nodeName; }

    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }

    public int getXPos() { return xPos; }
    public void setXPos(int xPos) { this.xPos = xPos; }

    public int getYPos() { return yPos; }
    public void setYPos(int yPos) { this.yPos = yPos; }
}
