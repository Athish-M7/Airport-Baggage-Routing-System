package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.ConveyorNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConveyorNodeRepository extends JpaRepository<ConveyorNode, String> {

    List<ConveyorNode> findByNodeType(String nodeType);
}
