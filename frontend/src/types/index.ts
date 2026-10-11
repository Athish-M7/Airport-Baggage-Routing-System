export type BaggageStatus =
  | 'READY'
  | 'IN_TRANSIT'
  | 'AT_RISK'
  | 'MISSED_CUTOFF'
  | 'LOADED'
  | 'AWAITING_CLEARANCE'
  | 'UNREACHABLE';

export type BaggageCategory = 'STANDARD' | 'PRIORITY' | 'FRAGILE' | 'OVERSIZED' | 'DIPLOMATIC';

export type BaggageType = 'CHECKED' | 'CARRY_ON' | 'TRANSFER';

export interface ScanRecord {
  nodeId: string;
  nodeName: string;
  scannedAt: string;
}

export interface BaggageDto {
  baggageId: string;
  passengerId: string;
  flightId: string;
  baggageType: BaggageType;
  category: BaggageCategory;
  status: BaggageStatus;
  currentNodeId: string;
  currentNodeName: string;
  destinationNodeId: string;
  destinationNodeName: string;
  plannedRoute: string[];
  scanHistory: ScanRecord[];
  cutoffTime: string;
  clearanceGranted: boolean;
  weightKg: number;
  taggedAt: string;
}

export type FlightStatus = 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'CANCELLED';

export interface FlightDto {
  flightId: string;
  flightNumber: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  baggageCutoffTime: string;
  boardingGate: string;
  baggageBayNode: string;
  status: FlightStatus;
  baggageCount: number;
  loadedCount: number;
}

export type NodeType = 'CHECKIN' | 'JUNCTION' | 'SECURITY' | 'TRANSFER' | 'BAY' | 'SORTING';

export interface ConveyorNodeDto {
  nodeId: string;
  name: string;
  type: NodeType;
  xPos: number;
  yPos: number;
  capacity: number;
  currentLoad: number;
}

export interface ConveyorSegmentDto {
  segmentId: string;
  fromNodeId: string;
  toNodeId: string;
  fromNodeName: string;
  toNodeName: string;
  travelTimeSeconds: number;
  available: boolean;
  bidirectional: boolean;
  distanceMeters: number;
}

export interface DashboardStatsDto {
  totalBaggage: number;
  readyCount: number;
  inTransitCount: number;
  atRiskCount: number;
  loadedCount: number;
  missedCutoffCount: number;
  awaitingClearanceCount: number;
  unreachableCount: number;
  activeFlights: number;
  boardingFlights: number;
  avgRoutingTimeSeconds: number;
}

export interface SimulationStateDto {
  simulationTime: string;
  running: boolean;
  speedMultiplier: number;
  totalEventsProcessed: number;
  simulationDay: number;
}

export interface RouteResponseDto {
  success: boolean;
  startNode: string;
  destinationNode: string;
  path: string[];
  pathNames: string[];
  totalTravelTimeSeconds: number;
  segmentCount: number;
  message?: string;
}

export interface RoutingRecord {
  baggageId: string;
  fromNodeId: string;
  toNodeId: string;
  routedAt: string;
  reason: string;
  success: boolean;
  travelTimeSeconds: number;
}
