package com.vaanam.baggage.service;

import com.vaanam.baggage.dto.DatabaseStatusDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service providing database diagnostics, table metrics, live querying, and database re-seeding.
 */
@Service
public class DatabaseService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseService.class);

    private static final Set<String> ALLOWED_TABLES = Set.of(
            "conveyor_nodes",
            "loading_bays",
            "conveyor_segments",
            "flights",
            "baggage",
            "routing_records",
            "simulation_state",
            "airport_staff"
    );

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final ResourceLoader resourceLoader;

    public DatabaseService(JdbcTemplate jdbcTemplate, DataSource dataSource, ResourceLoader resourceLoader) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.resourceLoader = resourceLoader;
    }

    /**
     * Inspects active database connection, ping latency, and row counts across all system tables.
     */
    public DatabaseStatusDto getDatabaseStatus() {
        boolean connected = false;
        String prodName = "Unknown";
        String prodVersion = "Unknown";
        String url = "Unknown";
        String driver = "Unknown";
        long pingMs = -1;

        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            prodName = meta.getDatabaseProductName();
            prodVersion = meta.getDatabaseProductVersion();
            url = meta.getURL();
            driver = meta.getDriverName() + " " + meta.getDriverVersion();
            
            // Execute quick test query
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            pingMs = System.currentTimeMillis() - start;
            connected = true;
        } catch (Exception e) {
            log.error("Database connectivity check failed: {}", e.getMessage());
            connected = false;
        }

        Map<String, Long> tableCounts = new LinkedHashMap<>();
        for (String table : ALLOWED_TABLES) {
            try {
                Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
                tableCounts.put(table, count != null ? count : 0L);
            } catch (Exception ex) {
                tableCounts.put(table, -1L);
            }
        }

        return new DatabaseStatusDto(
                connected,
                prodName,
                prodVersion,
                url,
                driver,
                pingMs,
                LocalDateTime.now(),
                tableCounts
        );
    }

    /**
     * Retrieves table rows for live database inspection in the UI (read-only, sanitized).
     */
    public List<Map<String, Object>> getTableData(String tableName, int limit) {
        String lowerTable = tableName != null ? tableName.trim().toLowerCase() : "";
        if (!ALLOWED_TABLES.contains(lowerTable)) {
            throw new IllegalArgumentException("Access to table '" + tableName + "' is not permitted.");
        }
        int safeLimit = Math.max(1, Math.min(limit, 200));
        String sql = "SELECT * FROM " + lowerTable + " LIMIT " + safeLimit;
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Clears all baggage and routing audit trail records to allow clean manual testing.
     */
    @Transactional
    public void clearBaggageRecords() {
        jdbcTemplate.execute("DELETE FROM routing_records");
        jdbcTemplate.execute("DELETE FROM baggage");
        log.info("Cleared all baggage and routing record data.");
    }

    /**
     * Resets database state and re-executes seed_data.sql.
     */
    @Transactional
    public void reseedDatabase() {
        log.info("Resetting and reseeding database from seed_data.sql...");
        try {
            // Delete dependent records first
            jdbcTemplate.execute("DELETE FROM routing_records");
            jdbcTemplate.execute("DELETE FROM baggage");
            jdbcTemplate.execute("DELETE FROM flights");
            jdbcTemplate.execute("DELETE FROM conveyor_segments");
            jdbcTemplate.execute("DELETE FROM loading_bays");
            jdbcTemplate.execute("DELETE FROM conveyor_nodes");

            Resource resource = resourceLoader.getResource("classpath:db/seed_data.sql");
            if (!resource.exists()) {
                throw new IllegalStateException("Seed script classpath:db/seed_data.sql not found!");
            }

            String fullSql;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                fullSql = reader.lines()
                        .map(line -> {
                            int commentIdx = line.indexOf("--");
                            return commentIdx != -1 ? line.substring(0, commentIdx) : line;
                        })
                        .collect(Collectors.joining(" "));
            }

            fullSql = fullSql.replaceAll("(?i)ON\\s+CONFLICT\\s*\\([^)]+\\)\\s*DO\\s+NOTHING", "");
            String[] statements = fullSql.split(";");

            for (String raw : statements) {
                String stmt = raw.trim();
                if (!stmt.isEmpty()) {
                    try {
                        jdbcTemplate.execute(stmt);
                    } catch (Exception ex) {
                        log.warn("Reseed notice on statement: {}", ex.getMessage());
                    }
                }
            }
            log.info("Reseed completed successfully.");
        } catch (Exception e) {
            log.error("Failed to reseed database: {}", e.getMessage(), e);
            throw new RuntimeException("Reseed failed: " + e.getMessage(), e);
        }
    }
}
