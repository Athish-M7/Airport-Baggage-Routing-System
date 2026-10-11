package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.RoutingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutingRecordRepository extends JpaRepository<RoutingRecord, Long> {

    List<RoutingRecord> findByBaggageIdOrderByTimestampDesc(String baggageId);
}
