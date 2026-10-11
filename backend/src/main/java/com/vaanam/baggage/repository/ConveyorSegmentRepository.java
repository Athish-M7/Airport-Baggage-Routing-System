package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.ConveyorSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConveyorSegmentRepository extends JpaRepository<ConveyorSegment, String> {

    @Query("SELECT c FROM ConveyorSegment c WHERE c.isAvailable = :available")
    List<ConveyorSegment> findByAvailable(@Param("available") boolean available);

    List<ConveyorSegment> findByIsAvailable(boolean isAvailable);

    List<ConveyorSegment> findBySourceNode(String sourceNode);
}
