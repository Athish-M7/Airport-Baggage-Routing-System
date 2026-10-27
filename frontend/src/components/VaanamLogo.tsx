interface VaanamLogoProps {
  size?: number;
  showText?: boolean;
}

export default function VaanamLogo({ size = 40, showText = true }: VaanamLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Aerodynamic Ascending Delta-Wing Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.35))' }}
      >
        <defs>
          {/* Wing Gradient: Cyan to Cobalt to Violet */}
          <linearGradient id="wingGradientLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="wingGradientRight" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          {/* Jet Spine Gradient */}
          <linearGradient id="fuselageGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Orbit Navigation Ring Gradient */}
          <linearGradient id="orbitRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>

          {/* Soft Glow */}
          <filter id="beaconGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Radar Grid / Conveyor Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="rgba(56, 189, 248, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Orbit Flight / Conveyor Path Trajectory */}
        <ellipse
          cx="50"
          cy="54"
          rx="44"
          ry="17"
          stroke="url(#orbitRing)"
          strokeWidth="2.5"
          transform="rotate(-22 50 54)"
          strokeDasharray="180"
          strokeDashoffset="20"
        />

        {/* Jet Thruster Exhaust Glow */}
        <ellipse
          cx="50"
          cy="68"
          rx="8"
          ry="3"
          fill="#38bdf8"
          opacity="0.85"
          filter="url(#beaconGlow)"
        />

        {/* Left Wing (The Ascending "V" of Vaanam) */}
        <path
          d="M 50,16 L 14,70 L 38,64 L 50,46 Z"
          fill="url(#wingGradientLeft)"
        />

        {/* Right Wing (Symmetric Aerodynamic Flap) */}
        <path
          d="M 50,16 L 86,70 L 62,64 L 50,46 Z"
          fill="url(#wingGradientRight)"
        />

        {/* Center Supersonic Fuselage / Spine */}
        <path
          d="M 50,14 L 46,66 L 50,62 L 54,66 Z"
          fill="url(#fuselageGradient)"
        />

        {/* Golden Navigation Radar Beacon at Apex */}
        <circle
          cx="50"
          cy="14"
          r="3.5"
          fill="#fbbf24"
          filter="url(#beaconGlow)"
        />
        <circle
          cx="50"
          cy="14"
          r="1.8"
          fill="#ffffff"
        />
      </svg>

      {/* Styled Typography for Vaanam Airport */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: 2,
                color: '#fff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Vaanam
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: 4,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                letterSpacing: 1,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              INTL
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              letterSpacing: 0.8,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            Baggage Routing Hub
          </div>
        </div>
      )}
    </div>
  );
}
