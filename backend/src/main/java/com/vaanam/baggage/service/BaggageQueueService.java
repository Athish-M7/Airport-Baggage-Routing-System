package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.BaggageDto;
import com.vaanam.baggage.model.Baggage;
import com.vaanam.baggage.repository.BaggageRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.stream.Collectors;

/**
 * Provides a priority-ordered dispatch queue for dispatchable baggage items.
 * Priority order (ascending = higher dispatch priority):
 * <ol>
 *   <li>Earlier loadingCutoff first</li>
 *   <li>On cutoff tie: Transfer bags (priority=1) before Origin bags (priority=2)</li>
 *   <li>On tie: lower declaredCategoryRank first (1=FIRST, 4=ECONOMY)</li>
 *   <li>On full tie: lower arrivalOrder first</li>
 * </ol>
 */
@Service
public class BaggageQueueService {

    private final BaggageRepository baggageRepo;

    public BaggageQueueService(BaggageRepository baggageRepo) {
        this.baggageRepo = baggageRepo;
    }

    /** Comparator implementing the four-level priority rule. */
    private static final Comparator<Baggage> DISPATCH_COMPARATOR = Comparator
            .comparing(Baggage::getLoadingCutoff)
            .thenComparingInt(Baggage::transferPriority)
            .thenComparingInt(Baggage::getDeclaredCategoryRank)
            .thenComparingInt(Baggage::getArrivalOrder);

    /**
     * Retrieves the full dispatch queue as an ordered list of {@link BaggageDto}.
     * Only bags with operator clearance and status READY, IN_TRANSIT, or AT_RISK are included.
     *
     * @return ordered list, highest priority first
     */
    public List<BaggageDto> getDispatchQueue() {
        List<Baggage> dispatchable = baggageRepo.findDispatchableByStatus();

        PriorityQueue<Baggage> pq = new PriorityQueue<>(DISPATCH_COMPARATOR);
        pq.addAll(dispatchable);

        return pq.stream()
                .sorted(DISPATCH_COMPARATOR)
                .map(BaggageDto::fromBaggage)
                .collect(Collectors.toList());
    }

    /**
     * Returns the highest-priority dispatchable bag without modifying state.
     *
     * @return the top-priority {@link BaggageDto}, or {@code null} if queue is empty
     */
    public BaggageDto peekNextDispatch() {
        List<Baggage> dispatchable = baggageRepo.findDispatchableByStatus();
        if (dispatchable.isEmpty()) {
            return null;
        }
        PriorityQueue<Baggage> pq = new PriorityQueue<>(DISPATCH_COMPARATOR);
        pq.addAll(dispatchable);
        Baggage top = pq.peek();
        return top != null ? BaggageDto.fromBaggage(top) : null;
    }
}
