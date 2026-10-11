const BASE = '/api';

export const api = {
  // Dashboard
  getDashboardStats: () => fetch(`${BASE}/dashboard/stats`).then(r => r.json()),

  // Baggage
  getAllBaggage: () => fetch(`${BASE}/baggage`).then(r => r.json()),
  getBaggageById: (id: string) => fetch(`${BASE}/baggage/${id}`).then(r => r.json()),
  getBaggageByFlight: (flightId: string) => fetch(`${BASE}/baggage/flight/${flightId}`).then(r => r.json()),
  getBaggageQueue: () => fetch(`${BASE}/baggage/queue`).then(r => r.json()),
  grantClearance: (id: string) =>
    fetch(`${BASE}/baggage/${id}/clearance/grant`, { method: 'POST' }).then(r => r.json()),
  revokeClearance: (id: string) =>
    fetch(`${BASE}/baggage/${id}/clearance/revoke`, { method: 'POST' }).then(r => r.json()),
  rerouteBaggage: (id: string) =>
    fetch(`${BASE}/baggage/${id}/reroute`, { method: 'POST' }).then(r => r.json()),
  confirmLoaded: (id: string) =>
    fetch(`${BASE}/baggage/${id}/loaded`, { method: 'POST' }).then(r => r.json()),
  getRoutingHistory: (id: string) =>
    fetch(`${BASE}/baggage/${id}/history`).then(r => r.json()),

  // Flights
  getAllFlights: () => fetch(`${BASE}/flights`).then(r => r.json()),

  // Conveyor
  getAllNodes: () => fetch(`${BASE}/conveyor/nodes`).then(r => r.json()),
  getAllSegments: () => fetch(`${BASE}/conveyor/segments`).then(r => r.json()),
  toggleSegment: (id: string) =>
    fetch(`${BASE}/conveyor/segments/${id}/toggle`, { method: 'PATCH' }).then(r => r.json()),
  computeRoute: (startNode: string, destinationNode: string) =>
    fetch(`${BASE}/conveyor/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startNode, destinationNode }),
    }).then(r => r.json()),

  // Simulation
  getSimulationState: () => fetch(`${BASE}/simulation/state`).then(r => r.json()),
  advanceTime: (minutes: number) =>
    fetch(`${BASE}/simulation/advance?minutes=${minutes}`, { method: 'POST' }).then(r => r.json()),
  toggleSimulation: () =>
    fetch(`${BASE}/simulation/toggle`, { method: 'POST' }).then(r => r.json()),
  resetSimulation: () =>
    fetch(`${BASE}/simulation/reset`, { method: 'POST' }).then(r => r.json()),
  setSpeed: (multiplier: number) =>
    fetch(`${BASE}/simulation/speed?multiplier=${multiplier}`, { method: 'POST' }).then(r => r.json()),
};
