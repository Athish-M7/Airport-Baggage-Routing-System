import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../api/client';
import type { SimulationStateDto } from '../types';

const navItems = [
  { to: '/',           icon: '📊', label: 'Dashboard' },
  { to: '/baggage',    icon: '🧳', label: 'Baggage' },
  { to: '/flights',    icon: '✈️',  label: 'Flights' },
  { to: '/conveyor',   icon: '🛤️',  label: 'Conveyor' },
  { to: '/simulation', icon: '⏱️',  label: 'Simulation' },
  { to: '/routing',    icon: '🗺️',  label: 'Route Calc' },
];

function formatSimTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '--:--:--';
    return d.toLocaleTimeString('en-GB', { hour12: false });
  } catch {
    return '--:--:--';
  }
}

function formatSimDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function Sidebar() {
  const [simState, setSimState] = useState<SimulationStateDto | null>(null);

  useEffect(() => {
    const load = () => {
      api.getSimulationState()
        .then(data => setSimState(data as SimulationStateDto))
        .catch(() => { /* silent */ });
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✈️</div>
        <div className="sidebar-logo-name">Vaanam</div>
        <div className="sidebar-logo-sub">Baggage Routing System</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-clock">
        <div className="sidebar-clock-label">Sim Clock</div>
        <div className="sidebar-clock-time">
          {simState ? formatSimTime(simState.currentSimulatedTime || simState.simulationTime || '') : '--:--:--'}
        </div>
        {simState && (
          <>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: 2 }}>
              {formatSimDate(simState.currentSimulatedTime || simState.simulationTime || '')}
            </div>
            <div className="sidebar-clock-speed">
              {simState.speedMultiplier}x speed
            </div>
            <div className={`sidebar-clock-status ${simState.running ? 'sim-running' : 'sim-paused'}`}>
              {simState.running ? '● Running' : '⏸ Paused'}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
