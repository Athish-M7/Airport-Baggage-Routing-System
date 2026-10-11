package com.vaanam.baggage.repository;

import com.vaanam.baggage.model.LoadingBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadingBayRepository extends JpaRepository<LoadingBay, String> {
}
