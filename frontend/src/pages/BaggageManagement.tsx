import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { BaggageDto, FlightDto, RoutingRecord } from '../types';

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}
function fmtDateTime(iso: string): string {
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
  const [queue, setQueue]           = useState<BaggageDto[]>([]);
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
      const [bags, fls, q] = await Promise.all([
        api.getAllBaggage(),
        api.getAllFlights(),
        api.getBaggageQueue(),
      ]);
      setAllBaggage(bags as BaggageDto[]);
      setFlights(fls as FlightDto[]);
      setQueue(q as BaggageDto[]);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load baggage data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 15000);
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
      setExpanded({ baggageId: bag.baggageId, history: h as RoutingRecord[], loadingHistory: false });
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
      // silent
    } finally {
      setActionPending(null);
    }
  };

  const filtered = allBaggage.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (flightFilter !== 'ALL' && b.flightId !== flightFilter) return false;
    if (search && !b.baggageId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const uniqueStatuses = Array.from(new Set(allBaggage.map(b => b.status)));
  const uniqueFlights  = Array.from(new Set(allBaggage.map(b => b.flightId)));

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Loading baggage data…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🧳 Baggage Management</div>
          <div className="page-subtitle">{allBaggage.length} total bags · {filtered.length} shown</div>
        </div>
        <div className="refresh-indicator">
          <div className="refresh-dot" />
          <span>Auto-refresh 15s · {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div className="filters-bar">
        <div className="form-group search-input-wrap">
          <label className="form-label">Search by ID</label>
          <input type="search" placeholder="BAG-…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Flight</label>
          <select value={flightFilter} onChange={e => setFlightFilter(e.target.value)}>
            <option value="ALL">All Flights</option>
            {uniqueFlights.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
      </div>

      <div className="two-col" style={{ alignItems: 'start', marginBottom: 20 }}>
        {/* Main table */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">🧳 Baggage Items</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{filtered.length} results</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Bag ID</th>
                  <th>Type</th>
                  <th>Flight</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Cutoff</th>
                  <th>Clearance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={9} className="empty-state">No baggage matches filter</td>
                  </tr>
                ) : filtered.map(bag => {
                  const isExpanded = expanded?.baggageId === bag.baggageId;
                  const baseKey = bag.baggageId;
                  return (
                    <>
                      <tr
                        key={bag.baggageId}
                        className={isExpanded ? 'expanded' : ''}
                        onClick={() => toggleExpand(bag)}
                      >
                        <td className="td-mono">{bag.baggageId}</td>
                        <td><span className="badge badge-STANDARD" style={{ fontSize: 10 }}>{bag.baggageType}</span></td>
                        <td style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{bag.flightId}</td>
                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {bag.currentNodeName || bag.currentNodeId}
                        </td>
                        <td><span className={`badge badge-${bag.category}`}>{bag.category}</span></td>
                        <td><span className={`badge badge-${bag.status}`}>{bag.status.replace(/_/g, ' ')}</span></td>
                        <td style={{ color: bag.status === 'AT_RISK' || bag.status === 'MISSED_CUTOFF' ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          {fmtTime(bag.cutoffTime)}
                        </td>
                        <td className={bag.clearanceGranted ? 'clearance-yes' : 'clearance-no'}>
                          {bag.clearanceGranted ? '✓ Yes' : '✗ No'}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {!bag.clearanceGranted ? (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={actionPending === `grant-${baseKey}`}
                                onClick={() => doAction(() => api.grantClearance(bag.baggageId), `grant-${baseKey}`)}
                              >✓</button>
                            ) : (
                              <button
                                className="btn btn-warning btn-sm"
                                disabled={actionPending === `revoke-${baseKey}`}
                                onClick={() => doAction(() => api.revokeClearance(bag.baggageId), `revoke-${baseKey}`)}
                              >⛔</button>
                            )}
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actionPending === `reroute-${baseKey}`}
                              onClick={() => doAction(() => api.rerouteBaggage(bag.baggageId), `reroute-${baseKey}`)}
                            >↻</button>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={actionPending === `loaded-${baseKey}` || bag.status === 'LOADED'}
                              onClick={() => doAction(() => api.confirmLoaded(bag.baggageId), `loaded-${baseKey}`)}
                            >📦</button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${bag.baggageId}-expanded`} className="expanded-row">
                          <td colSpan={9}>
                            <div className="expanded-content">
                              <div className="expanded-grid">
                                {/* Planned Route */}
                                <div className="expanded-section">
                                  <div className="expanded-section-title">📍 Planned Route</div>
                                  {bag.plannedRoute && bag.plannedRoute.length > 0 ? (
                                    <div className="route-path">
                                      {bag.plannedRoute.map((n, i) => (
                                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                          <span className="route-node">{n}</span>
                                          {i < bag.plannedRoute.length - 1 && <span className="route-arrow">→</span>}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No route planned</span>
                                  )}
                                  <div className="divider" />
                                  <div className="info-grid" style={{ marginTop: 8 }}>
                                    <div className="info-item">
                                      <span className="info-label">Destination</span>
                                      <span className="info-value">{bag.destinationNodeName || bag.destinationNodeId}</span>
                                    </div>
                                    <div className="info-item">
                                      <span className="info-label">Passenger</span>
                                      <span className="info-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{bag.passengerId}</span>
                                    </div>
                                    <div className="info-item">
                                      <span className="info-label">Weight</span>
                                      <span className="info-value">{bag.weightKg} kg</span>
                                    </div>
                                    <div className="info-item">
                                      <span className="info-label">Tagged At</span>
                                      <span className="info-value">{fmtTime(bag.taggedAt)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Scan History */}
                                <div className="expanded-section">
                                  <div className="expanded-section-title">📡 Scan History ({bag.scanHistory?.length ?? 0})</div>
                                  <div className="scan-list">
                                    {bag.scanHistory && bag.scanHistory.length > 0 ? (
                                      bag.scanHistory.map((s, i) => (
                                        <div key={i} className="scan-item">
                                          <span className="scan-node">{s.nodeName || s.nodeId}</span>
                                          <span className="scan-time">{fmtDateTime(s.scannedAt)}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No scans recorded</span>
                                    )}
                                  </div>
                                </div>

                                {/* Routing History */}
                                <div className="expanded-section">
                                  <div className="expanded-section-title">🗂️ Routing History</div>
                                  {expanded?.loadingHistory ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Loading…</div>
                                  ) : expanded?.history && expanded.history.length > 0 ? (
                                    <div className="scan-list">
                                      {expanded.history.map((r, i) => (
                                        <div key={i} className="scan-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span className="scan-node">{r.fromNodeId} → {r.toNodeId}</span>
                                            <span className={r.success ? 'clearance-yes' : 'clearance-no'} style={{ fontSize: 10 }}>
                                              {r.success ? '✓' : '✗'}
                                            </span>
                                          </div>
                                          <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                                            {r.reason} · {r.travelTimeSeconds}s · {fmtDateTime(r.routedAt)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No routing records</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Queue panel */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🚦 Dispatch Queue ({queue.length})</span>
        </div>
        {queue.length === 0 ? (
          <div className="empty-state">Queue is empty</div>
        ) : (
          <div className="queue-list">
            {queue.map((bag, idx) => (
              <div key={bag.baggageId} className="queue-item">
                <div className="queue-rank">{idx + 1}</div>
                <div className="queue-info">
                  <div className="queue-id">{bag.baggageId}</div>
                  <div className="queue-meta">
                    {bag.flightId} · {bag.category} · Cutoff {fmtTime(bag.cutoffTime)} · {bag.currentNodeName}
                  </div>
                </div>
                <span className={`badge badge-${bag.status}`}>{bag.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Action buttons: <strong style={{ color: 'var(--accent-green)' }}>✓</strong> Grant Clearance ·
          <strong style={{ color: 'var(--accent-amber)' }}> ⛔</strong> Revoke ·
          <strong style={{ color: 'var(--accent-blue)' }}> ↻</strong> Reroute ·
          <strong> 📦</strong> Confirm Loaded</span>
        <span style={{ marginLeft: 'auto' }}>Click row to expand details</span>
      </div>

      {/* Flights filter reference */}
      <div style={{ marginTop: 8, display: 'none' }}>{flights.length}</div>
    </div>
  );
}
