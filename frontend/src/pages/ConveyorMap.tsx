import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api/client';
import type { ConveyorNodeDto, ConveyorSegmentDto, NodeType } from '../types';

const NODE_COLORS: Record<NodeType, string> = {
  CHECKIN:  '#1e90ff',
  JUNCTION: '#9c27b0',
  SECURITY: '#ff6d00',
  TRANSFER: '#00bcd4',
  BAY:      '#00c851',
  SORTING:  '#ffbb00',
};

const NODE_RADIUS = 18;
const SVG_W = 900;
const SVG_H = 600;
const PAD   = 40;

function scalePos(
  val: number, min: number, max: number, outMin: number, outMax: number
): number {
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((val - min) / (max - min)) * (outMax - outMin);
}

interface Tooltip {
  x: number;
  y: number;
  text: string;
}

export default function ConveyorMap() {
  const [nodes, setNodes]       = useState<ConveyorNodeDto[]>([]);
  const [segments, setSegments] = useState<ConveyorSegmentDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tooltip, setTooltip]   = useState<Tooltip | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const svgRef = useRef<SVGSVGElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [n, s] = await Promise.all([api.getAllNodes(), api.getAllSegments()]);
      setNodes(n as ConveyorNodeDto[]);
      setSegments(s as ConveyorSegmentDto[]);
      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load conveyor network. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 20000);
    return () => clearInterval(id);
  }, [loadData]);

  const handleToggleSegment = async (seg: ConveyorSegmentDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(seg.segmentId);
    try {
      await api.toggleSegment(seg.segmentId);
      await loadData();
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  };

  // Compute scaled positions
  const xs = nodes.map(n => n.xPos);
  const ys = nodes.map(n => n.yPos);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);

  const nodeMap = new Map<string, ConveyorNodeDto>(nodes.map(n => [n.nodeId, n]));

  const scaledPos = (n: ConveyorNodeDto) => ({
    x: scalePos(n.xPos, minX, maxX, PAD + NODE_RADIUS, SVG_W - PAD - NODE_RADIUS),
    y: scalePos(n.yPos, minY, maxY, PAD + NODE_RADIUS, SVG_H - PAD - NODE_RADIUS),
  });

  const posMap = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => posMap.set(n.nodeId, scaledPos(n)));

  const handleSegmentHover = (seg: ConveyorSegmentDto, e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fromId = seg.sourceNode || seg.fromNodeId || '';
    const toId = seg.destinationNode || seg.toNodeId || '';
    const fromNode = nodeMap.get(fromId);
    const toNode   = nodeMap.get(toId);
    const fromName = fromNode?.nodeName || fromNode?.name || fromId;
    const toName = toNode?.nodeName || toNode?.name || toId;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      text: `${seg.segmentId}: ${fromName} → ${toName} · ${seg.travelTimeSeconds}s · ${seg.available ? 'Available' : 'OFFLINE'} · Click to toggle`,
    });
  };

  const nodeTypes = Array.from(new Set(nodes.map(n => n.nodeType || n.type || 'JUNCTION')));

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Loading conveyor network…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🛤️ Conveyor Network Map</div>
          <div className="page-subtitle">{nodes.length} nodes · {segments.length} segments · Click a segment to toggle</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="refresh-indicator">
            <div className="refresh-dot" />
            <span>Auto-refresh 20s · {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="stat-card green" style={{ flex: '1 1 120px', padding: '12px 16px' }}>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {segments.filter(s => s.available).length}
          </div>
          <div className="stat-label">🟢 Online</div>
        </div>
        <div className="stat-card red" style={{ flex: '1 1 120px', padding: '12px 16px' }}>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {segments.filter(s => !s.available).length}
          </div>
          <div className="stat-label">🔴 Offline</div>
        </div>
        <div className="stat-card blue" style={{ flex: '1 1 120px', padding: '12px 16px' }}>
          <div className="stat-value" style={{ fontSize: 22 }}>{nodes.length}</div>
          <div className="stat-label">🔵 Nodes</div>
        </div>
        {toggling && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-amber)', fontSize: 13 }}>
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Toggling {toggling}…
          </div>
        )}
      </div>

      <div className="map-container">
        <div style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="map-svg"
            style={{ cursor: 'default', minHeight: 400 }}
            onMouseLeave={() => setTooltip(null)}
          >
            <defs>
              <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--accent-green)" />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--accent-red)" />
              </marker>
              <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#555" />
              </marker>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`hg-${i}`}
                x1={PAD} y1={PAD + ((SVG_H - 2 * PAD) / 5) * i}
                x2={SVG_W - PAD} y2={PAD + ((SVG_H - 2 * PAD) / 5) * i}
                stroke="rgba(30,58,95,0.4)" strokeWidth="1"
              />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`vg-${i}`}
                x1={PAD + ((SVG_W - 2 * PAD) / 8) * i} y1={PAD}
                x2={PAD + ((SVG_W - 2 * PAD) / 8) * i} y2={SVG_H - PAD}
                stroke="rgba(30,58,95,0.4)" strokeWidth="1"
              />
            ))}

            {/* Segments */}
            {segments.map(seg => {
              const fromId = seg.sourceNode || seg.fromNodeId || '';
              const toId   = seg.destinationNode || seg.toNodeId || '';
              const from = posMap.get(fromId);
              const to   = posMap.get(toId);
              if (!from || !to) return null;

              const color  = seg.available ? '#00c851' : '#ff4444';
              const marker = seg.available ? 'url(#arrow-green)' : 'url(#arrow-red)';
              const midX   = (from.x + to.x) / 2;
              const midY   = (from.y + to.y) / 2;

              return (
                <g key={seg.segmentId}>
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x}   y2={to.y}
                    stroke="rgba(0,0,0,0)"
                    strokeWidth={18}
                    style={{ cursor: 'pointer' }}
                    onClick={e => handleToggleSegment(seg, e)}
                    onMouseMove={e => handleSegmentHover(seg, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x}   y2={to.y}
                    stroke={color}
                    strokeWidth={seg.available ? 2.5 : 2}
                    strokeDasharray={seg.available ? undefined : '6,4'}
                    markerEnd={marker}
                    opacity={toggling === seg.segmentId ? 0.4 : 1}
                    style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                    onClick={e => handleToggleSegment(seg, e)}
                    onMouseMove={e => handleSegmentHover(seg, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {/* Travel time label */}
                  <text
                    x={midX} y={midY - 5}
                    textAnchor="middle"
                    fill="rgba(120,160,210,0.7)"
                    fontSize="9"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {seg.travelTimeSeconds}s
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = posMap.get(node.nodeId);
              if (!pos) return null;
              const color = NODE_COLORS[node.nodeType || node.type || 'JUNCTION'] ?? '#888';
              const displayName = node.nodeName || node.name || node.nodeId;

              return (
                <g key={node.nodeId} style={{ cursor: 'default' }}>
                  {/* Shadow */}
                  <circle cx={pos.x + 2} cy={pos.y + 2} r={NODE_RADIUS} fill="rgba(0,0,0,0.4)" />
                  {/* Body */}
                  <circle
                    cx={pos.x} cy={pos.y} r={NODE_RADIUS}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={2.5}
                  />
                  {/* Node ID label inside */}
                  <text
                    x={pos.x} y={pos.y + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize="9"
                    fontWeight="700"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.nodeId}
                  </text>
                  {/* Name label below */}
                  <text
                    x={pos.x} y={pos.y + NODE_RADIUS + 12}
                    textAnchor="middle"
                    fill="rgba(200,220,255,0.85)"
                    fontSize="9"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {displayName.length > 14 ? displayName.slice(0, 14) + '…' : displayName}
                  </text>
                </g>
              );
            })}

            {/* Tooltip */}
            {tooltip && (
              <g>
                <rect
                  x={Math.min(tooltip.x + 8, SVG_W - 280)}
                  y={tooltip.y - 20}
                  width={Math.min(tooltip.text.length * 6, 280)}
                  height={26}
                  rx={4}
                  fill="rgba(10,22,40,0.95)"
                  stroke="rgba(30,144,255,0.4)"
                  strokeWidth={1}
                />
                <text
                  x={Math.min(tooltip.x + 14, SVG_W - 274)}
                  y={tooltip.y - 2}
                  fill="var(--text-primary)"
                  fontSize="10"
                  style={{ pointerEvents: 'none' }}
                >
                  {tooltip.text.length > 46 ? tooltip.text.slice(0, 46) + '…' : tooltip.text}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginRight: 8 }}>Nodes:</div>
          {nodeTypes.map(t => (
            <div key={t} className="legend-item">
              <div className="legend-circle" style={{ background: NODE_COLORS[t] ?? '#888' }} />
              {t}
            </div>
          ))}
          <div style={{ marginLeft: 16, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginRight: 8 }}>Segments:</div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: 'var(--accent-green)' }} />
            Available
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: 'var(--accent-red)', backgroundImage: 'repeating-linear-gradient(90deg, var(--accent-red) 0 4px, transparent 4px 8px)' }} />
            Offline
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
            Click segment to toggle · Hover for details
          </div>
        </div>
      </div>

      {/* Segment list */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">🔧 Segment Status</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Segment</th>
                <th>From</th>
                <th>To</th>
                <th>Travel Time</th>
                <th>Distance</th>
                <th>Bidirectional</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => {
                const src = seg.sourceNode || seg.fromNodeId || '';
                const dst = seg.destinationNode || seg.toNodeId || '';
                const srcNode = nodeMap.get(src);
                const dstNode = nodeMap.get(dst);
                return (
                  <tr key={seg.segmentId} style={{ cursor: 'default' }}>
                    <td className="td-mono">{seg.segmentId}</td>
                    <td>{srcNode?.nodeName || srcNode?.name || src}</td>
                    <td>{dstNode?.nodeName || dstNode?.name || dst}</td>
                    <td>{seg.travelTimeSeconds}s</td>
                    <td>{seg.distanceMeters ? `${seg.distanceMeters}m` : '—'}</td>
                    <td style={{ color: seg.bidirectional ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {seg.bidirectional ? '⇄ Yes' : '→ Directed'}
                    </td>
                  <td>
                    <span className={`badge ${seg.available ? 'badge-READY' : 'badge-MISSED_CUTOFF'}`}>
                      {seg.available ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${seg.available ? 'btn-danger' : 'btn-success'}`}
                      disabled={toggling === seg.segmentId}
                      onClick={e => handleToggleSegment(seg, e)}
                    >
                      {toggling === seg.segmentId ? '…' : seg.available ? 'Take Offline' : 'Bring Online'}
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
