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
  const [recentRoutes, setRecentRoutes] = useState<RouteResponseDto[]>([]);

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
      setRecentRoutes(prev => [res, ...prev.slice(0, 4)]);
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
          <div className="page-title">🗺️ Dijkstra Route Calculator</div>
          <div className="page-subtitle">Calculate optimal shortest-path conveyor routing in real-time</div>
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Routing Parameters</span>
          </div>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Start Checkpoint / Node
              </label>
              <select
                className="select-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: '#132238', color: '#fff', border: '1px solid #1e3a5f' }}
                value={startNode}
                onChange={e => setStartNode(e.target.value)}
              >
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    {n.nodeId} — {n.name || n.nodeId} ({n.type || 'NODE'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Destination Loading Bay / Node
              </label>
              <select
                className="select-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: '#132238', color: '#fff', border: '1px solid #1e3a5f' }}
                value={destNode}
                onChange={e => setDestNode(e.target.value)}
              >
                {nodes.map(n => (
                  <option key={n.nodeId} value={n.nodeId}>
                    {n.nodeId} — {n.name || n.nodeId} ({n.type || 'NODE'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || startNode === destNode}
              style={{
                marginTop: 8,
                padding: '12px 20px',
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Calculating Path…' : 'Compute Optimal Route (Dijkstra)'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Routing Outcome</span>
          </div>
          {routeResult ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span className={`badge badge-${routeResult.success ? 'READY' : 'UNREACHABLE'}`}>
                  {routeResult.success ? 'OPTIMAL ROUTE FOUND' : 'UNREACHABLE'}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  Total Travel Time: <strong style={{ color: 'var(--accent-teal)' }}>{routeResult.totalTravelTimeSeconds}s</strong>
                </span>
              </div>

              {routeResult.message && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  {routeResult.message}
                </div>
              )}

              {((routeResult.nodeSequence && routeResult.nodeSequence.length > 0) || (routeResult.path && routeResult.path.length > 0)) && (
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Conveyor Node Sequence ({(routeResult.nodeSequence || routeResult.path || []).length} hops)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    {(routeResult.nodeSequence || routeResult.path || []).map((node, idx, arr) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '6px 12px',
                          background: '#1b2f4a',
                          border: '1px solid #2a4d7a',
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#64b5f6'
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
            <div className="empty-state">Select start and destination nodes to calculate shortest path.</div>
          )}
        </div>
      </div>

      {recentRoutes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Calculations</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Time (s)</th>
                  <th>Status</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody>
                {recentRoutes.map((r, i) => (
                  <tr key={i}>
                    <td className="td-mono">{r.startNode}</td>
                    <td className="td-mono">{r.destinationNode}</td>
                    <td>{r.totalTravelTimeSeconds}s</td>
                    <td>
                      <span className={`badge badge-${r.success ? 'READY' : 'UNREACHABLE'}`}>
                        {r.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {r.path?.join(' ➔ ') || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
