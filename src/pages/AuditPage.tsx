import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { useStore } from '../context/Store';
import { can } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';

export function AuditPage() {
  const store = useStore();

  // Route Guard: Reviewing Official, Approving Authority, Admin can view audit
  if (!can(store.role, 'canViewAuditLog')) {
    return (
      <AccessDenied
        requiredPermission="canViewAuditLog"
        message="Your active role does not have authorization to view the central regulatory audit trail."
      />
    );
  }

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredEvents = store.audit.filter(event => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      event.action.toLowerCase().includes(q) ||
      event.actor.toLowerCase().includes(q) ||
      event.entity.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      (event.reason && event.reason.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'All' || event.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  const handleExportAuditCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor Name', 'Role', 'Action', 'Target Entity', 'Description', 'Decision Reason'];
    const rows = filteredEvents.map(e => [
      e.id,
      e.timestamp,
      e.actor,
      e.role,
      e.action,
      e.entity,
      e.description,
      e.reason || ''
    ]);

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fdr-guardian-audit-trail.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content">
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Oversight</div>
          <h1>System Audit Trail</h1>
          <p>
            Chronological, immutable record of all instrument creations, scrutiny decisions, discrepancy flags, and release approvals.
          </p>
        </div>

        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportAuditCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} /> Export Audit Log CSV
          </button>
        </div>
      </div>

      <div className="panel">
        {/* Toolbar */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: '1 1 260px' }}>
            <input
              type="text"
              className="search-input"
              aria-label="Filter audit trail"
              placeholder="Filter by actor, action, entity ID, or reason..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select
            className="search-input"
            aria-label="Filter by role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="All">All Acting Roles</option>
            <option value="Institution User">Institution User</option>
            <option value="AICTE Reviewing Official">AICTE Reviewing Official</option>
            <option value="Approving Authority">Approving Authority</option>
            <option value="System Administrator">System Administrator</option>
          </select>

          <span className="status info" style={{ alignSelf: 'center' }}>
            {filteredEvents.length} Recorded Events
          </span>
        </div>

        {/* Audit Timeline */}
        <div className="timeline">
          {filteredEvents.map(event => (
            <div className="timeline-item" key={event.id}>
              <span className="timeline-dot" />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                      {event.action}
                    </strong>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--color-secondary)',
                        color: 'var(--color-primary)',
                        fontWeight: 600
                      }}
                    >
                      Entity: {event.entity}
                    </span>
                  </div>
                  <span className="muted tiny" style={{ fontFamily: 'var(--font-mono)' }}>
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>

                <p style={{ margin: '4px 0', fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.45 }}>
                  {event.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  <span>Actor: <strong>{event.actor}</strong> ({event.role})</span>
                </div>

                {event.reason && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 10px',
                      background: 'var(--color-surface-subtle)',
                      borderLeft: '3px solid var(--color-primary)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <strong>Decision Reason:</strong> {event.reason}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!filteredEvents.length && (
            <div className="empty" style={{ padding: '32px' }}>
              No audit trail events match your current filter.
            </div>
          )}
        </div>
      </div>

      <p className="footer-note">
        Client-side demonstration log. In production, audit records are written to append-only, tamper-evident write-once storage with cryptographic signing.
      </p>
    </div>
  );
}
export default AuditPage;
