import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { FlightDto, BaggageDto } from '../types';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function FIDSClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fids-time">
      {time.toLocaleTimeString('en-GB', { hour12: false })}
    </div>
  );
}

export default function FlightBoard() {
  const [flights, setFlights]           = useState<FlightDto[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDto | null>(null);
  const [flightBags, setFlightBags]     = useState<BaggageDto[]>([]);
  const [loadingBags, setLoadingBags]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [lastRefresh, setLastRefresh]   = useState(new Date());

  const loadFlights = useCallback(async () => {
    try {
      const data = await api.getAllFlights();
      setFlights(Array.isArray(data) ? (data as FlightDto[]) : []);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load flight operations board.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
    const id = setInterval(loadFlights, 10000);
    return () => clearInterval(id);
  }, [loadFlights]);

  const selectFlight = async (f: FlightDto) => {
    if (selectedFlight?.flightId === f.flightId) {
      setSelectedFlight(null);
      setFlightBags([]);
      return;
    }
    setSelectedFlight(f);
    setLoadingBags(true);
    try {
      const bags = await api.getBaggageByFlight(f.flightId);
      setFlightBags(Array.isArray(bags) ? (bags as BaggageDto[]) : []);
    } catch {
      setFlightBags([]);
    } finally {
      setLoadingBags(false);
    }
  };

  const statusClass = (status: string) => `badge badge-${status}`;

  const sortedFlights = [...flights].sort((a, b) => {
    const order: Record<string, number> = { BOARDING: 0, DELAYED: 1, SCHEDULED: 2, DEPARTED: 3 };
    const statusA = a.flightStatus || a.status || 'SCHEDULED';
    const statusB = b.flightStatus || b.status || 'SCHEDULED';
    return (order[statusA] ?? 5) - (order[statusB] ?? 5);
  });

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Connecting to Flight Information Display System…</span>
    </div>
  );

  return (
    <div>
      <div className="fids-header">
        <div>
          <div className="fids-title">✈ Vaanam Airport — Flight Departure Board</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
            REAL-TIME FLIGHT INFORMATION DISPLAY SYSTEM (FIDS)
          </div>
        </div>
        <FIDSClock />
      </div>

      <div className="page-header">
        <div>
          <div className="page-subtitle">{flights.length} active scheduled flights · Live synchronised {lastRefresh.toLocaleTimeString()}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="refresh-indicator">
            <div className="refresh-dot" />
            <span>Auto-refresh 10s</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadFlights}>↻ Refresh</button>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Flight No</th>
                <th>Destination</th>
                <th>Scheduled Departure</th>
                <th>Luggage Cutoff</th>
                <th>Pier / Bay</th>
                <th>Operation Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedFlights.length === 0 ? (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={6} className="empty-state">No scheduled flights found</td>
                </tr>
              ) : sortedFlights.map(f => {
                const status = f.flightStatus || f.status || 'SCHEDULED';
                const isSelected = selectedFlight?.flightId === f.flightId;
                return (
                  <tr
                    key={f.flightId}
                    className={`${status === 'BOARDING' ? 'boarding-row' : ''} ${isSelected ? 'expanded' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => selectFlight(f)}
                  >
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--accent-amber)', letterSpacing: 1 }}>
                        {f.flightNumber}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.flightId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.destination}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
                      {fmtTime(f.departureTime)}
                    </td>
                    <td style={{ color: 'var(--accent-amber)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {fmtTime(f.loadingCutoff)}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#1c314e', color: '#64b5f6', fontWeight: 700, fontSize: 12 }}>
                        {f.assignedBayId} ({f.bayName})
                      </span>
                    </td>
                    <td>
                      <span className={statusClass(status)}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected flight baggage manifest */}
      {selectedFlight && (
        <div className="card" style={{ border: '2px solid var(--accent-amber)' }}>
          <div className="card-header">
            <div>
              <span className="card-title">🧳 Luggage Manifest for Flight {selectedFlight.flightNumber}</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedFlight.destination} · Departs {fmtTime(selectedFlight.departureTime)} · Loading Cutoff {fmtTime(selectedFlight.loadingCutoff)} · {selectedFlight.assignedBayId}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedFlight(null); setFlightBags([]); }}>✕ Close</button>
          </div>

          {loadingBags ? (
            <div className="loading-container" style={{ minHeight: 100 }}>
              <div className="spinner" />
              <span>Fetching baggage manifest…</span>
            </div>
          ) : flightBags.length === 0 ? (
            <div className="empty-state">No baggage found for this flight.</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bag ID</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Current Checkpoint</th>
                    <th>Processing Status</th>
                    <th>Security Clearance</th>
                    <th>Planned Conveyor Route</th>
                  </tr>
                </thead>
                <tbody>
                  {flightBags.map(b => {
                    const status = b.baggageProcessingStatus || b.status || 'READY';
                    const hasClearance = b.operatorClearance ?? false;
                    return (
                      <tr key={b.baggageId} style={{ cursor: 'default' }}>
                        <td className="td-mono">{b.baggageId}</td>
                        <td>
                          <span className={`badge badge-${b.bagType === 'TRANSFER' ? 'TRANSFER' : 'STANDARD'}`}>
                            {b.bagType || (b.transferStatus ? 'TRANSFER' : 'ORIGIN')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${b.passengerCategory || b.category || 'ECONOMY'}`}>
                            {b.passengerCategory || b.category}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: '#193050', color: '#90caf9' }}>
                            {b.currentLocation}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${status}`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={hasClearance ? 'clearance-yes' : 'clearance-no'} style={{ fontWeight: 600 }}>
                            {hasClearance ? '✓ Cleared' : '✗ Awaiting'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {b.plannedRoute || 'None'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
        <span>● Click any flight row to view its real-time baggage manifest</span>
        <span>· Priority order: Boarding → Delayed → Scheduled</span>
      </div>
    </div>
  );
}
