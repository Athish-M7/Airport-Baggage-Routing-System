import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { DatabaseStatusDto } from '../types';

export default function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatusDto | null>(null);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Table explorer state
  const [selectedTable, setSelectedTable] = useState<string>('baggage');
  const [tableData, setTableData]         = useState<Record<string, any>[]>([]);
  const [loadingTable, setLoadingTable]   = useState(false);
  const [searchTable, setSearchTable]     = useState('');

  const loadStatus = useCallback(async () => {
    try {
      const data = await api.getDatabaseStatus();
      setDbStatus(data);
    } catch {
      setDbStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTableData = useCallback(async (table: string) => {
    setLoadingTable(true);
    try {
      const rows = await api.getTableData(table, 50);
      setTableData(Array.isArray(rows) ? rows : []);
    } catch {
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 6000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  useEffect(() => {
    loadTableData(selectedTable);
  }, [selectedTable, loadTableData]);

  const handleReseed = async () => {
    if (!window.confirm('Reset database back to original demo dataset?')) return;
    setActionLoading('reseed');
    setMessage(null);
    try {
      const res = await api.reseedDatabase();
      setMessage({ type: 'success', text: res.message || 'Database reset successfully.' });
      await loadStatus();
      await loadTableData(selectedTable);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset database.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearBaggage = async () => {
    if (!window.confirm('Clear all luggage records from database?')) return;
    setActionLoading('clear');
    setMessage(null);
    try {
      const res = await api.clearBaggage();
      setMessage({ type: 'success', text: res.message || 'All baggage records cleared.' });
      await loadStatus();
      await loadTableData(selectedTable);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to clear baggage.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRows = tableData.filter((row) => {
    if (!searchTable.trim()) return true;
    const query = searchTable.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(query));
  });

  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  if (loading && !dbStatus) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Connecting to database…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">🗄️ Database Status & Explorer</div>
          <div className="page-subtitle">Inspect live relational database records and manage demo data</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {dbStatus?.connected ? (
            <span className="db-pill-connected">
              ● Connected ({dbStatus.databaseProductName} · {dbStatus.pingLatencyMs} ms)
            </span>
          ) : (
            <span className="db-pill-disconnected">
              ● Disconnected
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={loadStatus}>↻ Sync</button>
        </div>
      </div>

      {message && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            borderColor: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
            color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
            padding: '12px 16px',
          }}
        >
          {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
        </div>
      )}

      {/* Clean Table Count Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div
          className="stat-card blue"
          style={{ cursor: 'pointer', borderColor: selectedTable === 'baggage' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setSelectedTable('baggage')}
        >
          <div className="stat-value">{dbStatus?.tableCounts?.['baggage'] ?? 0}</div>
          <div className="stat-label">🧳 Baggage Records</div>
        </div>

        <div
          className="stat-card purple"
          style={{ cursor: 'pointer', borderColor: selectedTable === 'flights' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setSelectedTable('flights')}
        >
          <div className="stat-value">{dbStatus?.tableCounts?.['flights'] ?? 0}</div>
          <div className="stat-label">✈️ Scheduled Flights</div>
        </div>

        <div
          className="stat-card teal"
          style={{ cursor: 'pointer', borderColor: selectedTable === 'conveyor_segments' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setSelectedTable('conveyor_segments')}
        >
          <div className="stat-value">{dbStatus?.tableCounts?.['conveyor_segments'] ?? 0}</div>
          <div className="stat-label">🛤️ Conveyor Segments</div>
        </div>

        <div
          className="stat-card amber"
          style={{ cursor: 'pointer', borderColor: selectedTable === 'conveyor_nodes' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setSelectedTable('conveyor_nodes')}
        >
          <div className="stat-value">{dbStatus?.tableCounts?.['conveyor_nodes'] ?? 0}</div>
          <div className="stat-label">🏷️ Conveyor Checkpoints</div>
        </div>

        <div
          className="stat-card green"
          style={{ cursor: 'pointer', borderColor: selectedTable === 'airport_staff' ? 'var(--accent-blue)' : undefined }}
          onClick={() => setSelectedTable('airport_staff')}
        >
          <div className="stat-value">{dbStatus?.tableCounts?.['airport_staff'] ?? 0}</div>
          <div className="stat-label">👮 Airport Staff (Auth)</div>
        </div>
      </div>

      {/* Simple Maintenance Actions */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Database Actions</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Reset to original sample data or clear all bags to test your own check-ins.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" disabled={actionLoading !== null} onClick={handleReseed}>
              {actionLoading === 'reseed' ? 'Resetting…' : '🌱 Reset Demo Data'}
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} disabled={actionLoading !== null} onClick={handleClearBaggage}>
              {actionLoading === 'clear' ? 'Clearing…' : '🧹 Clear All Bags'}
            </button>
          </div>
        </div>
      </div>

      {/* Simple Table Data Browser */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="card-title">Viewing Table:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{ fontWeight: 600, color: 'var(--accent-blue)' }}
            >
              <option value="airport_staff">Airport Staff (Registered Personnel & Badges)</option>
              <option value="baggage">Baggage (Luggage items)</option>
              <option value="flights">Flights (Schedules)</option>
              <option value="conveyor_segments">Conveyor Segments (Belts)</option>
              <option value="conveyor_nodes">Conveyor Nodes (Checkpoints)</option>
              <option value="loading_bays">Loading Bays (Gates)</option>
              <option value="routing_records">Routing Records (Audit Logs)</option>
            </select>
          </div>

          <input
            type="search"
            placeholder="Filter loaded rows…"
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            style={{ width: 220 }}
          />
        </div>

        {loadingTable ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading rows from table '{selectedTable}'…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="empty-state">No records found in table '{selectedTable}'</div>
        ) : (
          <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} style={{ whiteSpace: 'nowrap' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c} style={{ whiteSpace: 'nowrap', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
