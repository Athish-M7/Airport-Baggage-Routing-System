-- Schema for Vaanam Airport Baggage Handling and Routing System
-- Supports PostgreSQL and H2 (PostgreSQL compatibility mode)

CREATE TABLE IF NOT EXISTS conveyor_nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    node_name VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    x_pos INT NOT NULL,
    y_pos INT NOT NULL
);

CREATE TABLE IF NOT EXISTS loading_bays (
    bay_id VARCHAR(50) PRIMARY KEY,
    bay_name VARCHAR(100) NOT NULL,
    node_id VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS conveyor_segments (
    segment_id VARCHAR(50) PRIMARY KEY,
    source_node VARCHAR(50) NOT NULL,
    destination_node VARCHAR(50) NOT NULL,
    travel_time_seconds INT NOT NULL CHECK (travel_time_seconds > 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS flights (
    flight_id VARCHAR(50) PRIMARY KEY,
    flight_number VARCHAR(50) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    loading_cutoff TIMESTAMP NOT NULL,
    assigned_bay_id VARCHAR(50) NOT NULL,
    flight_status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE IF NOT EXISTS baggage (
    baggage_id VARCHAR(50) PRIMARY KEY,
    bag_type VARCHAR(50) NOT NULL, -- 'ORIGIN' or 'TRANSFER'
    assigned_flight_id VARCHAR(50) NOT NULL,
    current_location VARCHAR(50) NOT NULL,
    destination_loading_bay_id VARCHAR(50) NOT NULL,
    passenger_category VARCHAR(50) NOT NULL,
    declared_category_rank INT NOT NULL,
    is_transfer BOOLEAN NOT NULL DEFAULT FALSE,
    arrival_order INT NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    operator_clearance BOOLEAN NOT NULL DEFAULT FALSE,
    baggage_processing_status VARCHAR(50) NOT NULL,
    planned_route TEXT,
    estimated_remaining_travel_time INT NOT NULL DEFAULT 0,
    loading_cutoff TIMESTAMP NOT NULL,
    scan_history TEXT
);

CREATE TABLE IF NOT EXISTS routing_records (
    record_id BIGSERIAL PRIMARY KEY,
    baggage_id VARCHAR(50) NOT NULL,
    previous_route TEXT,
    new_route TEXT,
    last_confirmed_node VARCHAR(50) NOT NULL,
    total_estimated_travel_time INT NOT NULL,
    routing_reason VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    routing_result VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS simulation_state (
    id INT PRIMARY KEY,
    current_simulated_time TIMESTAMP NOT NULL,
    is_running BOOLEAN NOT NULL DEFAULT FALSE,
    speed_multiplier INT NOT NULL DEFAULT 1
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_baggage_flight ON baggage(assigned_flight_id);
CREATE INDEX IF NOT EXISTS idx_baggage_status ON baggage(baggage_processing_status);
CREATE INDEX IF NOT EXISTS idx_baggage_cutoff ON baggage(loading_cutoff);
CREATE INDEX IF NOT EXISTS idx_routing_bag ON routing_records(baggage_id);
