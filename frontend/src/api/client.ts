import {
  BaggageDto,
  CreateBaggageRequest,
  CreateFlightRequest,
  DatabaseStatusDto,
  FlightDto,
  FlightStatus,
  ConveyorNodeDto,
  ConveyorSegmentDto,
  DashboardStatsDto,
  SimulationStateDto,
  RouteResponseDto,
  RoutingRecord,
} from '../types';

const BASE = '/api';

export const api = {
  // Dashboard
  getDashboardStats: (): Promise<DashboardStatsDto> =>
    fetch(`${BASE}/dashboard/stats`).then((r) => r.json()),

  // Baggage Operations & User Input
  getAllBaggage: (): Promise<BaggageDto[]> =>
    fetch(`${BASE}/baggage`).then((r) => r.json()),
  getBaggageById: (id: string): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}`).then((r) => r.json()),
  getBaggageByFlight: (flightId: string): Promise<BaggageDto[]> =>
    fetch(`${BASE}/baggage/flight/${flightId}`).then((r) => r.json()),
  getBaggageQueue: (): Promise<BaggageDto[]> =>
    fetch(`${BASE}/baggage/queue`).then((r) => r.json()),
  createBaggage: (req: CreateBaggageRequest): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Failed to create baggage' }));
        throw new Error(err.message || 'Check-in failed');
      }
      return r.json();
    }),
  deleteBaggage: (id: string): Promise<void> =>
    fetch(`${BASE}/baggage/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Failed to delete baggage');
    }),
  scanBaggage: (id: string, nodeId: string, travelTimeDeduction = 0): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baggageId: id, nodeId, travelTimeDeduction }),
    }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Scan failed' }));
        throw new Error(err.message || 'Scan failed');
      }
      return r.json();
    }),
  grantClearance: (id: string): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}/clearance/grant`, { method: 'POST' }).then((r) => r.json()),
  revokeClearance: (id: string): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}/clearance/revoke`, { method: 'POST' }).then((r) => r.json()),
  rerouteBaggage: (id: string): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}/reroute`, { method: 'POST' }).then((r) => r.json()),
  confirmLoaded: (id: string): Promise<BaggageDto> =>
    fetch(`${BASE}/baggage/${id}/loaded`, { method: 'POST' }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Cannot confirm baggage loaded' }));
        throw new Error(err.message || 'Cannot confirm loaded');
      }
      return r.json();
    }),
  getRoutingHistory: (id: string): Promise<RoutingRecord[]> =>
    fetch(`${BASE}/baggage/${id}/history`).then((r) => r.json()),

  // Flight Operations & User Input
  getAllFlights: (): Promise<FlightDto[]> =>
    fetch(`${BASE}/flights`).then((r) => r.json()),
  getFlightById: (id: string): Promise<FlightDto> =>
    fetch(`${BASE}/flights/${id}`).then((r) => r.json()),
  createFlight: (req: CreateFlightRequest): Promise<FlightDto> =>
    fetch(`${BASE}/flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Failed to schedule flight' }));
        throw new Error(err.message || 'Flight creation failed');
      }
      return r.json();
    }),
  deleteFlight: (id: string): Promise<void> =>
    fetch(`${BASE}/flights/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Failed to delete flight');
    }),
  updateFlightStatus: (id: string, status: FlightStatus): Promise<FlightDto> =>
    fetch(`${BASE}/flights/${id}/status?status=${status}`, { method: 'PATCH' }).then((r) => r.json()),

  // Conveyor Network
  getAllNodes: (): Promise<ConveyorNodeDto[]> =>
    fetch(`${BASE}/conveyor/nodes`).then((r) => r.json()),
  getAllSegments: (): Promise<ConveyorSegmentDto[]> =>
    fetch(`${BASE}/conveyor/segments`).then((r) => r.json()),
  toggleSegment: (id: string): Promise<ConveyorSegmentDto> =>
    fetch(`${BASE}/conveyor/segments/${id}/toggle`, { method: 'PATCH' }).then((r) => r.json()),
  computeRoute: (startNode: string, destinationNode: string): Promise<RouteResponseDto> =>
    fetch(`${BASE}/conveyor/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startNode, destinationNode }),
    }).then((r) => r.json()),

  // Simulation
  getSimulationState: (): Promise<SimulationStateDto> =>
    fetch(`${BASE}/simulation/state`).then((r) => r.json()),
  advanceTime: (minutes: number): Promise<SimulationStateDto> =>
    fetch(`${BASE}/simulation/advance?minutes=${minutes}`, { method: 'POST' }).then((r) => r.json()),
  toggleSimulation: (): Promise<SimulationStateDto> =>
    fetch(`${BASE}/simulation/toggle`, { method: 'POST' }).then((r) => r.json()),
  resetSimulation: (): Promise<SimulationStateDto> =>
    fetch(`${BASE}/simulation/reset`, { method: 'POST' }).then((r) => r.json()),
  setSpeed: (multiplier: number): Promise<SimulationStateDto> =>
    fetch(`${BASE}/simulation/speed?multiplier=${multiplier}`, { method: 'POST' }).then((r) => r.json()),

  // Database Introspection & Connectivity
  getDatabaseStatus: (): Promise<DatabaseStatusDto> =>
    fetch(`${BASE}/database/status`).then((r) => r.json()),
  getTableData: (tableName: string, limit = 50): Promise<Record<string, any>[]> =>
    fetch(`${BASE}/database/tables/${tableName}?limit=${limit}`).then((r) => r.json()),
  reseedDatabase: (): Promise<{ message: string }> =>
    fetch(`${BASE}/database/seed`, { method: 'POST' }).then((r) => r.json()),
  clearBaggage: (): Promise<{ message: string }> =>
    fetch(`${BASE}/database/clear-baggage`, { method: 'POST' }).then((r) => r.json()),

  // Airport Staff & Authentication Data
  getAllStaff: (): Promise<any[]> =>
    fetch(`${BASE}/staff`).then((r) => r.json()),
  registerStaffApi: (data: any): Promise<any> =>
    fetch(`${BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};
