import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { FlightDto, BaggageDto } from '../types';

function fmtTime(iso: string): string {
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
      setFlights(data as FlightDto[]);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load flights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
    const id = setInterval(loadFlights, 12000);
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
      setFlightBags(bags as BaggageDto[]);
    } catch {
      setFlightBags([]);
    } finally {
      setLoadingBags(false);
    }
  };

  const statusClass = (status: string) => `badge badge-${status}`;

  const sortedFlights = [...flights].sort((a, b) => {
    const order: Record<string, number> = { BOARDING: 0, DELAYED: 1, SCHEDULED: 2, DEPARTED: 3, CANCELLED: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Loading flight board…</span>
    </div>
  );

  return (
    <div>
      <div className="fids-header">
        <div>
          <div className="fids-title">✈ Vaanam Airport — Departures</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>
            FLIGHT INFORMATION DISPLAY SYSTEM
          </div>
        </div>
        <FIDSClock />
      </div>

      <div className="page-header">
        <div>
          <div className="page-subtitle">{flights.length} flights · Last updated {lastRefresh.toLocaleTimeString()}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="refresh-indicator">
            <div className="refresh-dot" />
            <span>Auto-refresh 12s</span>
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
                <th>Flight</th>
                <th>Destination</th>
                <th>Departure</th>
                <th>Cutoff</th>
                <th>Bay / Gate</th>
                <th>Status</th>
                <th>Bags Loaded</th>
              </tr>
            </thead>
            <tbody>
              {sortedFlights.length === 0 ? (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={7} className="empty-state">No flights scheduled</td>
                </tr>
              ) : sortedFlights.map(f => (
                <tr
                  key={f.flightId}
                  className={`${f.status === 'BOARDING' ? 'boarding-row' : ''} ${selectedFlight?.flightId === f.flightId ? 'expanded' : ''}`}
                  onClick={() => selectFlight(f)}
                >
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--accent-amber)', letterSpacing: 1 }}>
                      {f.flightNumber}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.flightId}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{f.destination}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-teal)' }}>{f.destinationCode}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
                    {fmtTime(f.departureTime)}
                  </td>
                  <td style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>
                    {fmtTime(f.baggageCutoffTime)}
                  </td>
                  <td>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{f.boardingGate}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.baggageBayNode}</div>
                  </td>
                  <td><span className={statusClass(f.status)}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 16 }}>{f.loadedCount}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / {f.baggageCount}</span>
                      </span>
                      {f.baggageCount > 0 && (
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(f.loadedCount / f.baggageCount) * 100}%`,
                              background: f.loadedCount === f.baggageCount ? 'var(--accent-green)' : 'var(--accent-blue)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected flight baggage */}
      {selectedFlight && (
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">🧳 Baggage for {selectedFlight.flightNumber}</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedFlight.destination} · Departs {fmtTime(selectedFlight.departureTime)} · Cutoff {fmtTime(selectedFlight.baggageCutoffTime)}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedFlight(null); setFlightBags([]); }}>✕ Close</button>
          </div>

          {loadingBags ? (
            <div className="loading-container" style={{ minHeight: 100 }}>
              <div className="spinner" />
              <span>Loading bags…</span>
            </div>
          ) : flightBags.length === 0 ? (
            <div className="empty-state">No baggage found for this flight</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bag ID</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Clearance</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {flightBags.map(b => (
                    <tr key={b.baggageId} style={{ cursor: 'default' }}>
                      <td className="td-mono">{b.baggageId}</td>
                      <td><span className="badge badge-STANDARD" style={{ fontSize: 10 }}>{b.baggageType}</span></td>
                      <td><span className={`badge badge-${b.category}`}>{b.category}</span></td>
                      <td><span className={`badge badge-${b.status}`}>{b.status.replace(/_/g, ' ')}</span></td>
                      <td>{b.currentNodeName || b.currentNodeId}</td>
                      <td className={b.clearanceGranted ? 'clearance-yes' : 'clearance-no'}>
                        {b.clearanceGranted ? '✓ Granted' : '✗ Pending'}
                      </td>
                      <td>{b.weightKg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
        <span>● Click a row to view its baggage manifest</span>
        <span>· Sorted: Boarding → Delayed → Scheduled → Departed</span>
      </div>
    </div>
  );
}
