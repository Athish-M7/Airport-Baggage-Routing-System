package com.vaanam.baggage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Initializes database seed records upon application startup if the database is currently empty.
 * Executes seed_data.sql statements with comment and conflict-clause sanitization.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final ResourceLoader resourceLoader;

    public DataInitializer(JdbcTemplate jdbcTemplate, ResourceLoader resourceLoader) {
        this.jdbcTemplate = jdbcTemplate;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) {
        try {
            // Check if database is already populated
            Integer count = 0;
            try {
                count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM conveyor_nodes", Integer.class);
            } catch (Exception ex) {
                count = 0;
            }

            if (count != null && count > 0) {
                log.info("Database already seeded ({} conveyor nodes found). Skipping initialization.", count);
                return;
            }

            log.info("Database is empty. Populating seed data from classpath:db/seed_data.sql...");
            Resource resource = resourceLoader.getResource("classpath:db/seed_data.sql");
            if (!resource.exists()) {
                log.warn("seed_data.sql not found on classpath!");
                return;
            }

            String fullSql;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                fullSql = reader.lines()
                        // Strip line comments
                        .map(line -> {
                            int commentIdx = line.indexOf("--");
                            return commentIdx != -1 ? line.substring(0, commentIdx) : line;
                        })
                        .collect(Collectors.joining(" "));
            }

            // Remove ON CONFLICT (...) DO NOTHING for cross-database compatibility (H2 / PostgreSQL)
            fullSql = fullSql.replaceAll("(?i)ON\\s+CONFLICT\\s*\\([^)]+\\)\\s*DO\\s+NOTHING", "");

            String[] statements = fullSql.split(";");
            int executed = 0;
            for (String raw : statements) {
                String stmt = raw.trim();
                if (stmt.isEmpty()) {
                    continue;
                }
                try {
                    jdbcTemplate.execute(stmt);
                    executed++;
                } catch (Exception ex) {
                    log.warn("Seed execution notice on statement [{}]: {}", 
                            stmt.substring(0, Math.min(stmt.length(), 60)), ex.getMessage());
                }
            }

            Integer finalCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM conveyor_nodes", Integer.class);
            log.info("Successfully executed {} seed statements. Total conveyor nodes: {}", executed, finalCount);

        } catch (Exception e) {
            log.warn("Database initialization completed with notice: {}", e.getMessage());
        }
    }
}
