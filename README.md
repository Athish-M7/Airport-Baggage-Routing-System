# Intelligent Airport Baggage Handling & Routing System — Vaanam Airport

Welcome to the **Vaanam Regional Airport Baggage Handling and Routing System**, an enterprise full-stack aviation logistics platform designed to automate baggage routing, optimize conveyor network throughput, prevent flight delays, and provide real-time situational awareness for airport apron and sorting hub operators.

---

## 🏛️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │          React 18 + TypeScript + Vite Dashboard        │
                  │   Operations Hub · SVG Conveyor Map · Flight Board     │
                  │       Dispatch Queue · Dijkstra Route Calculator       │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTP / JSON REST APIs
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             Spring Boot 3.3.4 (Java 21)                │
                  ├───────────────────────────┬────────────────────────────┤
                  │     REST Controllers      │      Global Exception      │
                  │   Baggage, Flights, Map,  │         Controller         │
                  │     Simulation & Stats    │                            │
                  ├───────────────────────────┴────────────────────────────┤
                  │                     Service Layer                      │
                  │  • Dijkstra Shortest-Path Graph Engine                 │
                  │  • 4-Tier Java PriorityQueue Dispatch Service          │
                  │  • Baggage Lifecycle & Clearance State Machine         │
                  │  • Dynamic Reroute & Reachability Service             │
                  │  • Simulation Clock & Time Progression Service         │
                  ├────────────────────────────────────────────────────────┤
                  │              Spring Data JPA Repositories              │
                  └───────────────────────────┬────────────────────────────┘
                                              │ JDBC / Hibernate ORM
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             PostgreSQL 16 / H2 In-Memory               │
                  │  conveyor_nodes, conveyor_segments, loading_bays,     │
                  │       flights, baggage, routing_records, sim_state     │
                  └────────────────────────────────────────────────────────┘
```

---

## ⚙️ Core Technical Features

### 1. Dijkstra Shortest-Path Graph Engine
* **Graph Representation:** Adjacency-list directed weighted graph backed by Java `HashMap<String, List<Edge>>`.
* **Min-Heap Optimization:** Java `PriorityQueue` prioritized by cumulative edge travel times (in seconds).
* **Segment Availability Guard:** Segments with `isAvailable == false` (e.g. offline conveyor jams or maintenance shutdowns) are automatically bypassed during graph traversal.
* **Failover Rerouting:** When primary segments like `SEG-06` (JNC-A ➔ SEC-1) fail, the algorithm dynamically reroutes via alternate screening lines (`SEG-07` ➔ SEC-2) to ensure uninterrupted baggage dispatch.
* **Special Cases:** Handles same-checkpoint requests with `ALREADY_AT_DESTINATION` and isolated nodes with `UNREACHABLE`.

### 2. Four-Tier Dispatch Priority Queue
Baggage dispatch is ordered using a strict four-level comparator in Java `PriorityQueue<Baggage>`:
1. **Departure Loading Cutoff:** Bags whose flight departure cutoff is nearest are dispatched first (`loadingCutoff` ASC).
2. **Transfer Baggage Tie-Break:** On identical flight cutoffs, inbound connecting transfer bags outrank local origin bags (`TransferBag.transferPriority() = 1` vs `OriginBag.transferPriority() = 2`).
3. **Passenger Travel Class Rank:** On cutoff and transfer status ties, premium passengers take precedence (`FIRST = 1`, `BUSINESS = 2`, `FREQUENT_FLYER = 3`, `ECONOMY = 4`).
4. **Physical Ingestion Sequence:** Final tie-breaker preserves arrival sequence (`arrivalOrder` ASC).

### 3. Baggage State Machine & Integrity Checks
State transitions enforce airport operational safety rules:
* `AWAITING_CLEARANCE` ➔ `READY`: Operator grants security/X-ray clearance.
* `READY` ➔ `IN_TRANSIT`: Automated barcode/RFID scanner records baggage arrival at conveyor node (`scanAtNode`).
* `IN_TRANSIT` ➔ `LOADED`: Confirmed only when bag reaches designated flight bay before cutoff time and possesses operator clearance.
* `IN_TRANSIT` ➔ `MISSED_CUTOFF`: Flagged automatically if luggage fails to reach the loading bay prior to the flight cutoff deadline.
* `IN_TRANSIT` ➔ `UNREACHABLE`: Triggered when unexpected downstream network closures sever all valid paths to the destination pier.

### 4. Passenger Mobile Luggage Tracking with Live QR Code
* Bridges internal apron operations with the public passenger experience.
* Every baggage check-in generates an authentic digital boarding baggage pass with a live scannable QR tag.
* Scanning with any smartphone camera opens `/track?id=BAG-XXXX` with a 4-stage visual journey stepper (Check-in ➔ Conveyor ➔ X-Ray Screening ➔ Loaded) auto-polling every 3 seconds.

### 5. Airport Staff Authentication & Onboarding
* High-security operator login terminal (`/login`) with session persistence.
* Onboards new airport staff personnel (`/register`) into the database `airport_staff` table with badge ID generation and avatar customization.
* 1-Click quick demo logins for presentation efficiency.

### 6. Relational Database Diagnostics & Live Explorer
* Live diagnostics dashboard (`/database`) monitoring latency, active connection status, and row metrics.
* Real-time table browser supporting `baggage`, `flights`, `conveyor_segments`, `conveyor_nodes`, and `airport_staff`.

---

## 📁 Repository Structure

```
├── backend/
│   ├── mvnw.cmd                              # Cross-platform Maven wrapper
│   ├── pom.xml                               # Java 21, Spring Boot 3.3.4, JPA, H2, PostgreSQL
│   ├── src/main/java/com/vaanam/baggage/
│   │   ├── BaggageRoutingApplication.java    # Spring Boot Main Class
│   │   ├── algorithm/                        # Adjacency Graph and RouteResult
│   │   ├── config/                           # CORS, Exception Handling, DataInitializer
│   │   ├── controller/                       # REST Endpoints (/api/baggage, /flights, /staff, etc.)
│   │   ├── dto/                              # Request / Response transfer objects
│   │   ├── model/                            # Domain Entities (Baggage, Flight, Node, Staff, etc.)
│   │   ├── repository/                       # Spring Data JPA Repositories
│   │   └── service/                          # Dijkstra routing, priority queue, database diagnostics
│   ├── src/main/resources/
│   │   ├── application.yml                   # PostgreSQL Configuration
│   │   ├── application-h2.yml                # In-Memory H2 Configuration
│   │   └── db/
│   │       ├── schema.sql                    # Relational schema definition (incl. airport_staff)
│   │       └── seed_data.sql                 # Nodes, Segments, Flights, Baggage, Staff
│   └── src/test/java/com/vaanam/baggage/
│       └── BaggageRoutingSystemTests.java    # 18 JUnit 5 Automated Business Rule Tests
│
├── frontend/
│   ├── package.json                          # React 18, TypeScript 5, Vite 5, React Router 6, QRCode
│   ├── vite.config.ts                        # Network host & proxy configuration forwarding /api to :8080
│   ├── src/
│   │   ├── api/client.ts                     # Typed REST Client
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                   # Navigation, system clock, active staff profile
│   │   │   ├── VaanamLogo.tsx                # Custom SVG airport branding emblem
│   │   │   ├── PassengerQrModal.tsx          # Real-time QR code generator modal
│   │   │   └── ProtectedRoute.tsx            # Route security guard for staff-only pages
│   │   ├── context/
│   │   │   └── AuthContext.tsx               # Staff authentication & account management
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx                 # High-level KPIs, Flight overview & Dispatch Queue
│   │   │   ├── BaggageManagement.tsx         # Full baggage CRUD, check-in, scan & QR tag launch
│   │   │   ├── FlightBoard.tsx               # Airport FIDS Flight status board
│   │   │   ├── ConveyorMap.tsx               # Interactive SVG Conveyor topology
│   │   │   ├── RoutingCalculator.tsx         # Interactive Dijkstra route tester
│   │   │   ├── DatabaseStatus.tsx            # Live database table explorer
│   │   │   ├── StaffLogin.tsx                # Staff sign-in & onboarding registration
│   │   │   └── PassengerTracker.tsx          # Mobile passenger luggage tracking pass
│   │   ├── types/index.ts                    # TypeScript interface definitions
│   │   └── App.css                           # Professional airport operations theme
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Java 21 JDK** (Oracle JDK 21 or Eclipse Temurin 21)
* **Node.js 18+** & **npm**

---

### Running the Backend

The project includes an embedded Maven wrapper and an embedded H2 database profile, so PostgreSQL is optional.

#### Option A: Embedded H2 Mode (Zero setup, immediate start)
```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```
Backend API will be live at: **`http://localhost:8080`**  
H2 Web Console available at: **`http://localhost:8080/h2-console`**

#### Option B: Docker PostgreSQL Mode
```powershell
cd backend
docker-compose up -d
.\mvnw.cmd spring-boot:run
```

---

### Running the Test Suite (18 Business Rule Tests)
```powershell
cd backend
.\mvnw.cmd test
```

The test suite validates:
1. Dijkstra happy-path routing (`CHK-1` to `BAY-01`).
2. Dijkstra multi-hop transfer routing (`TRF-1` to `BAY-04`).
3. Conveyor jam bypass: Automatic detour around offline `SEG-06` via `SEC-2`.
4. Isolated / unreachable node detection.
5. Zero-distance handling for baggage already at destination.
6. First class baggage prioritizing over economy class.
7. Earlier flight cutoff precedence over later flight cutoffs.
8. Transfer baggage outranking origin baggage on identical cutoffs.
9. Passenger category rank tie-breaking.
10. Physical arrival order final tie-breaking.
11. State transition from `AWAITING_CLEARANCE` to `READY` upon clearance grant.
12. State transition from `READY` to `AWAITING_CLEARANCE` upon clearance revocation.
13. Node scan progression to `IN_TRANSIT` with travel time decrement.
14. Aircraft loading confirmation at assigned pier.
15. Loading rejection when security clearance is missing.
16. Automatic status change to `MISSED_CUTOFF` when bag arrives past cutoff.
17. TransferBag vs OriginBag polymorphic priority rankings.
18. Real-time dynamic rerouting and `RoutingRecord` audit logging.

---

### Running the Frontend
```powershell
cd frontend
npm.cmd run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | System KPI metrics (bags by status, active flights, etc.) |
| `GET` | `/api/baggage` | List all baggage items across all flights |
| `GET` | `/api/baggage/{id}` | Retrieve specific luggage details |
| `GET` | `/api/baggage/queue` | Retrieve ordered dispatch priority queue |
| `POST` | `/api/baggage/{id}/clearance/grant` | Grant security/operator clearance |
| `POST` | `/api/baggage/{id}/clearance/revoke` | Revoke security clearance |
| `POST` | `/api/baggage/{id}/scan` | Record automated checkpoint scan at node |
| `POST` | `/api/baggage/{id}/loaded` | Confirm baggage loaded onto flight |
| `POST` | `/api/baggage/{id}/reroute` | Recalculate shortest path dynamically |
| `GET` | `/api/baggage/{id}/history` | Audit log of routing decisions for bag |
| `GET` | `/api/flights` | Retrieve scheduled flights and loading status |
| `GET` | `/api/conveyor/nodes` | Retrieve conveyor checkpoints with coordinates |
| `GET` | `/api/conveyor/segments` | Retrieve conveyor belt segments and availability |
| `PATCH` | `/api/conveyor/segments/{id}/toggle` | Toggle conveyor segment availability (fail / restore) |
| `POST` | `/api/conveyor/route` | Test Dijkstra shortest path between two nodes |
| `GET` | `/api/simulation/state` | Current simulation time, run state, and speed |
| `POST` | `/api/simulation/toggle` | Pause or resume simulated clock |
| `POST` | `/api/simulation/advance?minutes=X` | Jump simulation time forward by X minutes |
| `POST` | `/api/simulation/speed?multiplier=X` | Set simulation tick multiplier |
| `POST` | `/api/simulation/reset` | Reset simulation time to baseline (08:00:00) |
