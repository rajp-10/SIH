/**
 * 21st.dev Component: Status Island
 * @author @dorianbaffier (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/status-island
 * @adapted For FDR Guardian workflow task feedback and action notifications
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldCheck, ArrowRight } from 'lucide-react';

export type TaskStatus = 'running' | 'done' | 'error';

export interface IslandMessage {
  id: string;
  title: string;
  detail?: string;
  status: TaskStatus;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface StatusIslandProps {
  message: IslandMessage | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function StatusIsland({
  message,
  onDismiss,
  autoDismissMs = 4500
}: StatusIslandProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, autoDismissMs]);

  if (!message) return null;

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 size={18} color="var(--color-success)" />;
      case 'error':
        return <AlertTriangle size={18} color="var(--color-danger)" />;
      default:
        return <Info size={18} color="var(--color-accent)" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1050,
        maxWidth: '420px',
        minWidth: '300px',
        animation: 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          background: 'var(--color-primary)',
          color: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div style={{ flexShrink: 0 }}>
          {getStatusIcon(message.status)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {message.title}
          </div>
          {message.detail && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', opacity: 0.9 }}>
              {message.detail}
            </div>
          )}
        </div>
        {message.action && (
          <button
            type="button"
            onClick={message.action.onClick}
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-primary)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            {message.action.label} <ArrowRight size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss status notification"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-secondary)',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.75
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
export default StatusIsland;
