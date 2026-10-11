import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { DashboardStatsDto, FlightDto, BaggageDto } from '../types';


function fmtTime(iso: string): string {
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
      <div className="stat-value">{value}</div>
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
      setFlights((flightsData as FlightDto[]).slice(0, 10));
      setQueue((queueData as BaggageDto[]).slice(0, 5));
      setError(null);
      setLastRefresh(new Date());
    } catch (e) {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
  }, [loadData]);

  const flightStatusColor = (status: string) => {
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
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📊 Operations Dashboard</div>
          <div className="page-subtitle">Vaanam Airport — Real-time baggage routing overview</div>
        </div>
        <div className="refresh-indicator">
          <div className="refresh-dot" />
          <span>Auto-refresh 10s · Last: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Bags"       value={stats.totalBaggage}           color="blue"   icon="🧳" />
          <StatCard label="Ready"            value={stats.readyCount}             color="green"  icon="✅" />
          <StatCard label="In Transit"       value={stats.inTransitCount}         color="teal"   icon="🚌" />
          <StatCard label="At Risk"          value={stats.atRiskCount}            color="amber"  icon="⚠️" />
          <StatCard label="Loaded"           value={stats.loadedCount}            color="gray"   icon="📦" />
          <StatCard label="Missed Cutoff"    value={stats.missedCutoffCount}      color="red"    icon="🚨" />
          <StatCard label="Awaiting Clear."  value={stats.awaitingClearanceCount} color="orange" icon="🔒" />
          <StatCard label="Active Flights"   value={stats.activeFlights}          color="purple" icon="✈️" />
        </div>
      )}

      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Flights overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✈️ Flight Overview</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{flights.length} flights</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Destination</th>
                  <th>Departure</th>
                  <th>Status</th>
                  <th>Bags</th>
                </tr>
              </thead>
              <tbody>
                {flights.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">No flights</td></tr>
                ) : flights.map(f => (
                  <tr key={f.flightId} style={{ cursor: 'default' }}>
                    <td className="td-mono">{f.flightNumber}</td>
                    <td>{f.destination} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({f.destinationCode})</span></td>
                    <td>{fmtTime(f.departureTime)}</td>
                    <td>
                      <span className="badge" style={{ color: flightStatusColor(f.status), border: `1px solid ${flightStatusColor(f.status)}40`, background: `${flightStatusColor(f.status)}18` }}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{f.loadedCount}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/{f.baggageCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Queue */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚦 Dispatch Queue (Top 5)</span>
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
                      {bag.flightId} · {bag.category} · Cutoff {fmtTime(bag.cutoffTime)}
                    </div>
                  </div>
                  <span className={`badge badge-${bag.status}`}>{bag.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 System Metrics</span>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="info-item">
              <span className="info-label">Boarding Flights</span>
              <span className="info-value" style={{ color: 'var(--accent-amber)', fontSize: 20, fontWeight: 700 }}>
                {stats.boardingFlights}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Avg Routing Time</span>
              <span className="info-value" style={{ color: 'var(--accent-teal)', fontSize: 20, fontWeight: 700 }}>
                {stats.avgRoutingTimeSeconds}s
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Unreachable</span>
              <span className="info-value" style={{ color: 'var(--accent-red)', fontSize: 20, fontWeight: 700 }}>
                {stats.unreachableCount}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Load Rate</span>
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
