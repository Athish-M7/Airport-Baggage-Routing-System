# Chapter 2: System Implementation & Interface Evidence

## 2.5 User Interface and Workflow Evidence

This section presents the graphical user interfaces developed for the **Vaanam International Airport Baggage Handling & Routing System**. Each interface corresponds to a distinct operational workstation in the airport terminal and apron environment, fulfilling specific operational duties such as staff authorization, baggage check-in ingestion, conveyor route computation, flight dispatch scheduling, live passenger luggage tracking, and relational database monitoring.

---

### A. Airport Staff Authentication & Onboarding Terminal

The airport staff authentication module establishes an airside access control boundary. Because the internal conveyor network and security screening checkpoints represent restricted operational zones, all apron personnel, check-in operators, and sorting supervisors must authenticate with official credentials before accessing terminal controls.

The authentication terminal supports dual operational modes:
1. **Staff Sign-In:** Authenticates existing employees using their unique aviation badge ID (e.g., `OPS-742`, `SEC-310`) and security access PIN against the `airport_staff` relational database table. To facilitate jury evaluation and rapid switching between roles, one-click preset credentials are provided for the Operations Lead, Security Controller, and Ramp Supervisor.
2. **Staff Onboarding & Registration (`/register`):** Allows newly assigned airport personnel to register a profile by specifying their full name, generating a standardized badge ID (`OPS-XXX`, `SEC-XXX`, `BAY-XXX`), selecting an aviation department, assigning a role, and choosing a visual identification avatar. Newly registered staff profiles are immediately committed to the persistent database and activated in the current session.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: STAFF LOGIN & REGISTRATION INTERFACE ]                 |
|                                                                                                   |
|   Show: Login dialog with Vaanam Airport emblem, Badge ID input, 1-Click demo buttons,           |
|         and the "Register New Staff" tab showing department and role selectors.                   |
|   URL: http://localhost:5173/login                                                                |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.1: Airport Staff Authentication & Onboarding Terminal**  
**Description:** The authentication portal provides restricted airside access, displaying staff credential input fields, one-click demo login profiles for evaluation, and the new staff onboarding form with dynamic badge ID generation.

---

### B. Main Operations Dashboard

The main operations dashboard functions as the centralized supervisory control and monitoring console for the airport baggage operations center (BOC). It aggregates high-level telemetry and status metrics to provide operators with instantaneous situational awareness of airport throughput, conveyor line health, and outbound flight timelines.

The dashboard integrates the `/api/dashboard/stats`, `/api/flights`, and `/api/baggage/queue` REST endpoints to display:
* **High-Level Operational KPI Cards:** Real-time counters showing total active luggage items in the system, bags currently traversing the conveyor lines (`READY` and `IN_TRANSIT`), bags successfully stowed in aircraft cargo holds (`LOADED`), and total scheduled outbound flights.
* **Scheduled Flight Departures Feed:** A flight monitor highlighting flight identifiers, international and domestic destinations, scheduled pushback times, assigned aircraft loading bays (`BAY-01` to `BAY-04`), and boarding statuses.
* **Automated Priority Dispatch Queue:** Displays the top luggage items queued for conveyor induction, sequenced in real time by the backend's four-tier Java `PriorityQueue` comparator (departure cutoff deadline, connecting transfer precedence, passenger class rank, and ingestion timestamp).
* **Live System Synchronized Clock:** Displays local wall-clock time with 12-hour, 24-hour, and date indicators synchronized every second.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: MAIN OPERATIONS DASHBOARD ]                            |
|                                                                                                   |
|   Show: 4 KPI metric cards (Total, In Transit, Loaded, Flights), Quick Action navigation buttons, |
|         Scheduled Departures table, and the Priority Dispatch Queue preview.                      |
|   URL: http://localhost:5173/                                                                     |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.2: Main Operations Dashboard**  
**Description:** The primary operational dashboard displays airport KPIs, flight status summaries, and the real-time priority dispatch queue generated by the 4-tier Java comparator.

---

### C. Baggage Management & Automated Check-In Terminal

The baggage management interface serves as the primary operational station for counter check-in agents, transfer baggage induction points, and ramp sorting operators. It maintains comprehensive tracking records for every luggage unit admitted into the Vaanam Airport logistics facility.

Key operational features implemented in this interface include:
* **Filterable Baggage Inventory:** A data grid providing live search by unique Baggage Identification Number (e.g., `BAG-1001`) and filtering by operational status (`READY`, `IN_TRANSIT`, `AT_RISK`, `LOADED`, `MISSED_CUTOFF`, `AWAITING_CLEARANCE`).
* **Interactive Check-In Ingestion Modal:** Enables check-in agents to enter new baggage items into the system. Upon selecting an ingestion counter (`CHK-1`, `CHK-2`, or `TRF-1`), passenger service class (`FIRST`, `BUSINESS`, `ECONOMY`), and assigned flight number, the system automatically triggers an asynchronous call to Dijkstra's algorithm to compute the optimal shortest path and estimated transit time before committing the record to the database.
* **Live Checkpoint Scanner Station:** Simulates barcode / RFID scanners positioned at conveyor routing junctions (`SEC-1`, `SEC-2`, `JNC-A`, `SRT-1`). Scanning an item deducts transit time, updates current physical coordinates, and writes an immutable audit record to the `routing_records` table.
* **Digital Passenger QR Tag Generation:** Each baggage row includes a `📱 Tag` action button that renders the passenger luggage pass and scannable QR code.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: BAGGAGE MANAGEMENT INTERFACE ]                         |
|                                                                                                   |
|   Show: The full baggage inventory table, status badges (Ready, In Transit, Loaded),              |
|         the Check-In modal with route calculation preview, and row action buttons.                |
|   URL: http://localhost:5173/baggage                                                              |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.3: Baggage Management and Induction Console**  
**Description:** The baggage management screen presents active baggage manifests, operational status badges, security clearance toggles, and the new baggage check-in dialog with automatic route pre-calculation.

---

### D. Passenger Digital Baggage Tag & Mobile QR Tracking Pass

Bridging the divide between internal apron logistics and passenger visibility, this module provides an end-to-end mobile baggage tracking solution. When an item is checked in, the system generates an authentic, high-resolution digital baggage tag with an embedded, live-scannable QR code.

The passenger tracking workflow encompasses:
* **Camera-Scannable QR Pass Modal:** Accessible immediately after check-in or by clicking `📱 Tag`. Generates an SVG/Canvas QR code resolving to `http://<HOST-IP>:5173/track?id=BAG-XXXX`, allowing passengers and evaluation jury members to scan the code directly from a physical mobile device.
* **Digital Boarding Pass Presentation:** Formatted like a luxury airline baggage receipt, featuring airline branding, passenger travel class badge, destination bay/gate, flight code, baggage identifier, and an authentic barcode representation.
* **Live 4-Stage Journey Stepper:**
  1. *Checked In at Terminal:* Confirms luggage induction at counter `CHK-1` or transfer inbound `TRF-1`.
  2. *High-Speed Conveyor Transit:* Shows transit along the calculated Dijkstra route with remaining seconds.
  3. *Aviation Security Screening:* Displays real-time X-ray screening and safety clearance status.
  4. *Loaded onto Aircraft Cargo:* Confirms final delivery into the aircraft cargo hold at the designated loading bay.
* **Asynchronous Auto-Polling:** Automatically polls the backend REST endpoint (`/api/baggage/{id}`) every 3 seconds to reflect physical conveyor movements without requiring manual page refreshes.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|             [ INSERT SCREENSHOT: PASSENGER DIGITAL TAG & LIVE QR TRACKER ]                        |
|                                                                                                   |
|   Show: The scannable QR Code modal dialog, side-by-side with the responsive mobile boarding pass  |
|         displaying the 4-stage live progress stepper and delivery status.                         |
|   URL: http://localhost:5173/track?id=BAG-1001                                                    |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.4: Passenger Digital Baggage Tag & Live Mobile Stepper Interface**  
**Description:** The passenger tracking system displays the mobile-responsive digital baggage tag and the live 4-stage journey stepper auto-synchronizing with conveyor scan events.

---

### E. Flight Departure Information Display System (FIDS)

The Flight Departure Board emulates modern airport Flight Information Display Systems (FIDS). It serves apron ground crews, baggage handlers, and dispatch supervisors who require accurate synchronization between flight turnaround schedules and baggage loading cutoffs.

The interface incorporates the following components:
* **Flight Schedule Matrix:** Tabulates flight identifiers (`VA-501`, `VA-204`, etc.), domestic and international destination hubs, scheduled departure timestamps, strict loading cutoff deadlines, assigned aircraft parking bays, and real-time flight statuses (`SCHEDULED`, `BOARDING`, `DEPARTED`, `DELAYED`).
* **Loading Cutoff Watchdog:** Computes cutoff deadlines (typically 45 minutes prior to departure). Luggage units in transit past this deadline are automatically flagged by the backend state machine as `MISSED_CUTOFF`.
* **Associated Baggage Explorer:** Allows operators to select any flight to filter and view all passenger bags consigned to that specific aircraft hold.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: FLIGHT DEPARTURE BOARD ]                               |
|                                                                                                   |
|   Show: Airport FIDS-style flight departure table with flight numbers, destinations,               |
|         departure times, bay assignments, and status chips (BOARDING, SCHEDULED).                 |
|   URL: http://localhost:5173/flights                                                              |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.5: Flight Departure Information Display System (FIDS)**  
**Description:** The flight departure board displays scheduled flights, destination airports, assigned aircraft loading bays, and loading cutoff deadlines.

---

### F. Interactive Conveyor Belt Network Map

The conveyor network interface visualizes the physical layout of the airport's automated baggage handling system (BHS). Rendered using scalable vector graphics (SVG), the interactive map represents the complete directed graph topology of check-in counters, intermediate junctions, security screening stations, and aircraft loading bays.

System highlights of the conveyor map include:
* **Topological Graph Rendering:** Accurately plots 12 vertices (`conveyor_nodes`) based on physical coordinate attributes (`xPos`, `yPos`) and color-coded node categories:
  - *Blue:* Terminal Check-In Counters (`CHK-1`, `CHK-2`)
  - *Teal:* Inbound Transfer Intake Point (`TRF-1`)
  - *Purple:* High-Speed Sorting Junctions (`JNC-A`, `JNC-B`, `JNC-C`)
  - *Orange:* Automated Security Screening X-Ray Checkpoints (`SEC-1`, `SEC-2`)
  - *Green:* Aircraft Loading Pier Bays (`BAY-01` through `BAY-04`)
* **Dynamic Conveyor Segments:** Renders 17 directed weighted edges (`conveyor_segments`) connecting nodes, complete with directional flow arrows and segment travel duration tooltips.
* **Simulated Line Failure & Motor Jam Toggle:** Clicking any conveyor segment sends an instantaneous `PATCH /api/conveyor/segments/{id}/toggle` request. Available segments are displayed in glowing emerald, while offline/failed segments transition to vivid crimson. This enables operators and evaluators to simulate belt jams (e.g., taking `SEG-06` offline) and witness real-time failover rerouting via `SEC-2`.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: INTERACTIVE CONVEYOR NETWORK MAP ]                     |
|                                                                                                   |
|   Show: SVG topological map showing all 12 nodes, directed conveyor segments with arrows,         |
|         segment travel times, legend, and SEG-06 highlighted in red (disabled/maintenance).       |
|   URL: http://localhost:5173/conveyor                                                             |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.6: Interactive Conveyor Belt Network Topology Map**  
**Description:** The SVG network topology interface displays physical nodes, directional conveyor segments, travel durations, and conveyor line availability toggles.

---

### G. Dijkstra Shortest-Path Route Calculator

The Route Calculator provides a direct interactive testing bench for the core algorithmic engine governing the Vaanam Airport system. It allows dispatchers and maintenance engineers to query the shortest and most optimal baggage trajectory between any source induction checkpoint and destination aircraft bay.

Algorithmic execution features include:
* **Arbitrary Node Pair Routing:** Operators select any source node (`CHK-1`, `CHK-2`, `TRF-1`, `JNC-A`, etc.) and destination loading bay (`BAY-01` to `BAY-04`) through dropdown menus.
* **Min-Heap Graph Traversal:** Clicking "Calculate Route" invokes Dijkstra's algorithm on the Spring Boot backend (`POST /api/conveyor/route`). The algorithm computes the path that minimizes cumulative transit time in seconds using Java's `PriorityQueue<int[]>`.
* **Step-by-Step Traversal Breakdown:** Upon successful computation, the interface visualizes the complete node traversal sequence, segment traversal times, cumulative transit seconds, and converted minutes.
* **Automated Failure Bypass Verification:** When primary segments are disabled (e.g., `SEG-06` down), calculating a route from `CHK-1` to `BAY-01` proves algorithmic resilience by routing via `JNC-A ➔ SEC-2 ➔ JNC-C ➔ BAY-01` (215 seconds) instead of the blocked `SEC-1` path.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: ROUTE CALCULATOR INTERFACE ]                           |
|                                                                                                   |
|   Show: Source and Destination selection dropdowns, "Calculate Route" button,                     |
|         formatted shortest path (CHK-1 -> JNC-A -> SEC-2 -> JNC-C -> BAY-01),                    |
|         total transit time in seconds, and visual step sequence chips.                            |
|   URL: http://localhost:5173/routing                                                              |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.7: Dijkstra Shortest-Path Route Calculator**  
**Description:** The route calculation console demonstrates Dijkstra's algorithm output, showing optimal node sequences, cumulative travel times, and alternate bypass paths during belt outages.

---

### H. Relational Database Diagnostics & Live Table Explorer

The database status interface delivers real-time introspection into the underlying relational persistence tier. It confirms data integrity, monitors database latency, and allows administrators to inspect all system tables directly through the browser.

Diagnostic capabilities include:
* **Active Connection Heartbeat:** Displays real-time database connectivity, database product name (H2 in-memory or PostgreSQL 16), driver version, and sub-millisecond query ping latency (`0-2 ms`).
* **Live Record Row Counters:** Displays cards reflecting current row tallies across `baggage`, `flights`, `conveyor_segments`, `conveyor_nodes`, and `airport_staff`.
* **Interactive Multi-Table Browser:** Features a dropdown selector allowing instant browsing of any relational table without manual SQL queries. Columns, timestamps, routing logs, and credentials are rendered in a sanitized, filterable data grid.
* **One-Click Test Maintenance Controls:** Provides a "Reset Demo Data" action to restore standard operational baselines from `seed_data.sql` and a "Clear All Bags" utility for custom testing.

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: DATABASE STATUS & EXPLORER ]                           |
|                                                                                                   |
|   Show: Database connection pill (Connected - H2 - 0ms), table row count cards,                   |
|         and the live table browser displaying rows from the 'airport_staff' or 'baggage' table.   |
|   URL: http://localhost:5173/database                                                             |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.8: Relational Database Diagnostics & Table Explorer**  
**Description:** The database explorer provides live table row counters, active connection latency metrics, maintenance controls, and an interactive browser for database tables.

---

### I. H2 In-Memory Database Web Console

In addition to the integrated application database explorer, the system exposes the official embedded H2 Database Web Console. This console is utilized by database administrators and developers to inspect system metadata, view table constraints, and execute ad-hoc SQL queries.

Key capabilities demonstrated in the database console:
* **Database Connection Configuration:** Connects securely using driver `org.h2.Driver`, JDBC URL `jdbc:h2:mem:vaanam_db`, and user `sa`.
* **Relational Schema Tree:** The left-hand navigation pane exposes the entire relational schema, displaying the primary keys, foreign keys, and indexes for all 7 application tables.
* **Ad-Hoc SQL Query Execution:** Allows executing complex multi-table queries (such as cross-table joins between `baggage` and `flights`, or querying `airport_staff` authentication records).

```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       [ INSERT SCREENSHOT: H2 DATABASE WEB CONSOLE ]                              |
|                                                                                                   |
|   Show: H2 Console login screen or active console showing the schema tree on the left              |
|         and a "SELECT * FROM airport_staff;" query output table on the right.                     |
|   URL: http://localhost:8080/h2-console                                                           |
+---------------------------------------------------------------------------------------------------+
```
**Figure 2.9: Embedded H2 SQL Database Web Console**  
**Description:** The H2 database management console displays the schema tree, table indexes, and execution results for direct SQL queries.
