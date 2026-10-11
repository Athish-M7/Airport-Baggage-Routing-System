-- Seed data for Vaanam Airport Baggage Handling & Routing System

-- 1. Conveyor Nodes (12 Nodes)
INSERT INTO conveyor_nodes (node_id, node_name, node_type, x_pos, y_pos) VALUES
('CHK-1', 'Check-in Counter North', 'CHECKIN', 120, 120),
('CHK-2', 'Check-in Counter South', 'CHECKIN', 120, 260),
('TRF-1', 'Transfer Inbound Point Alpha', 'TRANSFER', 120, 400),
('JNC-A', 'Main Sorting Junction Alpha', 'JUNCTION', 320, 160),
('JNC-B', 'High-Speed Hub Beta', 'JUNCTION', 320, 360),
('SEC-1', 'Security Screening X-Ray 1', 'SECURITY', 520, 160),
('SEC-2', 'Security Screening X-Ray 2', 'SECURITY', 520, 360),
('JNC-C', 'Distributor Hub Charlie', 'JUNCTION', 720, 260),
('BAY-01', 'Loading Bay 1 - Domestic Pier A', 'BAY', 920, 90),
('BAY-02', 'Loading Bay 2 - Domestic Pier B', 'BAY', 920, 190),
('BAY-03', 'Loading Bay 3 - Regional Pier C', 'BAY', 920, 320),
('BAY-04', 'Loading Bay 4 - International Pier D', 'BAY', 920, 430)
ON CONFLICT (node_id) DO NOTHING;

-- 2. Loading Bays (4 Bays)
INSERT INTO loading_bays (bay_id, bay_name, node_id, description) VALUES
('BAY-01', 'Loading Bay 1', 'BAY-01', 'Domestic Narrowbody Pier A'),
('BAY-02', 'Loading Bay 2', 'BAY-02', 'Domestic Narrowbody Pier B'),
('BAY-03', 'Loading Bay 3', 'BAY-03', 'Regional Jet Pier C'),
('BAY-04', 'Loading Bay 4', 'BAY-04', 'Widebody International Pier D')
ON CONFLICT (bay_id) DO NOTHING;

-- 3. Conveyor Segments (Directed Weighted Edges)
INSERT INTO conveyor_segments (segment_id, source_node, destination_node, travel_time_seconds, is_available) VALUES
('SEG-01', 'CHK-1', 'JNC-A', 45, true),
('SEG-02', 'CHK-2', 'JNC-B', 50, true),
('SEG-03', 'TRF-1', 'JNC-B', 35, true),
('SEG-04', 'JNC-A', 'JNC-B', 30, true),
('SEG-05', 'JNC-B', 'JNC-A', 30, true),
('SEG-06', 'JNC-A', 'SEC-1', 60, false), -- Initially failed edge for testing scenario B
('SEG-07', 'JNC-A', 'SEC-2', 75, true),  -- Bypass route when SEG-06 is down
('SEG-08', 'JNC-B', 'SEC-2', 55, true),
('SEG-09', 'JNC-B', 'SEC-1', 70, true),
('SEG-10', 'SEC-1', 'JNC-C', 40, true),
('SEG-11', 'SEC-2', 'JNC-C', 45, true),
('SEG-12', 'JNC-C', 'BAY-01', 50, true),
('SEG-13', 'JNC-C', 'BAY-02', 45, true),
('SEG-14', 'JNC-C', 'BAY-03', 55, true),
('SEG-15', 'JNC-C', 'BAY-04', 65, true),
('SEG-16', 'SEC-1', 'BAY-01', 80, true),
('SEG-17', 'SEC-2', 'BAY-04', 85, true)
ON CONFLICT (segment_id) DO NOTHING;

-- 4. Flights (4 Active Flights)
INSERT INTO flights (flight_id, flight_number, destination, departure_time, loading_cutoff, assigned_bay_id, flight_status) VALUES
('FL-101', 'VA-501', 'Delhi (DEL)', '2026-10-12 09:30:00', '2026-10-12 08:45:00', 'BAY-01', 'BOARDING'),
('FL-102', 'VA-204', 'Mumbai (BOM)', '2026-10-12 09:50:00', '2026-10-12 09:05:00', 'BAY-02', 'SCHEDULED'),
('FL-103', 'VA-810', 'Chennai (MAA)', '2026-10-12 10:20:00', '2026-10-12 09:35:00', 'BAY-03', 'SCHEDULED'),
('FL-104', 'VA-909', 'Dubai (DXB)', '2026-10-12 11:15:00', '2026-10-12 10:30:00', 'BAY-04', 'SCHEDULED')
ON CONFLICT (flight_id) DO NOTHING;

-- 5. Simulation Initial State
INSERT INTO simulation_state (id, current_simulated_time, is_running, speed_multiplier) VALUES
(1, '2026-10-12 08:15:00', true, 1)
ON CONFLICT (id) DO NOTHING;

-- 6. Baggage (32 Realistic Bags with Origin/Transfer, varying ranks, cutoffs, and clearances)
INSERT INTO baggage (baggage_id, bag_type, assigned_flight_id, current_location, destination_loading_bay_id, passenger_category, declared_category_rank, is_transfer, arrival_order, arrival_time, operator_clearance, baggage_processing_status, planned_route, estimated_remaining_travel_time, loading_cutoff, scan_history) VALUES
-- Earliest Flight FL-101 (Cutoff 08:45)
('BAG-1001', 'ORIGIN', 'FL-101', 'CHK-1', 'BAY-01', 'FIRST', 1, false, 1, '2026-10-12 08:00:00', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-01', 215, '2026-10-12 08:45:00', 'CHK-1'),
('BAG-1002', 'TRANSFER', 'FL-101', 'TRF-1', 'BAY-01', 'BUSINESS', 2, true, 2, '2026-10-12 08:01:00', true, 'IN_TRANSIT', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-01', 185, '2026-10-12 08:45:00', 'TRF-1,JNC-B'),
('BAG-1003', 'ORIGIN', 'FL-101', 'CHK-1', 'BAY-01', 'ECONOMY', 4, false, 3, '2026-10-12 08:02:00', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-01', 215, '2026-10-12 08:45:00', 'CHK-1'),
('BAG-1004', 'TRANSFER', 'FL-101', 'TRF-1', 'BAY-01', 'ECONOMY', 4, true, 4, '2026-10-12 08:02:30', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-01', 185, '2026-10-12 08:45:00', 'TRF-1'),
('BAG-1005', 'ORIGIN', 'FL-101', 'BAY-01', 'BAY-01', 'FIRST', 1, false, 5, '2026-10-12 07:55:00', true, 'LOADED', 'CHK-1 -> JNC-A -> SEC-1 -> BAY-01', 0, '2026-10-12 08:45:00', 'CHK-1,JNC-A,SEC-1,BAY-01'),
('BAG-1006', 'ORIGIN', 'FL-101', 'CHK-1', 'BAY-01', 'FREQUENT_FLYER', 3, false, 6, '2026-10-12 08:05:00', false, 'AWAITING_CLEARANCE', '', 0, '2026-10-12 08:45:00', 'CHK-1'),
('BAG-1007', 'TRANSFER', 'FL-101', 'TRF-1', 'BAY-01', 'FIRST', 1, true, 7, '2026-10-12 08:06:00', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-01', 185, '2026-10-12 08:45:00', 'TRF-1'),
('BAG-1008', 'ORIGIN', 'FL-101', 'CHK-2', 'BAY-01', 'ECONOMY', 4, false, 8, '2026-10-12 08:07:00', true, 'READY', 'CHK-2 -> JNC-B -> SEC-2 -> JNC-C -> BAY-01', 200, '2026-10-12 08:45:00', 'CHK-2'),

-- Flight FL-102 (Cutoff 09:05)
('BAG-2001', 'ORIGIN', 'FL-102', 'CHK-2', 'BAY-02', 'FIRST', 1, false, 9, '2026-10-12 08:08:00', true, 'READY', 'CHK-2 -> JNC-B -> SEC-2 -> JNC-C -> BAY-02', 195, '2026-10-12 09:05:00', 'CHK-2'),
('BAG-2002', 'TRANSFER', 'FL-102', 'TRF-1', 'BAY-02', 'FIRST', 1, true, 10, '2026-10-12 08:08:30', true, 'IN_TRANSIT', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-02', 180, '2026-10-12 09:05:00', 'TRF-1,JNC-B'),
('BAG-2003', 'ORIGIN', 'FL-102', 'CHK-1', 'BAY-02', 'BUSINESS', 2, false, 11, '2026-10-12 08:09:00', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-02', 210, '2026-10-12 09:05:00', 'CHK-1'),
('BAG-2004', 'TRANSFER', 'FL-102', 'TRF-1', 'BAY-02', 'BUSINESS', 2, true, 12, '2026-10-12 08:09:30', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-02', 180, '2026-10-12 09:05:00', 'TRF-1'),
('BAG-2005', 'ORIGIN', 'FL-102', 'CHK-2', 'BAY-02', 'ECONOMY', 4, false, 13, '2026-10-12 08:10:00', false, 'AWAITING_CLEARANCE', '', 0, '2026-10-12 09:05:00', 'CHK-2'),
('BAG-2006', 'ORIGIN', 'FL-102', 'BAY-02', 'BAY-02', 'ECONOMY', 4, false, 14, '2026-10-12 07:50:00', true, 'LOADED', 'CHK-2 -> JNC-B -> SEC-2 -> JNC-C -> BAY-02', 0, '2026-10-12 09:05:00', 'CHK-2,JNC-B,SEC-2,JNC-C,BAY-02'),
('BAG-2007', 'TRANSFER', 'FL-102', 'TRF-1', 'BAY-02', 'FREQUENT_FLYER', 3, true, 15, '2026-10-12 08:11:00', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-02', 180, '2026-10-12 09:05:00', 'TRF-1'),
('BAG-2008', 'ORIGIN', 'FL-102', 'CHK-1', 'BAY-02', 'ECONOMY', 4, false, 16, '2026-10-12 08:11:30', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-02', 210, '2026-10-12 09:05:00', 'CHK-1'),

-- Flight FL-103 (Cutoff 09:35)
('BAG-3001', 'ORIGIN', 'FL-103', 'CHK-1', 'BAY-03', 'FIRST', 1, false, 17, '2026-10-12 08:12:00', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-03', 220, '2026-10-12 09:35:00', 'CHK-1'),
('BAG-3002', 'TRANSFER', 'FL-103', 'TRF-1', 'BAY-03', 'BUSINESS', 2, true, 18, '2026-10-12 08:12:30', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-03', 190, '2026-10-12 09:35:00', 'TRF-1'),
('BAG-3003', 'ORIGIN', 'FL-103', 'CHK-2', 'BAY-03', 'FREQUENT_FLYER', 3, false, 19, '2026-10-12 08:13:00', true, 'IN_TRANSIT', 'CHK-2 -> JNC-B -> SEC-2 -> JNC-C -> BAY-03', 155, '2026-10-12 09:35:00', 'CHK-2,JNC-B'),
('BAG-3004', 'TRANSFER', 'FL-103', 'TRF-1', 'BAY-03', 'ECONOMY', 4, true, 20, '2026-10-12 08:13:30', false, 'AWAITING_CLEARANCE', '', 0, '2026-10-12 09:35:00', 'TRF-1'),
('BAG-3005', 'ORIGIN', 'FL-103', 'CHK-1', 'BAY-03', 'ECONOMY', 4, false, 21, '2026-10-12 08:14:00', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-03', 220, '2026-10-12 09:35:00', 'CHK-1'),
('BAG-3006', 'ORIGIN', 'FL-103', 'CHK-2', 'BAY-03', 'BUSINESS', 2, false, 22, '2026-10-12 08:14:30', true, 'READY', 'CHK-2 -> JNC-B -> SEC-2 -> JNC-C -> BAY-03', 205, '2026-10-12 09:35:00', 'CHK-2'),
('BAG-3007', 'TRANSFER', 'FL-103', 'TRF-1', 'BAY-03', 'FIRST', 1, true, 23, '2026-10-12 08:14:45', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-03', 190, '2026-10-12 09:35:00', 'TRF-1'),
('BAG-3008', 'ORIGIN', 'FL-103', 'CHK-1', 'BAY-03', 'ECONOMY', 4, false, 24, '2026-10-12 08:15:00', false, 'AWAITING_CLEARANCE', '', 0, '2026-10-12 09:35:00', 'CHK-1'),

-- Flight FL-104 (Cutoff 10:30)
('BAG-4001', 'ORIGIN', 'FL-104', 'CHK-1', 'BAY-04', 'FIRST', 1, false, 25, '2026-10-12 08:15:10', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-04', 230, '2026-10-12 10:30:00', 'CHK-1'),
('BAG-4002', 'TRANSFER', 'FL-104', 'TRF-1', 'BAY-04', 'FIRST', 1, true, 26, '2026-10-12 08:15:20', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> BAY-04', 175, '2026-10-12 10:30:00', 'TRF-1'),
('BAG-4003', 'ORIGIN', 'FL-104', 'CHK-2', 'BAY-04', 'BUSINESS', 2, false, 27, '2026-10-12 08:15:30', true, 'READY', 'CHK-2 -> JNC-B -> SEC-2 -> BAY-04', 190, '2026-10-12 10:30:00', 'CHK-2'),
('BAG-4004', 'TRANSFER', 'FL-104', 'TRF-1', 'BAY-04', 'ECONOMY', 4, true, 28, '2026-10-12 08:15:40', false, 'AWAITING_CLEARANCE', '', 0, '2026-10-12 10:30:00', 'TRF-1'),
('BAG-4005', 'ORIGIN', 'FL-104', 'CHK-1', 'BAY-04', 'ECONOMY', 4, false, 29, '2026-10-12 08:15:45', true, 'READY', 'CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-04', 230, '2026-10-12 10:30:00', 'CHK-1'),
('BAG-4006', 'TRANSFER', 'FL-104', 'TRF-1', 'BAY-04', 'BUSINESS', 2, true, 30, '2026-10-12 08:15:50', true, 'READY', 'TRF-1 -> JNC-B -> SEC-2 -> BAY-04', 175, '2026-10-12 10:30:00', 'TRF-1'),

-- Special test scenario cases:
-- BAG-9901: Missed Cutoff bag (Simulated past cutoff)
('BAG-9901', 'ORIGIN', 'FL-101', 'CHK-1', 'BAY-01', 'ECONOMY', 4, false, 31, '2026-10-12 07:10:00', true, 'MISSED_CUTOFF', '', 0, '2026-10-12 08:00:00', 'CHK-1'),
-- BAG-9902: At risk bag (Cutoff very close compared to remaining travel time)
('BAG-9902', 'TRANSFER', 'FL-101', 'TRF-1', 'BAY-01', 'ECONOMY', 4, true, 32, '2026-10-12 08:14:00', true, 'AT_RISK', 'TRF-1 -> JNC-B -> SEC-2 -> JNC-C -> BAY-01', 185, '2026-10-12 08:16:30', 'TRF-1')
ON CONFLICT (baggage_id) DO NOTHING;
