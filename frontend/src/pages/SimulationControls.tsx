import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { SimulationStateDto } from '../types';

export default function SimulationControls() {
  const [state, setState] = useState<SimulationStateDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    try {
      const data = await api.getSimulationState();
      setState(data);
      setError(null);
    } catch {
      setError('Failed to connect to simulation service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 2000);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      const updated = await api.toggleSimulation();
      setState(updated);
    } catch {
      setError('Failed to toggle simulation state');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvance = async (minutes: number) => {
    setActionLoading(true);
    try {
      const updated = await api.advanceTime(minutes);
      setState(updated);
    } catch {
      setError(`Failed to advance simulation time by ${minutes} min`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSpeed = async (multiplier: number) => {
    setActionLoading(true);
    try {
      const updated = await api.setSpeed(multiplier);
      setState(updated);
    } catch {
      setError(`Failed to set speed to ${multiplier}x`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset simulation to baseline start time (08:00:00)?')) return;
    setActionLoading(true);
    try {
      const updated = await api.resetSimulation();
      setState(updated);
    } catch {
      setError('Failed to reset simulation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Connecting to Simulation Clock…</span>
      </div>
    );
  }

  const timeValue = state?.currentSimulatedTime || state?.simulationTime;
  const simTimeDisplay = timeValue
    ? new Date(timeValue).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : '08:00:00';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">⏱️ Simulation Control Center</div>
          <div className="page-subtitle">Manage simulated airport clock, tick velocity, and time jumps</div>
        </div>
        {state && (
          <span className={`badge badge-${state.running ? 'READY' : 'MISSED_CUTOFF'}`}>
            {state.running ? '● CLOCK RUNNING' : '⏸ PAUSED'}
          </span>
        )}
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* Clock Display Card */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: 24, background: 'linear-gradient(180deg, #101c30 0%, #0a1322 100%)' }}>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8 }}>
          Current Airport Simulated Time
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'monospace', color: '#64b5f6', letterSpacing: 2 }}>
          {simTimeDisplay}
        </div>
        <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
          Velocity: <strong style={{ color: '#fff' }}>{state?.speedMultiplier || 1}x Realtime</strong>
        </div>

        {/* Primary Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            style={{
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: state?.running ? 'var(--accent-amber)' : 'var(--accent-green)',
              color: '#000',
            }}
          >
            {state?.running ? '⏸ Pause Clock' : '▶ Resume Clock'}
          </button>

          <button
            onClick={handleReset}
            disabled={actionLoading}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid #ff444460',
              cursor: 'pointer',
              background: '#2a1111',
              color: '#ff6b6b',
            }}
          >
            ↺ Reset Simulation
          </button>
        </div>
      </div>

      <div className="two-col">
        {/* Fast-Forward Time Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⏩ Manual Time Advance</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Advance simulation clock immediately to test baggage cutoff deadlines and flight departures:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => handleAdvance(5)}
              disabled={actionLoading}
              className="action-btn"
              style={{ padding: '14px', borderRadius: 6, background: '#172a44', color: '#90caf9', border: '1px solid #23436b', cursor: 'pointer', fontWeight: 600 }}
            >
              + 5 Minutes
            </button>
            <button
              onClick={() => handleAdvance(15)}
              disabled={actionLoading}
              className="action-btn"
              style={{ padding: '14px', borderRadius: 6, background: '#172a44', color: '#90caf9', border: '1px solid #23436b', cursor: 'pointer', fontWeight: 600 }}
            >
              + 15 Minutes
            </button>
            <button
              onClick={() => handleAdvance(30)}
              disabled={actionLoading}
              className="action-btn"
              style={{ padding: '14px', borderRadius: 6, background: '#172a44', color: '#90caf9', border: '1px solid #23436b', cursor: 'pointer', fontWeight: 600 }}
            >
              + 30 Minutes
            </button>
            <button
              onClick={() => handleAdvance(60)}
              disabled={actionLoading}
              className="action-btn"
              style={{ padding: '14px', borderRadius: 6, background: '#172a44', color: '#90caf9', border: '1px solid #23436b', cursor: 'pointer', fontWeight: 600 }}
            >
              + 1 Hour
            </button>
          </div>
        </div>

        {/* Speed Multiplier Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Clock Velocity Multiplier</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Set how fast simulated time advances per real-world second:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[1, 2, 5, 10].map(mult => (
              <button
                key={mult}
                onClick={() => handleSpeed(mult)}
                disabled={actionLoading}
                style={{
                  padding: '16px 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  border: state?.speedMultiplier === mult ? '2px solid var(--accent-blue)' : '1px solid #1f3756',
                  background: state?.speedMultiplier === mult ? '#1a3c68' : '#101e30',
                  color: state?.speedMultiplier === mult ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
