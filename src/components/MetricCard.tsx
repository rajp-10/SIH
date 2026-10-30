import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  note: string;
  icon?: React.ReactNode;
  accent?: boolean;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  note,
  icon,
  accent = false,
  tone = 'default',
  onClick
}: MetricCardProps) {
  const getToneClass = () => {
    if (accent) return 'accent';
    if (tone === 'warning') return 'warning';
    if (tone === 'danger') return 'danger';
    if (tone === 'success') return 'success';
    if (tone === 'info') return 'info';
    return '';
  };

  const getValueColor = () => {
    if (tone === 'warning') return 'var(--color-warning-text)';
    if (tone === 'danger') return 'var(--color-danger-text)';
    if (tone === 'success') return 'var(--color-success-text)';
    return 'var(--color-heading)';
  };

  return (
    <div
      className={`metric ${getToneClass()}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 650, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {icon && (
          <div style={{ color: 'var(--color-secondary)', opacity: 0.85 }}>
            {icon}
          </div>
        )}
      </div>

      <strong style={{ fontSize: '20px', fontWeight: 750, color: getValueColor(), lineHeight: 1.15, margin: '2px 0' }}>
        {value}
      </strong>

      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
        {note}
      </span>
    </div>
  );
}
export default MetricCard;
