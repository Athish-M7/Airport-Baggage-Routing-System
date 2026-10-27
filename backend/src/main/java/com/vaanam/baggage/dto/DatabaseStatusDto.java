package com.vaanam.baggage.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Live health and metadata status of the database connection.
 */
public record DatabaseStatusDto(
    boolean connected,
    String databaseProductName,
    String databaseProductVersion,
    String databaseUrl,
    String driverName,
    long pingLatencyMs,
    LocalDateTime serverTime,
    Map<String, Long> tableCounts
) {}
