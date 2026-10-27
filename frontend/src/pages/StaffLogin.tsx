import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VaanamLogo from '../components/VaanamLogo';

export default function StaffLogin() {
  const { login, quickLogin, registerStaff, allStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If path is /register or query param ?tab=register, default to registration tab
  const isRegisterRoute = location.pathname === '/register' || location.search.includes('tab=register');
  const [tab, setTab] = useState<'login' | 'register'>(isRegisterRoute ? 'register' : 'login');

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // New Staff Registration State
  const [regName, setRegName]             = useState('');
  const [regBadgeId, setRegBadgeId]       = useState('OPS-' + Math.floor(100 + Math.random() * 900));
  const [regDepartment, setRegDepartment] = useState('Baggage Operations Center');
  const [regRole, setRegRole]             = useState('Routing System Controller');
  const [regAvatar, setRegAvatar]         = useState('👨‍✈️');
  const [regPassword, setRegPassword]     = useState('');
  const [regError, setRegError]           = useState<string | null>(null);
  const [regSuccess, setRegSuccess]       = useState(false);

  // Return to page user originally tried to access, or dashboard
  const destination = (location.state as any)?.from?.pathname || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setLoginError('Please enter your Staff Badge ID or Username.');
      return;
    }

    const success = login(identifier.trim(), password);
    if (success) {
      navigate(destination, { replace: true });
    } else {
      setLoginError('Invalid credentials. Please verify your badge number or click a demo profile below.');
    }
  };

  const handleQuickLogin = (badgeOrUsername: string) => {
    quickLogin(badgeOrUsername);
    navigate(destination, { replace: true });
  };

  const handleGenerateBadge = () => {
    const prefixes = ['OPS', 'SEC', 'BAY', 'TRM'];
    const randPre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    setRegBadgeId(`${randPre}-${randNum}`);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Please enter the Staff Member full name.');
      return;
    }
    if (!regBadgeId.trim()) {
      setRegError('Please provide a valid Airport Staff Badge ID.');
      return;
    }

    setRegError(null);
    try {
      registerStaff({
        name: regName,
        badgeId: regBadgeId,
        department: regDepartment,
        role: regRole,
        avatarIcon: regAvatar,
        password: regPassword || 'vaanam2026',
      });
      setRegSuccess(true);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 1000);
    } catch (err: any) {
      setRegError(err.message || 'Failed to register staff account.');
    }
  };

  const avatarOptions = ['👨‍✈️', '👩‍✈️', '🛡️', '🛂', '🏗️', '🧳', '⚙️', '🧑‍💼'];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0a0f1d 100%)',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '32px 28px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-block', marginBottom: 10 }}>
            <VaanamLogo size={48} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent-teal)', fontWeight: 700 }}>
            Restricted Airside Terminal
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '4px 0 4px' }}>
            Airport Staff Operations Center
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Sign in with an existing badge or register a new airport staff profile.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register New Staff */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 10,
            padding: 4,
            marginBottom: 20,
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'login' ? 'var(--accent-blue)' : 'transparent',
              color: tab === 'login' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            🔑 Staff Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'register' ? 'var(--accent-teal)' : 'transparent',
              color: tab === 'register' ? '#0f172a' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            📝 Register New Staff
          </button>
        </div>

        {/* ===================== TAB 1: SIGN IN ===================== */}
        {tab === 'login' && (
          <div>
            {loginError && (
              <div className="error-box" style={{ marginBottom: 16 }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                  Staff Badge ID / Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. OPS-742, SEC-310 or username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setLoginError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    borderRadius: 8,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                  }}
                />
              </div>

              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Security Access PIN
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Any PIN for demo</span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    borderRadius: 8,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '11px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  width: '100%',
                  marginTop: 4,
                }}
              >
                🔐 Sign In to Operations Terminal
              </button>
            </form>

            {/* Quick-Login Preset Buttons */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 10, fontWeight: 600 }}>
                ⚡ 1-Click Demo Staff Profiles
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 180, overflowY: 'auto' }}>
                {allStaff.map((staff) => (
                  <button
                    key={staff.username}
                    type="button"
                    onClick={() => handleQuickLogin(staff.badgeId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-blue)';
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{staff.avatarIcon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {staff.name} {staff.isCustom && <span style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600 }}>[New]</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {staff.role} · <span style={{ fontFamily: 'monospace', color: 'var(--accent-teal)' }}>{staff.badgeId}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600 }}>
                      Select ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: REGISTER NEW STAFF ===================== */}
        {tab === 'register' && (
          <div>
            {regSuccess ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--accent-green)',
                  borderRadius: 12,
                  color: 'var(--accent-green)',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Welcome, {regName}!</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 4 }}>
                  Badge <strong>{regBadgeId}</strong> registered successfully.
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Opening Airport Terminal…
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {regError && (
                  <div className="error-box" style={{ marginBottom: 4 }}>
                    ⚠️ {regError}
                  </div>
                )}

                {/* Full Name */}
                <div className="form-field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Officer Vikram Sethupathi"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                    }}
                  />
                </div>

                {/* Badge ID with Auto-generator */}
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                      Official Badge Number *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateBadge}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-teal)',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      🎲 Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OPS-892"
                    value={regBadgeId}
                    onChange={(e) => setRegBadgeId(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: 1,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--accent-teal)',
                    }}
                  />
                </div>

                {/* Department Selection */}
                <div className="form-field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Aviation Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                    }}
                  >
                    <option value="Baggage Operations Center">Baggage Operations Center</option>
                    <option value="Aviation Security & Screening">Aviation Security & Screening</option>
                    <option value="Apron & Loading Bays">Apron & Loading Bays</option>
                    <option value="Terminal Check-In Division">Terminal Check-In Division</option>
                  </select>
                </div>

                {/* Designation / Role */}
                <div className="form-field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Staff Role / Designation
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                    }}
                  >
                    <option value="Routing System Controller">Routing System Controller</option>
                    <option value="Senior Operations Lead">Senior Operations Lead</option>
                    <option value="Aviation Security Officer">Aviation Security Officer</option>
                    <option value="Ramp & Bay Supervisor">Ramp & Bay Supervisor</option>
                    <option value="Check-In Agent">Check-In Agent</option>
                  </select>
                </div>

                {/* Avatar Icon Picker */}
                <div className="form-field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Select Staff Avatar Icon
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {avatarOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setRegAvatar(icon)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          fontSize: 18,
                          border: regAvatar === icon ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                          background: regAvatar === icon ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security PIN */}
                <div className="form-field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    Security Access PIN (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Default: vaanam2026"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '11px 18px',
                    fontSize: 14,
                    fontWeight: 700,
                    width: '100%',
                    marginTop: 6,
                    background: 'linear-gradient(90deg, #0284c7 0%, #0d9488 100%)',
                    borderColor: 'transparent',
                  }}
                >
                  📝 Onboard Staff & Enter Operations Portal
                </button>
              </form>
            )}
          </div>
        )}

        {/* Public Passenger Tracker Link */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Traveling passenger with luggage?{' '}
          <Link
            to="/track"
            style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}
          >
            Track Luggage with QR Tag 📱
          </Link>
        </div>
      </div>
    </div>
  );
}
