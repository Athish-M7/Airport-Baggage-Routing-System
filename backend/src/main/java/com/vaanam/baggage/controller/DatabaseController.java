package com.vaanam.baggage.controller;

import com.vaanam.baggage.dto.DatabaseStatusDto;
import com.vaanam.baggage.service.DatabaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing database health checks, live table introspection, and maintenance controls.
 */
@RestController
@RequestMapping("/api/database")
public class DatabaseController {

    private final DatabaseService databaseService;

    public DatabaseController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    /** GET /api/database/status — live connectivity and record count diagnostics */
    @GetMapping("/status")
    public ResponseEntity<DatabaseStatusDto> getDatabaseStatus() {
        return ResponseEntity.ok(databaseService.getDatabaseStatus());
    }

    /** GET /api/database/tables/{tableName} — view table records for direct UI database browsing */
    @GetMapping("/tables/{tableName}")
    public ResponseEntity<List<Map<String, Object>>> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(databaseService.getTableData(tableName, limit));
    }

    /** POST /api/database/seed — re-seed database to default factory dataset */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> reseedDatabase() {
        databaseService.reseedDatabase();
        return ResponseEntity.ok(Map.of("message", "Database successfully reseeded with default system data."));
    }

    /** POST /api/database/clear-baggage — remove all baggage and routing logs */
    @PostMapping("/clear-baggage")
    public ResponseEntity<Map<String, String>> clearBaggage() {
        databaseService.clearBaggageRecords();
        return ResponseEntity.ok(Map.of("message", "All baggage and routing audit records have been cleared."));
    }
}
