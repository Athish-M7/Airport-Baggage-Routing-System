package com.vaanam.baggage.service;

import com.vaanam.baggage.algorithm.DirectedWeightedGraph;
import com.vaanam.baggage.algorithm.RouteResult;
import com.vaanam.baggage.model.ConveyorSegment;
import com.vaanam.baggage.model.RoutingResultStatus;
import com.vaanam.baggage.repository.ConveyorSegmentRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Implements Dijkstra's shortest-path algorithm over the conveyor network graph.
 * Only traverses segments where {@code isAvailable == true}.
 */
@Service
public class DijkstraRoutingService {

    private final ConveyorSegmentRepository segmentRepo;

    public DijkstraRoutingService(ConveyorSegmentRepository segmentRepo) {
        this.segmentRepo = segmentRepo;
    }

    /**
     * Compute the shortest (minimum travel-time) path from startNode to destinationNode
     * using only currently available conveyor segments.
     *
     * @param startNode       ID of the source node
     * @param destinationNode ID of the target node
     * @return a {@link RouteResult} describing the path or failure reason
     */
    public RouteResult findShortestPath(String startNode, String destinationNode) {
        if (startNode == null || destinationNode == null) {
            throw new IllegalArgumentException("startNode and destinationNode must not be null");
        }

        // Already at destination — no movement required
        if (startNode.equals(destinationNode)) {
            return RouteResult.alreadyAtDestination(startNode);
        }

        // Build graph from all segments (available or not — we filter in traversal)
        List<ConveyorSegment> allSegments = segmentRepo.findAll();
        DirectedWeightedGraph graph = DirectedWeightedGraph.fromSegments(allSegments);

        // Validate that both nodes exist in the graph
        if (!graph.containsVertex(startNode)) {
            return RouteResult.unreachable(startNode, destinationNode,
                    "Start node '" + startNode + "' does not exist in the conveyor graph.");
        }
        if (!graph.containsVertex(destinationNode)) {
            return RouteResult.unreachable(startNode, destinationNode,
                    "Destination node '" + destinationNode + "' does not exist in the conveyor graph.");
        }

        // dist[node] = best known travel time (seconds) from startNode
        Map<String, Integer> dist = new HashMap<>();
        // predecessor[node] = the node we came from on the best path
        Map<String, String> predecessor = new HashMap<>();
        // segmentUsed[node] = which segment was used to arrive at this node on the best path
        Map<String, String> segmentUsed = new HashMap<>();

        // Initialise all known vertices to infinity
        for (String vertex : graph.getVertices()) {
            dist.put(vertex, Integer.MAX_VALUE);
        }
        dist.put(startNode, 0);

        // Min-heap: int[] { tentativeDist, nodeId (via auxiliary map) }
        // We store (distance, nodeId) pairs; use a priority queue keyed on distance.
        // Java PriorityQueue sorted by distance ascending.
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
        // We use a secondary nodeIndex map to avoid embedding string in int[]
        Map<Integer, String> indexToNode = new HashMap<>();
        Map<String, Integer> nodeToIndex = new HashMap<>();
        int idx = 0;
        for (String vertex : graph.getVertices()) {
            nodeToIndex.put(vertex, idx);
            indexToNode.put(idx, vertex);
            idx++;
        }

        pq.offer(new int[]{0, nodeToIndex.get(startNode)});

        Set<String> settled = new HashSet<>();

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int currentDist = current[0];
            String currentNode = indexToNode.get(current[1]);

            if (currentNode == null) continue;
            if (settled.contains(currentNode)) continue;
            settled.add(currentNode);

            // Early exit when destination is settled
            if (currentNode.equals(destinationNode)) {
                break;
            }

            // Skip stale entries
            if (currentDist > dist.getOrDefault(currentNode, Integer.MAX_VALUE)) {
                continue;
            }

            for (DirectedWeightedGraph.Edge edge : graph.getOutgoingEdges(currentNode)) {
                // Only traverse available segments
                if (!edge.isAvailable()) {
                    continue;
                }
                String neighbour = edge.getDestination();
                int newDist = dist.getOrDefault(currentNode, Integer.MAX_VALUE);
                if (newDist == Integer.MAX_VALUE) continue; // overflow guard
                newDist += edge.getWeight();

                if (newDist < dist.getOrDefault(neighbour, Integer.MAX_VALUE)) {
                    dist.put(neighbour, newDist);
                    predecessor.put(neighbour, currentNode);
                    segmentUsed.put(neighbour, edge.getSegmentId());
                    Integer neighbourIdx = nodeToIndex.get(neighbour);
                    if (neighbourIdx != null) {
                        pq.offer(new int[]{newDist, neighbourIdx});
                    }
                }
            }
        }

        // Check if destination was reached
        if (dist.getOrDefault(destinationNode, Integer.MAX_VALUE) == Integer.MAX_VALUE) {
            return RouteResult.unreachable(startNode, destinationNode,
                    "All paths are blocked or unavailable.");
        }

        // Reconstruct path by walking backwards through predecessors
        List<String> nodeSeq = new ArrayList<>();
        List<String> segSeq = new ArrayList<>();
        String cursor = destinationNode;
        while (cursor != null && !cursor.equals(startNode)) {
            nodeSeq.add(0, cursor);
            String seg = segmentUsed.get(cursor);
            if (seg != null) {
                segSeq.add(0, seg);
            }
            cursor = predecessor.get(cursor);
        }
        nodeSeq.add(0, startNode);

        int totalTime = dist.get(destinationNode);

        return new RouteResult(true, nodeSeq, segSeq, totalTime,
                RoutingResultStatus.OPTIMAL_FOUND,
                "Route found: " + String.join(" -> ", nodeSeq) + " (" + totalTime + "s)");
    }
}
