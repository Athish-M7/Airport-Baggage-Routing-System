import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { BaggageDto, FlightDto, RoutingRecord } from '../types';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function fmtDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}

interface ExpandedBaggage {
  baggageId: string;
  history: RoutingRecord[];
  loadingHistory: boolean;
}

export default function BaggageManagement() {
  const [allBaggage, setAllBaggage] = useState<BaggageDto[]>([]);
  const [flights, setFlights]       = useState<FlightDto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [flightFilter, setFlightFilter] = useState('ALL');
  const [search, setSearch]             = useState('');

  // Expanded row
  const [expanded, setExpanded] = useState<ExpandedBaggage | null>(null);

  // Action states
  const [actionPending, setActionPending] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [bags, fls] = await Promise.all([
        api.getAllBaggage(),
        api.getAllFlights(),
      ]);
      setAllBaggage(Array.isArray(bags) ? (bags as BaggageDto[]) : []);
      setFlights(Array.isArray(fls) ? (fls as FlightDto[]) : []);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load baggage data from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 8000);
    return () => clearInterval(id);
  }, [loadData]);

  const toggleExpand = async (bag: BaggageDto) => {
    if (expanded?.baggageId === bag.baggageId) {
      setExpanded(null);
      return;
    }
    const exp: ExpandedBaggage = { baggageId: bag.baggageId, history: [], loadingHistory: true };
    setExpanded(exp);
    try {
      const h = await api.getRoutingHistory(bag.baggageId);
      setExpanded({ baggageId: bag.baggageId, history: Array.isArray(h) ? (h as RoutingRecord[]) : [], loadingHistory: false });
    } catch {
      setExpanded({ baggageId: bag.baggageId, history: [], loadingHistory: false });
    }
  };

  const doAction = async (action: () => Promise<unknown>, key: string) => {
    setActionPending(key);
    try {
      await action();
      await loadData();
    } catch {
      // notification
    } finally {
      setActionPending(null);
    }
  };

  const filtered = allBaggage.filter(b => {
    const status = b.baggageProcessingStatus || b.status || '';
    const flight = b.flightNumber || b.assignedFlightId || b.flightId || '';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (flightFilter !== 'ALL' && flight !== flightFilter) return false;
    if (search && !b.baggageId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const uniqueStatuses = Array.from(new Set(allBaggage.map(b => b.baggageProcessingStatus || b.status || 'READY')));
  const uniqueFlights  = Array.from(new Set(allBaggage.map(b => b.flightNumber || b.assignedFlightId || b.flightId || ''))).filter(Boolean);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Loading baggage inventory…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🧳 Baggage Tracking & Clearance</div>
          <div className="page-subtitle">{allBaggage.length} total bags in system · {filtered.length} currently displayed</div>
        </div>
        <div className="refresh-indicator">
          <div className="refresh-dot" />
          <span>Live Sync 8s · {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div className="filters-bar">
        <div className="form-group search-input-wrap">
          <label className="form-label">Search by Luggage ID</label>
          <input type="search" placeholder="e.g. BAG-1001" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses ({allBaggage.length})</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Flight</label>
          <select value={flightFilter} onChange={e => setFlightFilter(e.target.value)}>
            <option value="ALL">All Flights ({flights.length})</option>
            {uniqueFlights.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
      </div>

      {/* Main table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">🧳 Luggage Inventory</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{filtered.length} records matching</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bag ID</th>
                <th>Type</th>
                <th>Flight</th>
                <th>Current Location</th>
                <th>Category</th>
                <th>Status</th>
                <th>Loading Cutoff</th>
                <th>Clearance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={9} className="empty-state">No baggage records matching filters</td>
                </tr>
              ) : filtered.map(bag => {
                const status = bag.baggageProcessingStatus || bag.status || 'READY';
                const hasClearance = bag.operatorClearance ?? false;

                return (
                  <tr key={bag.baggageId} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(bag)}>
                    <td className="td-mono">{bag.baggageId}</td>
                    <td>
                      <span className={`badge badge-${bag.bagType === 'TRANSFER' ? 'TRANSFER' : 'STANDARD'}`}>
                        {bag.bagType || (bag.transferStatus ? 'TRANSFER' : 'ORIGIN')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 600 }}>
                      {bag.flightNumber || bag.assignedFlightId}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#193050', color: '#90caf9' }}>
                        {bag.currentLocation}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${bag.passengerCategory || bag.category || 'ECONOMY'}`}>
                        {bag.passengerCategory || bag.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${status}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ color: status === 'AT_RISK' || status === 'MISSED_CUTOFF' ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {fmtTime(bag.loadingCutoff || bag.cutoffTime)}
                    </td>
                    <td>
                      <span className={hasClearance ? 'clearance-yes' : 'clearance-no'} style={{ fontWeight: 600 }}>
                        {hasClearance ? '✓ Cleared' : '✗ Awaiting'}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!hasClearance ? (
                          <button
                            className="btn btn-success btn-sm"
                            title="Grant Security Clearance"
                            disabled={actionPending === `grant-${bag.baggageId}`}
                            onClick={() => doAction(() => api.grantClearance(bag.baggageId), `grant-${bag.baggageId}`)}
                          >
                            ✓ Clear
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning btn-sm"
                            title="Revoke Security Clearance"
                            disabled={actionPending === `revoke-${bag.baggageId}`}
                            onClick={() => doAction(() => api.revokeClearance(bag.baggageId), `revoke-${bag.baggageId}`)}
                          >
                            ⛔ Revoke
                          </button>
                        )}
                        <button
                          className="btn btn-primary btn-sm"
                          title="Dynamic Shortest-Path Reroute"
                          disabled={actionPending === `reroute-${bag.baggageId}`}
                          onClick={() => doAction(() => api.rerouteBaggage(bag.baggageId), `reroute-${bag.baggageId}`)}
                        >
                          ↻ Reroute
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Confirm Aircraft Loaded"
                          disabled={actionPending === `loaded-${bag.baggageId}` || status === 'LOADED'}
                          onClick={() => doAction(() => api.confirmLoaded(bag.baggageId), `loaded-${bag.baggageId}`)}
                        >
                          📦 Load
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

      {/* Expanded Detail Modal / Drawer */}
      {expanded && (
        <div className="card" style={{ border: '2px solid var(--accent-blue)', marginBottom: 24, background: '#0e1d35' }}>
          <div className="card-header">
            <span className="card-title">🔍 Detail & Audit Trail for {expanded.baggageId}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(null)}>✕ Close</button>
          </div>
          {(() => {
            const currentBag = allBaggage.find(b => b.baggageId === expanded.baggageId);
            if (!currentBag) return null;
            const routeSteps = currentBag.plannedRoute
              ? currentBag.plannedRoute.split('->').map(s => s.trim()).filter(Boolean)
              : [];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Current Planned Conveyor Route
                  </div>
                  {routeSteps.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      {routeSteps.map((node, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '6px 12px', background: '#1c3456', borderRadius: 6, color: '#90caf9', fontWeight: 600 }}>
                            {node}
                          </span>
                          {i < routeSteps.length - 1 && <span style={{ color: 'var(--text-muted)' }}>➔</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No planned route active</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: '#122542', padding: 16, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Bay</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{currentBag.destinationBayId} ({currentBag.destinationBayName})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. Remaining Travel Time</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-teal)' }}>{currentBag.estimatedRemainingTravelTime}s</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check-in Arrival Time</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{fmtDateTime(currentBag.arrivalTime)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scan History</div>
                    <div style={{ fontSize: 13, color: '#e0e0e0' }}>{currentBag.scanHistory || 'None'}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Routing Audit Events ({expanded.history.length})
                  </div>
                  {expanded.loadingHistory ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading routing records...</div>
                  ) : expanded.history.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No dynamic reroute events logged yet for this luggage item.</div>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Event Reason</th>
                            <th>Checkpoint</th>
                            <th>Remaining Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expanded.history.map((rec, i) => (
                            <tr key={i}>
                              <td>{fmtTime(rec.timestamp)}</td>
                              <td><span className="badge" style={{ background: '#183556', color: '#64b5f6' }}>{rec.routingReason}</span></td>
                              <td className="td-mono">{rec.lastConfirmedNode}</td>
                              <td>{rec.totalEstimatedTravelTime}s</td>
                              <td><span className="badge badge-READY">{rec.routingResult}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
