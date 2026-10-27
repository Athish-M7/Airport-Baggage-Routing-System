export type BaggageStatus =
  | 'AWAITING_CLEARANCE'
  | 'READY'
  | 'IN_TRANSIT'
  | 'AT_RISK'
  | 'MISSED_CUTOFF'
  | 'LOADED'
  | 'UNREACHABLE';

export type PassengerCategory = 'FIRST' | 'BUSINESS' | 'FREQUENT_FLYER' | 'ECONOMY';

export interface BaggageDto {
  baggageId: string;
  bagType: 'ORIGIN' | 'TRANSFER';
  assignedFlightId: string;
  flightNumber: string;
  currentLocation: string;
  destinationBayId: string;
  destinationBayName: string;
  passengerCategory: PassengerCategory;
  declaredCategoryRank: number;
  transferStatus: boolean;
  arrivalOrder: number;
  arrivalTime: string;
  operatorClearance: boolean;
  baggageProcessingStatus: BaggageStatus;
  plannedRoute: string;
  estimatedRemainingTravelTime: number;
  loadingCutoff: string;
  scanHistory: string;

  // Compatibility aliases
  status?: BaggageStatus;
  flightId?: string;
  category?: PassengerCategory;
  cutoffTime?: string;
}

export type FlightStatus = 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED';

export interface FlightDto {
  flightId: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
  loadingCutoff: string;
  assignedBayId: string;
  bayName: string;
  flightStatus: FlightStatus;

  // Compatibility aliases
  status?: FlightStatus;
  baggageCount?: number;
  loadedCount?: number;
}

export type NodeType = 'CHECKIN' | 'JUNCTION' | 'SECURITY' | 'TRANSFER' | 'BAY' | 'SORTING';

export interface ConveyorNodeDto {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  xPos: number;
  yPos: number;

  // Compatibility aliases
  name?: string;
  type?: NodeType;
}

export interface ConveyorSegmentDto {
  segmentId: string;
  sourceNode: string;
  destinationNode: string;
  travelTimeSeconds: number;
  available: boolean;

  // Compatibility aliases
  fromNodeId?: string;
  toNodeId?: string;
  distanceMeters?: number;
  bidirectional?: boolean;
}

export interface DashboardStatsDto {
  totalBaggage: number;
  readyCount: number;
  inTransitCount: number;
  atRiskCount: number;
  loadedCount: number;
  awaitingClearanceCount: number;
  missedCutoffCount: number;
  unreachableCount: number;
  flightCount: number;
  activeSegmentCount: number;
  failedSegmentCount: number;
  nodeCount: number;

  // Compatibility aliases
  activeFlights?: number;
  boardingFlights?: number;
  avgRoutingTimeSeconds?: number;
}

export interface SimulationStateDto {
  currentSimulatedTime: string;
  running: boolean;
  speedMultiplier: number;

  // Compatibility aliases
  simulationTime?: string;
}

export interface RouteResponseDto {
  success: boolean;
  formattedRoute: string;
  nodeSequence: string[];
  segmentSequence: string[];
  totalTravelTimeSeconds: number;
  status: string;
  message?: string;

  // Compatibility aliases
  startNode?: string;
  destinationNode?: string;
  path?: string[];
}

export interface RoutingRecord {
  recordId?: number;
  baggageId: string;
  previousRoute: string;
  newRoute: string;
  lastConfirmedNode: string;
  totalEstimatedTravelTime: number;
  routingReason: string;
  timestamp: string;
  routingResult: string;
}

export interface CreateBaggageRequest {
  baggageId?: string;
  bagType: 'ORIGIN' | 'TRANSFER';
  flightId: string;
  ingestionNode: string;
  passengerCategory: PassengerCategory;
  operatorClearance: boolean;
}

export interface CreateFlightRequest {
  flightId?: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
  loadingCutoff?: string;
  assignedBayId: string;
  flightStatus?: FlightStatus;
}

export interface DatabaseStatusDto {
  connected: boolean;
  databaseProductName: string;
  databaseProductVersion: string;
  databaseUrl: string;
  driverName: string;
  pingLatencyMs: number;
  serverTime: string;
  tableCounts: Record<string, number>;
}

