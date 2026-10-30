import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Check,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useStore } from '../context/Store';
import { visibleInstruments } from '../utils/logic';
import type { Notice } from '../types';

export function NotificationsPage() {
  const store = useStore();
  const [filterMode, setFilterMode] = useState<'All' | 'Unread'>('All');

  // Filter notifications relevant to permitted instruments or global
  const permittedInstIds = new Set(visibleInstruments(store).map(i => i.id));
  const relevantNotifications = store.notifications.filter(
    n => !n.instrumentId || permittedInstIds.has(n.instrumentId)
  );

  const displayedNotifications = relevantNotifications.filter(
    n => (filterMode === 'Unread' ? !n.read : true)
  );

  const unreadCount = relevantNotifications.filter(n => !n.read).length;

  const getSeverityIcon = (sev: Notice['severity']) => {
    switch (sev) {
      case 'error':
        return <AlertTriangle size={20} color="var(--color-danger)" />;
      case 'warning':
        return <Clock3 size={20} color="var(--color-warning)" />;
      case 'success':
        return <CheckCircle2 size={20} color="var(--color-success)" />;
      default:
        return <Bell size={20} color="var(--color-primary)" />;
    }
  };

  return (
    <div className="content" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Workspace</div>
          <h1>Notification Center</h1>
          <p>
            Maturity alerts, scrutiny notes, discrepancy notifications, and workflow authorizations in your permitted scope.
          </p>
        </div>

        <div className="inline-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => store.markAllRead()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={15} /> Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${filterMode === 'All' ? 'btn-primary' : 'btn-secondary'} btn-small`}
              onClick={() => setFilterMode('All')}
            >
              All Notifications ({relevantNotifications.length})
            </button>
            <button
              type="button"
              className={`btn ${filterMode === 'Unread' ? 'btn-primary' : 'btn-secondary'} btn-small`}
              onClick={() => setFilterMode('Unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <span className="muted tiny">{store.role} View</span>
        </div>

        {displayedNotifications.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedNotifications.map(notice => (
              <div
                key={notice.id}
                className={`notice ${!notice.read ? 'unread' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: !notice.read ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  border: `1px solid ${!notice.read ? 'var(--color-border)' : 'var(--color-border-subtle)'}`
                }}
              >
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {getSeverityIcon(notice.severity)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                        {notice.title}
                      </strong>
                      {!notice.read && <span className="status warning">Unread</span>}
                    </div>
                    <span className="muted tiny">
                      {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p style={{ margin: '6px 0 10px', fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.5 }}>
                    {notice.description}
                  </p>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {notice.instrumentId && (
                      <Link
                        to={`/app/fdr/${notice.instrumentId}`}
                        className="table-link tiny"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        Inspect {notice.instrumentId} <ExternalLink size={12} />
                      </Link>
                    )}
                    {!notice.read && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => store.markRead(notice.id)}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <Bell size={28} color="var(--color-text-muted)" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-md)', color: 'var(--color-primary)' }}>
              {filterMode === 'Unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Notifications generated by workflow events will appear here in real-time.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
export default NotificationsPage;
