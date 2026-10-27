import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ConveyorNodeDto, RouteResponseDto } from '../types';

export default function RoutingCalculator() {
  const [nodes, setNodes] = useState<ConveyorNodeDto[]>([]);
  const [startNode, setStartNode] = useState<string>('CHK-1');
  const [destNode, setDestNode] = useState<string>('BAY-01');
  const [routeResult, setRouteResult] = useState<RouteResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAllNodes()
      .then((data: ConveyorNodeDto[]) => {
        setNodes(data);
        if (data.length >= 2) {
          setStartNode(data[0].nodeId);
          setDestNode(data[data.length - 1].nodeId);
        }
      })
      .catch(() => setError('Failed to load conveyor nodes'));
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startNode || !destNode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.computeRoute(startNode, destNode);
      setRouteResult(res);
    } catch {
      setError('Route calculation request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🗺️ Shortest Route Calculator</div>
          <div className="page-subtitle">Test Dijkstra's algorithm between any two conveyor checkpoints</div>
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Select Route Checkpoints</span>
          </div>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-field">
              <label>Starting Checkpoint</label>
              <select value={startNode} onChange={e => setStartNode(e.target.value)}>
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    {n.nodeId} — {n.nodeName || n.nodeId} ({n.nodeType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Destination Loading Bay</label>
              <select value={destNode} onChange={e => setDestNode(e.target.value)}>
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    {n.nodeId} — {n.nodeName || n.nodeId} ({n.nodeType})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || startNode === destNode}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Calculating…' : '⚡ Find Shortest Path'}
            </button>
          </form>
        </div>

        {/* Outcome */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Calculated Shortest Path</span>
          </div>
          {routeResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge badge-${routeResult.success ? 'READY' : 'MISSED_CUTOFF'}`}>
                  {routeResult.success ? 'OPTIMAL ROUTE FOUND' : 'UNREACHABLE'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Total Travel Time: <strong style={{ color: 'var(--accent-teal)' }}>{routeResult.totalTravelTimeSeconds}s</strong>
                </span>
              </div>

              {routeResult.message && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {routeResult.message}
                </div>
              )}

              {((routeResult.nodeSequence && routeResult.nodeSequence.length > 0) || (routeResult.path && routeResult.path.length > 0)) && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                    Step-by-Step Node Sequence:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    {(routeResult.nodeSequence || routeResult.path || []).map((node, idx, arr) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#60a5fa'
                        }}>
                          {node}
                        </span>
                        {idx < arr.length - 1 && (
                          <span style={{ color: 'var(--text-muted)' }}>➔</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              Select start and destination points on the left and click "Find Shortest Path" to test routing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
