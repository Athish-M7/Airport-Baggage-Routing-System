import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { DashboardStatsDto, FlightDto, BaggageDto } from '../types';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-value">{value ?? 0}</div>
      <div className="stat-label">{icon} {label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [queue, setQueue] = useState<BaggageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const [statsData, flightsData, queueData] = await Promise.all([
        api.getDashboardStats(),
        api.getAllFlights(),
        api.getBaggageQueue(),
      ]);
      setStats(statsData as DashboardStatsDto);
      setFlights(Array.isArray(flightsData) ? (flightsData as FlightDto[]) : []);
      setQueue(Array.isArray(queueData) ? (queueData as BaggageDto[]).slice(0, 5) : []);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Connecting to Vaanam Airport backend API...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, [loadData]);

  const flightStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'BOARDING':   return 'var(--accent-amber)';
      case 'SCHEDULED':  return 'var(--accent-blue)';
      case 'DEPARTED':   return '#666';
      case 'DELAYED':    return 'var(--accent-red)';
      default:           return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Connecting to Operations Dashboard…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📊 Operations Dashboard</div>
          <div className="page-subtitle">Vaanam Airport — Real-time baggage routing & throughput monitoring</div>
        </div>
        <div className="refresh-indicator">
          <div className="refresh-dot" />
          <span>Live Sync 5s · {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Luggage"     value={stats.totalBaggage}           color="blue"   icon="🧳" />
          <StatCard label="Ready for Transit" value={stats.readyCount}             color="green"  icon="✅" />
          <StatCard label="On Conveyor Belts" value={stats.inTransitCount}         color="teal"   icon="🚚" />
          <StatCard label="At Risk (< Cutoff)"value={stats.atRiskCount}            color="amber"  icon="⚠️" />
          <StatCard label="Loaded on Flights" value={stats.loadedCount}            color="gray"   icon="📦" />
          <StatCard label="Missed Cutoff"     value={stats.missedCutoffCount}      color="red"    icon="🚨" />
          <StatCard label="Awaiting Security" value={stats.awaitingClearanceCount} color="orange" icon="🔒" />
          <StatCard label="Scheduled Flights" value={stats.flightCount}            color="purple" icon="✈️" />
        </div>
      )}

      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Flights overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✈️ Scheduled Flights</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{flights.length} flights scheduled</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Destination</th>
                  <th>Departure</th>
                  <th>Cutoff</th>
                  <th>Loading Bay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flights.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No flight data available</td></tr>
                ) : flights.map(f => {
                  const status = f.flightStatus || f.status || 'SCHEDULED';
                  return (
                    <tr key={f.flightId} style={{ cursor: 'default' }}>
                      <td className="td-mono">{f.flightNumber}</td>
                      <td>{f.destination}</td>
                      <td>{fmtTime(f.departureTime)}</td>
                      <td>{fmtTime(f.loadingCutoff)}</td>
                      <td><span className="badge" style={{ background: '#1c314e', color: '#64b5f6' }}>{f.assignedBayId} ({f.bayName})</span></td>
                      <td>
                        <span className="badge" style={{ color: flightStatusColor(status), border: `1px solid ${flightStatusColor(status)}40`, background: `${flightStatusColor(status)}18` }}>
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

        {/* Dispatch Queue */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚦 Priority Dispatch Queue (Top 5)</span>
          </div>
          {queue.length === 0 ? (
            <div className="empty-state">No bags currently awaiting automated dispatch.</div>
          ) : (
            <div className="queue-list">
              {queue.map((bag, idx) => {
                const status = bag.baggageProcessingStatus || bag.status || 'READY';
                return (
                  <div key={bag.baggageId} className="queue-item">
                    <div className="queue-rank">{idx + 1}</div>
                    <div className="queue-info">
                      <div className="queue-id">{bag.baggageId} ({bag.bagType})</div>
                      <div className="queue-meta">
                        {bag.flightNumber || bag.assignedFlightId} · {bag.passengerCategory} · Cutoff {fmtTime(bag.loadingCutoff)}
                      </div>
                    </div>
                    <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Conveyor Infrastructure Health</span>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="info-item">
              <span className="info-label">Active Segments</span>
              <span className="info-value" style={{ color: 'var(--accent-green)', fontSize: 20, fontWeight: 700 }}>
                {stats.activeSegmentCount} / {stats.activeSegmentCount + stats.failedSegmentCount}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Offline / Failed</span>
              <span className="info-value" style={{ color: stats.failedSegmentCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: 20, fontWeight: 700 }}>
                {stats.failedSegmentCount} {stats.failedSegmentCount > 0 ? '(SEG-06 Offline)' : ''}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Checkpoints / Nodes</span>
              <span className="info-value" style={{ color: 'var(--accent-blue)', fontSize: 20, fontWeight: 700 }}>
                {stats.nodeCount}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Aircraft Loading Progress</span>
              <span className="info-value" style={{ color: 'var(--accent-green)', fontSize: 20, fontWeight: 700 }}>
                {stats.totalBaggage > 0
                  ? Math.round((stats.loadedCount / stats.totalBaggage) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
