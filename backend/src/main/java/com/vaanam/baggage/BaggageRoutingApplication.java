package com.vaanam.baggage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Vaanam Airport Baggage Handling and Routing System.
 * Spring Boot 3 / Java 21 application with graph-based conveyor routing.
 */
@SpringBootApplication
public class BaggageRoutingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BaggageRoutingApplication.class, args);
    }
}
