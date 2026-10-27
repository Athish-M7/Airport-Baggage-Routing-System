import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { DashboardStatsDto, FlightDto, BaggageDto } from '../types';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return iso; }
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
      setError('Unable to load dashboard data. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, [loadData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading airport operations dashboard…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">📊 Airport Operations Overview</div>
          <div className="page-subtitle">Real-time status of luggage routing and flight departures</div>
        </div>
        <div className="refresh-indicator">
          <div className="refresh-dot" />
          <span>Live Sync · {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* 4 Clean Primary KPI Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-value">{stats.totalBaggage}</div>
            <div className="stat-label">🧳 Total Luggage Items</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-value">{stats.inTransitCount + stats.readyCount}</div>
            <div className="stat-label">🚚 Active on Conveyor Belts</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{stats.loadedCount}</div>
            <div className="stat-label">✅ Loaded on Aircraft</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-value">{stats.flightCount}</div>
            <div className="stat-label">✈️ Scheduled Flights</div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/baggage" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          ➕ Check-In New Luggage
        </Link>
        <Link to="/flights" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          ✈️ Flight Schedule Board
        </Link>
        <Link to="/conveyor" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          🛤️ Conveyor Belt Map
        </Link>
        <Link to="/track" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14, borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' }}>
          📱 Passenger Tracker & QR Tag
        </Link>
        <Link to="/database" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          🗄️ Database Explorer
        </Link>
      </div>

      {/* Two Column Layout: Flights & Dispatch Queue */}
      <div className="two-col">
        {/* Scheduled Flights */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✈️ Scheduled Departures</span>
            <Link to="/flights" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
              View All ➔
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Destination</th>
                  <th>Departure</th>
                  <th>Bay Gate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flights.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">No flights scheduled</td></tr>
                ) : flights.map((f) => {
                  const status = f.flightStatus || f.status || 'SCHEDULED';
                  return (
                    <tr key={f.flightId}>
                      <td className="td-mono" style={{ color: 'var(--accent-blue)' }}>{f.flightNumber}</td>
                      <td style={{ fontWeight: 500 }}>{f.destination}</td>
                      <td>{fmtTime(f.departureTime)}</td>
                      <td><span className="badge badge-gray">{f.assignedBayId}</span></td>
                      <td><span className={`badge badge-${status}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Dispatch Queue */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚦 Priority Dispatch Queue</span>
            <Link to="/baggage" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
              Manage Bags ➔
            </Link>
          </div>
          {queue.length === 0 ? (
            <div className="empty-state">No bags currently awaiting dispatch.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {queue.map((bag, idx) => {
                const status = bag.baggageProcessingStatus || bag.status || 'READY';
                return (
                  <div
                    key={bag.baggageId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--accent-blue)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{bag.baggageId}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {bag.flightNumber || bag.assignedFlightId} · {bag.passengerCategory}
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${status}`}>
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
