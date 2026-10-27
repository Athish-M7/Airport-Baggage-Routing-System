import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { BaggageDto } from '../types';
import VaanamLogo from '../components/VaanamLogo';

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return iso; }
}

export default function PassengerTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bagIdParam = searchParams.get('id') || 'BAG-1001';

  const [searchId, setSearchId] = useState(bagIdParam);
  const [bag, setBag]           = useState<BaggageDto | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchBag = useCallback(async (id: string) => {
    if (!id.trim()) return;
    try {
      const data = await api.getBaggageById(id.trim().toUpperCase());
      setBag(data);
      setError(null);
      setLastSync(new Date());
    } catch {
      setBag(null);
      setError(`Luggage Tag '${id}' not found. Please verify the tag ID.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bagIdParam) {
      setSearchId(bagIdParam);
      fetchBag(bagIdParam);
    }
  }, [bagIdParam, fetchBag]);

  // Live polling every 3 seconds for real-time tracking updates
  useEffect(() => {
    if (!bagIdParam) return;
    const interval = setInterval(() => {
      fetchBag(bagIdParam);
    }, 3000);
    return () => clearInterval(interval);
  }, [bagIdParam, fetchBag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearchParams({ id: searchId.trim().toUpperCase() });
  };

  // Determine stage (1 to 4)
  const getStage = (status: string | undefined): number => {
    switch (status) {
      case 'AWAITING_CLEARANCE': return 1;
      case 'READY':              return 2;
      case 'IN_TRANSIT':         return 2;
      case 'AT_RISK':            return 2;
      case 'LOADED':             return 4;
      default:                   return 2;
    }
  };

  const currentStage = getStage(bag?.baggageProcessingStatus);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px 40px' }}>
      {/* Top Brand Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <VaanamLogo size={36} />
        <Link to="/baggage" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
          ➔ Operator Portal
        </Link>
      </div>

      {/* Bag Tag Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Bag Tag (e.g. BAG-1001)..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', fontSize: 14 }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
          🔍 Track
        </button>
      </form>

      {error && <div className="error-box">⚠️ {error}</div>}

      {loading && !bag ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Locating your luggage in Vaanam Airport system…</span>
        </div>
      ) : bag ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Passenger Boarding Pass / Bag Tag Card */}
          <div
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 16,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
            }}
          >
            {/* Tag Header */}
            <div
              style={{
                background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.9 }}>
                  Vaanam International Airport
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>
                  DIGITAL PASSENGER BAGGAGE TAG
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {bag.passengerCategory || 'ECONOMY'}
                </span>
              </div>
            </div>

            {/* Tag Body Details */}
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Flight Number
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
                    {bag.flightNumber || bag.assignedFlightId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Assigned Gate / Bay
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                    {bag.destinationBayId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Luggage Tag ID
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>
                    {bag.baggageId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Loading Cutoff Deadline
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-amber)' }}>
                    {fmtTime(bag.loadingCutoff)}
                  </div>
                </div>
              </div>

              {/* Barcode Graphic Representation */}
              <div
                style={{
                  background: '#fff',
                  padding: '10px 16px',
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {/* CSS Barcode pattern */}
                <div
                  style={{
                    height: 38,
                    width: '100%',
                    background: 'repeating-linear-gradient(90deg, #000 0, #000 3px, #fff 3px, #fff 6px, #000 6px, #000 8px, #fff 8px, #fff 11px, #000 11px, #000 15px, #fff 15px, #fff 18px)',
                  }}
                />
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#000', fontWeight: 700 }}>
                  * {bag.baggageId} *
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Tracking Status Banner */}
          <div
            className="card"
            style={{
              borderColor: bag.baggageProcessingStatus === 'LOADED' ? 'var(--accent-green)' : 'var(--accent-blue)',
              background: bag.baggageProcessingStatus === 'LOADED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 189, 248, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>
                {bag.baggageProcessingStatus === 'LOADED' ? '🎉' : '🚚'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {bag.baggageProcessingStatus === 'LOADED'
                    ? 'Your luggage is loaded onto the aircraft!'
                    : 'Luggage in transit through airport conveyor system'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Current Station: <strong style={{ color: '#38bdf8' }}>{bag.currentLocation}</strong> · Remaining Transit Time: <strong style={{ color: 'var(--accent-teal)' }}>{bag.estimatedRemainingTravelTime}s</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stage Visual Progress Stepper */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📍 Live Journey Progress</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Auto-syncs every 3s · {lastSync.toLocaleTimeString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
              {/* Step 1: Check-in */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>1. Checked In at Terminal</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Bag accepted at check-in station ({bag.currentLocation.startsWith('CHK') ? bag.currentLocation : 'CHK-1'})
                  </div>
                </div>
              </div>

              {/* Step 2: Automated Conveyor Transit */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: currentStage >= 2 ? 'var(--accent-blue)' : 'var(--border-color)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {currentStage >= 4 ? '✓' : '2'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>2. High-Speed Conveyor Transit</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Routing via optimal Dijkstra path: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{bag.plannedRoute || 'En route'}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Security & X-Ray Screening */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: bag.operatorClearance ? 'var(--accent-green)' : 'var(--accent-amber)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {bag.operatorClearance ? '✓' : '3'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>3. Aviation Security Screening</div>
                  <div style={{ fontSize: 12, color: bag.operatorClearance ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                    {bag.operatorClearance ? 'Security X-ray clearance approved ✓' : 'Awaiting inspection pass'}
                  </div>
                </div>
              </div>

              {/* Step 4: Loading onto Aircraft */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: currentStage >= 4 ? 'var(--accent-green)' : 'var(--border-color)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {currentStage >= 4 ? '✓' : '4'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>4. Loaded onto Aircraft Cargo</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Delivered to Loading Pier {bag.destinationBayId} for flight {bag.flightNumber || bag.assignedFlightId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
