package com.vaanam.baggage.algorithm;

import com.vaanam.baggage.model.ConveyorSegment;
import java.util.*;

/**
 * Adjacency-list directed weighted graph representing the conveyor belt topology.
 * Uses Java HashMap for node-to-edge mappings.
 */
public class DirectedWeightedGraph {

    public static class Edge {
        private final String segmentId;
        private final String source;
        private final String destination;
        private final int weight;
        private final boolean available;

        public Edge(String segmentId, String source, String destination, int weight, boolean available) {
            this.segmentId = segmentId;
            this.source = source;
            this.destination = destination;
            this.weight = weight;
            this.available = available;
        }

        public String getSegmentId() {
            return segmentId;
        }

        public String getSource() {
            return source;
        }

        public String getDestination() {
            return destination;
        }

        public int getWeight() {
            return weight;
        }

        public boolean isAvailable() {
            return available;
        }
    }

    // Adjacency list using HashMap
    private final Map<String, List<Edge>> adjacencyList = new HashMap<>();
    private final Set<String> vertices = new HashSet<>();

    public DirectedWeightedGraph() {
    }

    public static DirectedWeightedGraph fromSegments(Collection<ConveyorSegment> segments) {
        DirectedWeightedGraph graph = new DirectedWeightedGraph();
        for (ConveyorSegment seg : segments) {
            graph.addVertex(seg.getSourceNode());
            graph.addVertex(seg.getDestinationNode());
            graph.addEdge(new Edge(
                    seg.getSegmentId(),
                    seg.getSourceNode(),
                    seg.getDestinationNode(),
                    seg.getTravelTimeSeconds(),
                    seg.isAvailable()
            ));
        }
        return graph;
    }

    public void addVertex(String vertex) {
        vertices.add(vertex);
        adjacencyList.putIfAbsent(vertex, new ArrayList<>());
    }

    public void addEdge(Edge edge) {
        addVertex(edge.getSource());
        addVertex(edge.getDestination());
        adjacencyList.get(edge.getSource()).add(edge);
    }

    public List<Edge> getOutgoingEdges(String vertex) {
        return adjacencyList.getOrDefault(vertex, Collections.emptyList());
    }

    public Set<String> getVertices() {
        return Collections.unmodifiableSet(vertices);
    }

    public boolean containsVertex(String vertex) {
        return vertices.contains(vertex);
    }
}
