import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { FlightDto, BaggageDto, FlightStatus, CreateFlightRequest } from '../types';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return iso; }
}

export default function FlightBoard() {
  const [flights, setFlights]               = useState<FlightDto[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDto | null>(null);
  const [flightBags, setFlightBags]         = useState<BaggageDto[]>([]);
  const [loadingBags, setLoadingBags]       = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [successMsg, setSuccessMsg]         = useState<string | null>(null);
  const [lastRefresh, setLastRefresh]       = useState(new Date());

  // Modal
  const [showModal, setShowModal]           = useState(false);
  const [newFlightNumber, setNewFlightNumber] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDepartureTime, setNewDepartureTime] = useState('');
  const [newBayId, setNewBayId]             = useState('BAY-1');
  const [newStatus, setNewStatus]           = useState<FlightStatus>('SCHEDULED');
  const [submitting, setSubmitting]         = useState(false);

  const loadFlights = useCallback(async () => {
    try {
      const data = await api.getAllFlights();
      setFlights(Array.isArray(data) ? (data as FlightDto[]) : []);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Unable to load flight schedule from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
    const id = setInterval(loadFlights, 10000);
    return () => clearInterval(id);
  }, [loadFlights]);

  // Set default departure to 2 hours from now
  useEffect(() => {
    const defaultTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    defaultTime.setMinutes(Math.ceil(defaultTime.getMinutes() / 15) * 15, 0, 0);
    const isoLocal = new Date(defaultTime.getTime() - defaultTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNewDepartureTime(isoLocal);
  }, []);

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
      setFlightBags(Array.isArray(bags) ? bags : []);
    } catch {
      setFlightBags([]);
    } finally {
      setLoadingBags(false);
    }
  };

  const handleDeleteFlight = async (flightId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete flight ${flightId}?`)) return;
    try {
      await api.deleteFlight(flightId);
      setSuccessMsg(`Flight ${flightId} deleted.`);
      if (selectedFlight?.flightId === flightId) {
        setSelectedFlight(null);
        setFlightBags([]);
      }
      await loadFlights();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete flight.');
    }
  };

  const handleStatusChange = async (flightId: string, targetStatus: FlightStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateFlightStatus(flightId, targetStatus);
      await loadFlights();
    } catch (err: any) {
      setError(err.message || 'Failed to update flight status.');
    }
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightNumber.trim() || !newDestination.trim() || !newDepartureTime) return;
    setSubmitting(true);
    setError(null);
    try {
      const departureIso = new Date(newDepartureTime).toISOString();
      const cutoffTime = new Date(new Date(newDepartureTime).getTime() - 45 * 60000).toISOString();

      const req: CreateFlightRequest = {
        flightNumber: newFlightNumber.trim().toUpperCase(),
        destination: newDestination.trim(),
        departureTime: departureIso,
        loadingCutoff: cutoffTime,
        assignedBayId: newBayId,
        flightStatus: newStatus,
      };

      const created = await api.createFlight(req);
      setSuccessMsg(`Flight ${created.flightNumber} to ${created.destination} added!`);
      setShowModal(false);
      setNewFlightNumber('');
      setNewDestination('');
      await loadFlights();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule flight.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading flight departure schedule…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">✈️ Flight Departure Schedule</div>
          <div className="page-subtitle">{flights.length} active scheduled flights</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Schedule New Flight
          </button>
          <div className="refresh-indicator">
            <div className="refresh-dot" />
            <span>{lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent-green)', color: 'var(--accent-green)', padding: '12px 16px' }}>
          ✅ {successMsg}
        </div>
      )}

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* Clean Flights Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Flight No</th>
                <th>Destination</th>
                <th>Departure Time</th>
                <th>Luggage Cutoff</th>
                <th>Loading Bay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">No scheduled flights found.</td></tr>
              ) : flights.map((f) => {
                const status = f.flightStatus || f.status || 'SCHEDULED';
                const isSelected = selectedFlight?.flightId === f.flightId;

                return (
                  <tr
                    key={f.flightId}
                    onClick={() => selectFlight(f)}
                    style={{ cursor: 'pointer', background: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined }}
                  >
                    <td>
                      <div className="td-mono" style={{ fontSize: 14, color: 'var(--accent-blue)', fontWeight: 700 }}>
                        {f.flightNumber}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 14 }}>{f.destination}</td>
                    <td>{fmtTime(f.departureTime)}</td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{fmtTime(f.loadingCutoff)}</td>
                    <td>
                      <span className="badge badge-gray">{f.assignedBayId} ({f.bayName})</span>
                    </td>
                    <td>
                      <span className={`badge badge-${status}`}>{status}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {status !== 'BOARDING' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Mark as Boarding"
                            onClick={(e) => handleStatusChange(f.flightId, 'BOARDING', e)}
                          >
                            🚪 Board
                          </button>
                        )}
                        {status !== 'DELAYED' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Mark as Delayed"
                            onClick={(e) => handleStatusChange(f.flightId, 'DELAYED', e)}
                          >
                            ⚠️ Delay
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent-red)' }}
                          title="Delete Flight"
                          onClick={(e) => handleDeleteFlight(f.flightId, e)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flight Baggage Manifest */}
      {selectedFlight && (
        <div className="card" style={{ marginTop: 20, borderColor: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.04)' }}>
          <div className="card-header">
            <div>
              <span className="card-title">🧳 Luggage Assigned to {selectedFlight.flightNumber} ({selectedFlight.destination})</span>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Departure: {fmtTime(selectedFlight.departureTime)} · Gate Bay: {selectedFlight.assignedBayId} · {flightBags.length} bags found
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedFlight(null)}>✕ Close</button>
          </div>

          {loadingBags ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading flight manifest…
            </div>
          ) : flightBags.length === 0 ? (
            <div className="empty-state">No baggage checked in for this flight yet.</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Luggage ID</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Current Station</th>
                    <th>Status</th>
                    <th>Route</th>
                  </tr>
                </thead>
                <tbody>
                  {flightBags.map((b) => {
                    const status = b.baggageProcessingStatus || b.status || 'READY';
                    return (
                      <tr key={b.baggageId}>
                        <td className="td-mono">{b.baggageId}</td>
                        <td>{b.bagType}</td>
                        <td><span className={`badge badge-${b.passengerCategory || 'ECONOMY'}`}>{b.passengerCategory}</span></td>
                        <td><span className="badge badge-blue">{b.currentLocation}</span></td>
                        <td><span className={`badge badge-${status}`}>{status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.plannedRoute || 'Direct'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule Flight Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">✈️ Schedule New Flight</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateFlight}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Flight Number</label>
                    <input
                      type="text"
                      placeholder="e.g. VA-602"
                      value={newFlightNumber}
                      onChange={(e) => setNewFlightNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Destination Airport</label>
                    <input
                      type="text"
                      placeholder="e.g. Singapore (SIN)"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Scheduled Departure</label>
                    <input
                      type="datetime-local"
                      value={newDepartureTime}
                      onChange={(e) => setNewDepartureTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Assigned Loading Bay Gate</label>
                    <select
                      value={newBayId}
                      onChange={(e) => setNewBayId(e.target.value)}
                    >
                      <option value="BAY-1">BAY-1 (Bay 01)</option>
                      <option value="BAY-2">BAY-2 (Bay 02)</option>
                      <option value="BAY-3">BAY-3 (Bay 03)</option>
                      <option value="BAY-4">BAY-4 (Bay 04)</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as FlightStatus)}
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="BOARDING">BOARDING</option>
                    <option value="DELAYED">DELAYED</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : '💾 Schedule Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
