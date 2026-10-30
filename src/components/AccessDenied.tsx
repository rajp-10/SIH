import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/Store';

export interface AccessDeniedProps {
  requiredPermission?: string;
  message?: string;
}

export function AccessDenied({ requiredPermission, message }: AccessDeniedProps) {
  const store = useStore();

  return (
    <div className="content" style={{ maxWidth: '680px', margin: '40px auto' }}>
      <div
        className="panel"
        style={{
          textAlign: 'center',
          padding: '48px 32px',
          borderTop: '4px solid var(--color-danger)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <LockKeyhole size={32} />
        </div>

        <h2 style={{ margin: '0 0 10px', fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}>
          Access Restricted by Role Policy
        </h2>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-md)', margin: '0 0 24px' }}>
          {message || `Your current active role (${store.role}) does not have permission to access this page or trigger this action.`}
        </p>

        {requiredPermission && (
          <div
            style={{
              display: 'inline-block',
              background: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              marginBottom: '28px'
            }}
          >
            Required Policy Permission: <strong>{requiredPermission}</strong>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/app/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
          <Link to="/app/users" className="btn btn-secondary">
            Switch Demo Role
          </Link>
        </div>

        <p style={{ marginTop: '28px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          In production deployments, role-based access control is enforced cryptographically and server-side by backend authorization services.
        </p>
      </div>
    </div>
  );
}
export default AccessDenied;
