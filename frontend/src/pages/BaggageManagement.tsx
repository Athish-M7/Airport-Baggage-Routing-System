import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { BaggageDto, FlightDto, RoutingRecord, PassengerCategory, CreateBaggageRequest, RouteResponseDto } from '../types';
import PassengerQrModal from '../components/PassengerQrModal';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return iso; }
}

export default function BaggageManagement() {
  const [allBaggage, setAllBaggage] = useState<BaggageDto[]>([]);
  const [flights, setFlights]       = useState<FlightDto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simple Filters
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory]       = useState<RoutingRecord[]>([]);

  // Modals
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showScanModal, setShowScanModal]       = useState(false);
  const [qrBag, setQrBag]                       = useState<BaggageDto | null>(null);

  // Check-In Form
  const [newBagId, setNewBagId] = useState('');
  const [newBagType, setNewBagType] = useState<'ORIGIN' | 'TRANSFER'>('ORIGIN');
  const [newFlightId, setNewFlightId] = useState('');
  const [newIngestionNode, setNewIngestionNode] = useState('CHK-1');
  const [newCategory, setNewCategory] = useState<PassengerCategory>('ECONOMY');
  const [newClearance, setNewClearance] = useState(true);
  const [routePreview, setRoutePreview] = useState<RouteResponseDto | null>(null);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Checkpoint Scan Form
  const [scanBagId, setScanBagId] = useState('');
  const [scanNodeId, setScanNodeId] = useState('SEC-1');
  const [scanDeduction, setScanDeduction] = useState(30);
  const [submittingScan, setSubmittingScan] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bags, fls] = await Promise.all([
        api.getAllBaggage(),
        api.getAllFlights(),
      ]);
      setAllBaggage(Array.isArray(bags) ? (bags as BaggageDto[]) : []);
      setFlights(Array.isArray(fls) ? (fls as FlightDto[]) : []);
      if (!newFlightId && fls && fls.length > 0) {
        setNewFlightId(fls[0].flightId);
      }
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Unable to load baggage records from database.');
    } finally {
      setLoading(false);
    }
  }, [newFlightId]);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 8000);
    return () => clearInterval(id);
  }, [loadData]);

  // Live route calculation preview inside Check-In modal
  useEffect(() => {
    if (!newFlightId || !newIngestionNode) return;
    const fl = flights.find(f => f.flightId === newFlightId);
    if (!fl) return;
    const bayNum = fl.assignedBayId?.replace('BAY-', '') || '1';
    const destNode = `BAY-0${bayNum}`;

    api.computeRoute(newIngestionNode, destNode)
      .then((res) => setRoutePreview(res))
      .catch(() => setRoutePreview(null));
  }, [newFlightId, newIngestionNode, flights]);

  const toggleExpand = async (bag: BaggageDto) => {
    if (expandedId === bag.baggageId) {
      setExpandedId(null);
      setHistory([]);
      return;
    }
    setExpandedId(bag.baggageId);
    try {
      const h = await api.getRoutingHistory(bag.baggageId);
      setHistory(Array.isArray(h) ? h : []);
    } catch {
      setHistory([]);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete baggage ${id}?`)) return;
    try {
      await api.deleteBaggage(id);
      setSuccessMsg(`Baggage ${id} removed.`);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete baggage.');
    }
  };

  const handleConfirmLoaded = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.confirmLoaded(id);
      setSuccessMsg(`Baggage ${id} loaded on aircraft!`);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Cannot load baggage.');
    }
  };

  const handleClearanceToggle = async (bag: BaggageDto, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (bag.operatorClearance) {
        await api.revokeClearance(bag.baggageId);
      } else {
        await api.grantClearance(bag.baggageId);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Clearance update failed.');
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightId) return;
    setSubmittingCheckIn(true);
    setError(null);
    try {
      const req: CreateBaggageRequest = {
        baggageId: newBagId.trim() || undefined,
        bagType: newBagType,
        flightId: newFlightId,
        ingestionNode: newIngestionNode,
        passengerCategory: newCategory,
        operatorClearance: newClearance,
      };
      const created = await api.createBaggage(req);
      setSuccessMsg(`Luggage ${created.baggageId} checked in! Route calculated automatically.`);
      setShowCheckInModal(false);
      setNewBagId('');
      await loadData();
      setQrBag(created); // Automatically show passenger QR tag for instant scanning!
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanBagId) return;
    setSubmittingScan(true);
    setError(null);
    try {
      await api.scanBaggage(scanBagId, scanNodeId, scanDeduction);
      setSuccessMsg(`Baggage ${scanBagId} scanned at node ${scanNodeId}!`);
      setShowScanModal(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Scan update failed.');
    } finally {
      setSubmittingScan(false);
    }
  };

  const filtered = allBaggage.filter((b) => {
    const status = b.baggageProcessingStatus || b.status || '';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (search && !b.baggageId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading baggage inventory…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">🧳 Baggage Management</div>
          <div className="page-subtitle">{allBaggage.length} total bags in system · {filtered.length} displayed</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setShowCheckInModal(true)}>
            ➕ Check-In New Bag
          </button>
          <button className="btn btn-ghost" onClick={() => setShowScanModal(true)}>
            📡 Checkpoint Scanner
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

      {/* Simple Search & Filter */}
      <div className="filters-bar">
        <input
          type="search"
          placeholder="🔍 Search Bag ID (e.g. BAG-1001)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses ({allBaggage.length})</option>
          <option value="READY">Ready</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="LOADED">Loaded</option>
          <option value="AWAITING_CLEARANCE">Waiting Clearance</option>
          <option value="AT_RISK">At Risk</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
      </div>

      {/* Clean Baggage Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Luggage ID</th>
                <th>Class & Type</th>
                <th>Assigned Flight</th>
                <th>Current Station</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No matching baggage records found.</td></tr>
              ) : filtered.map((b) => {
                const status = b.baggageProcessingStatus || b.status || 'READY';
                const isExpanded = expandedId === b.baggageId;

                return (
                  <tr
                    key={b.baggageId}
                    onClick={() => toggleExpand(b)}
                    style={{ cursor: 'pointer', background: isExpanded ? 'rgba(59, 130, 246, 0.08)' : undefined }}
                  >
                    <td>
                      <div className="td-mono" style={{ color: '#fff', fontSize: 14 }}>{b.baggageId}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${b.passengerCategory || 'ECONOMY'}`}>
                        {b.passengerCategory || 'Economy'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>
                        ({b.bagType || (b.transferStatus ? 'Transfer' : 'Origin')})
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                        {b.flightNumber || b.assignedFlightId}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Dest Bay: {b.destinationBayId}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{b.currentLocation}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${status}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent-teal)' }}
                          title="View Digital Passenger Tag & Live Scannable QR Code"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrBag(b);
                          }}
                        >
                          📱 Tag
                        </button>
                        {status !== 'LOADED' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Confirm Loaded on Aircraft"
                            onClick={(e) => handleConfirmLoaded(b.baggageId, e)}
                          >
                            📦 Load
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: b.operatorClearance ? 'var(--accent-green)' : 'var(--accent-amber)' }}
                          title="Toggle Security Clearance"
                          onClick={(e) => handleClearanceToggle(b, e)}
                        >
                          {b.operatorClearance ? '✓ Cleared' : '🔒 Clear'}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent-red)' }}
                          title="Delete Baggage"
                          onClick={(e) => handleDelete(b.baggageId, e)}
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

      {/* Expanded Route Details Card */}
      {expandedId && (() => {
        const bag = allBaggage.find(b => b.baggageId === expandedId);
        if (!bag) return null;
        const routeSteps = bag.plannedRoute ? bag.plannedRoute.split('->').map(s => s.trim()) : [];

        return (
          <div className="card" style={{ marginTop: 20, borderColor: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.04)' }}>
            <div className="card-header">
              <span className="card-title">🔍 Route & Details for {bag.baggageId}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(null)}>✕ Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
                  Planned Conveyor Path (Dijkstra Shortest Route)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {routeSteps.map((node, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 6, color: '#60a5fa', fontWeight: 600 }}>
                        {node}
                      </span>
                      {i < routeSteps.length - 1 && <span style={{ color: 'var(--text-muted)' }}>➔</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Target Gate / Bay</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{bag.destinationBayId} ({bag.destinationBayName})</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Estimated Travel Time</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-teal)' }}>{bag.estimatedRemainingTravelTime} seconds</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Loading Cutoff Time</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-amber)' }}>{fmtTime(bag.loadingCutoff)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Security Clearance</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: bag.operatorClearance ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {bag.operatorClearance ? 'Granted ✓' : 'Awaiting Clearance ✖'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Audit Events Logged</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>
                    {history.length} event(s)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Passenger Experience</div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 2, padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setQrBag(bag)}
                  >
                    📱 View QR Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="modal-backdrop" onClick={() => setShowCheckInModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Check-In New Baggage</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCheckInModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCheckInSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Luggage Tag ID</label>
                    <input
                      type="text"
                      placeholder="e.g. BAG-1050 (auto if empty)"
                      value={newBagId}
                      onChange={(e) => setNewBagId(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Luggage Type</label>
                    <select
                      value={newBagType}
                      onChange={(e) => setNewBagType(e.target.value as 'ORIGIN' | 'TRANSFER')}
                    >
                      <option value="ORIGIN">Origin (Standard Check-in)</option>
                      <option value="TRANSFER">Transfer (Connecting Flight)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Flight</label>
                    <select
                      value={newFlightId}
                      onChange={(e) => setNewFlightId(e.target.value)}
                      required
                    >
                      {flights.map((f) => (
                        <option key={f.flightId} value={f.flightId}>
                          {f.flightNumber} ➔ {f.destination} ({f.assignedBayId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Check-in Desk / Station</label>
                    <select
                      value={newIngestionNode}
                      onChange={(e) => setNewIngestionNode(e.target.value)}
                    >
                      <option value="CHK-1">CHK-1 (Terminal Check-In Desk 1)</option>
                      <option value="CHK-2">CHK-2 (Terminal Check-In Desk 2)</option>
                      <option value="TRF-1">TRF-1 (Transfer Inbound Point)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Passenger Class</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PassengerCategory)}
                    >
                      <option value="FIRST">First Class (Highest Priority)</option>
                      <option value="BUSINESS">Business Class</option>
                      <option value="FREQUENT_FLYER">Frequent Flyer</option>
                      <option value="ECONOMY">Economy (Standard)</option>
                    </select>
                  </div>
                  <div className="form-field" style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 18 }}>
                      <input
                        type="checkbox"
                        checked={newClearance}
                        onChange={(e) => setNewClearance(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Operator Security Clearance</span>
                    </label>
                  </div>
                </div>

                {/* Instant Path Preview */}
                <div className="path-preview-box">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                    ⚡ Automatic Shortest Path Preview
                  </div>
                  {routePreview?.success ? (
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#60a5fa', marginTop: 4 }}>
                        {routePreview.formattedRoute}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Travel Time: <strong style={{ color: 'var(--accent-teal)' }}>{routePreview.totalTravelTimeSeconds}s</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calculating route…</div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCheckInModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingCheckIn}>
                  {submittingCheckIn ? 'Saving...' : '💾 Check-In & Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkpoint Scanner Modal */}
      {showScanModal && (
        <div className="modal-backdrop" onClick={() => setShowScanModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📡 Simulate Barcode Scan</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowScanModal(false)}>✕</button>
            </div>
            <form onSubmit={handleScanSubmit}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Select Luggage</label>
                  <select
                    value={scanBagId}
                    onChange={(e) => setScanBagId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Bag --</option>
                    {allBaggage.map((b) => (
                      <option key={b.baggageId} value={b.baggageId}>
                        {b.baggageId} ({b.flightNumber}) · Currently at {b.currentLocation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Scanner Checkpoint</label>
                    <select
                      value={scanNodeId}
                      onChange={(e) => setScanNodeId(e.target.value)}
                    >
                      <option value="SEC-1">SEC-1 (Security Check 1)</option>
                      <option value="SEC-2">SEC-2 (Security Check 2)</option>
                      <option value="JNC-A">JNC-A (Sorting Junction A)</option>
                      <option value="JNC-B">JNC-B (Sorting Junction B)</option>
                      <option value="SRT-1">SRT-1 (Automated Sorter)</option>
                      <option value="BAY-01">BAY-01 (Gate Bay 1)</option>
                      <option value="BAY-02">BAY-02 (Gate Bay 2)</option>
                      <option value="BAY-03">BAY-03 (Gate Bay 3)</option>
                      <option value="BAY-04">BAY-04 (Gate Bay 4)</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Travel Time Elapsed (Seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={scanDeduction}
                      onChange={(e) => setScanDeduction(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowScanModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingScan || !scanBagId}>
                  {submittingScan ? 'Scanning...' : '📡 Record Scan in Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passenger Digital Boarding Tag & Live Scannable QR Modal */}
      {qrBag && (
        <PassengerQrModal
          bag={qrBag}
          onClose={() => setQrBag(null)}
        />
      )}
    </div>
  );
}
