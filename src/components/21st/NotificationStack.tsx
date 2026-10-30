/**
 * 21st.dev Component: Notification Stack
 * @author @dorianbaffier (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/notification-stack
 * @adapted For FDR Guardian workflow notifications and severity alerts
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Clock3, CheckCircle2, X, ExternalLink } from 'lucide-react';
import type { Notice } from '../../types';

export interface NotificationStackProps {
  notifications: Notice[];
  onMarkRead: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationStack({
  notifications,
  onMarkRead,
  onDismiss,
  className = ''
}: NotificationStackProps) {
  const navigate = useNavigate();

  if (!notifications.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
        <p style={{ margin: 0, fontWeight: 500 }}>All caught up</p>
        <span style={{ fontSize: 'var(--text-xs)' }}>No pending workflow notifications in your scope.</span>
      </div>
    );
  }

  const getIcon = (severity: Notice['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle size={18} color="var(--color-danger)" />;
      case 'warning':
        return <Clock3 size={18} color="var(--color-warning)" />;
      case 'success':
        return <CheckCircle2 size={18} color="var(--color-success)" />;
      default:
        return <Bell size={18} color="var(--color-primary)" />;
    }
  };

  const getBorderColor = (severity: Notice['severity']) => {
    switch (severity) {
      case 'error':
        return 'var(--color-danger)';
      case 'warning':
        return 'var(--color-warning)';
      case 'success':
        return 'var(--color-success)';
      default:
        return 'var(--color-border)';
    }
  };

  return (
    <div className={`notification-stack-container ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {notifications.map(notice => (
        <div
          key={notice.id}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: notice.read ? 'var(--color-surface)' : 'var(--color-primary-subtle)',
            border: `1px solid ${notice.read ? 'var(--color-border-subtle)' : getBorderColor(notice.severity)}`,
            boxShadow: notice.read ? 'none' : 'var(--shadow-xs)',
            transition: 'var(--transition-fast)'
          }}
        >
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {getIcon(notice.severity)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                {notice.title}
              </strong>
              {!notice.read && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-warning)'
                  }}
                >
                  New
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {notice.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {notice.link && (
                  <button
                    type="button"
                    onClick={() => navigate(notice.link!)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View <ExternalLink size={12} />
                  </button>
                )}
                {!notice.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notice.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)',
                      padding: 0
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(notice.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                padding: '2px',
                margin: '-4px -4px 0 0',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
export default NotificationStack;
