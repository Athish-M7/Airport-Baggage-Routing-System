import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import VaanamLogo from './VaanamLogo';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',         icon: '📊', label: 'Dashboard' },
  { to: '/baggage',  icon: '🧳', label: 'Baggage' },
  { to: '/flights',  icon: '✈️',  label: 'Flights' },
  { to: '/conveyor', icon: '🛤️',  label: 'Conveyor' },
  { to: '/routing',  icon: '🗺️',  label: 'Route Calc' },
  { to: '/database', icon: '🗄️', label: 'Database' },
  { to: '/track',    icon: '📱', label: 'Passenger Tag' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clock, setClock] = useState<Date>(new Date());

  useEffect(() => {
    // Tick every second using local computer real time
    const tick = () => setClock(new Date());
    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, []);

  const time12 = clock.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const time24 = clock.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateFormatted = clock.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <VaanamLogo size={40} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
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

      {/* Local System Clock */}
      <div className="sidebar-clock">
        <div className="sidebar-clock-label">Local System Clock</div>
        <div
          className="sidebar-clock-time"
          style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-teal)', letterSpacing: '0.5px' }}
        >
          {time12}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'monospace' }}>
          {time24} (24h)
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
          {dateFormatted}
        </div>
        <div className="sidebar-clock-status sim-running" style={{ marginTop: 6 }}>
          ● Live Synchronized
        </div>
      </div>

      {/* Staff User Profile & Logout */}
      {user && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {user.avatarIcon || '👨‍✈️'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent-teal)', fontFamily: 'monospace' }}>
                {user.badgeId} · {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              padding: '6px 10px',
              fontSize: 11,
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontWeight: 600,
            }}
          >
            🔒 Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
