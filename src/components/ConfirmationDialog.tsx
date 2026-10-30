import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { SlideToConfirm } from './21st/SlideToConfirm';

export interface ConfirmationDialogProps {
  title: string;
  description: string;
  reason: string;
  setReason: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  requiredReason?: boolean;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  variant?: 'primary' | 'danger' | 'success';
  useSlideConfirm?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  reason,
  setReason,
  onCancel,
  onConfirm,
  requiredReason = true,
  reasonPlaceholder = 'Enter an official reason or audit finding...',
  confirmLabel = 'Confirm Action',
  variant = 'primary',
  useSlideConfirm = false
}: ConfirmationDialogProps) {
  const isConfirmDisabled = requiredReason && !reason.trim();

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        style={{
          width: 'min(540px, 92vw)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {variant === 'danger' ? (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
            ) : variant === 'success' ? (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={20} />
              </div>
            ) : null}
            <h2 id="dialog-title" style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 20px', color: 'var(--color-text-muted)', fontSize: 'var(--text-md)', lineHeight: 1.5 }}>
          {description}
        </p>

        <div className="field" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            Decision Reason / Scrutiny Observation {requiredReason ? <span style={{ color: 'var(--color-danger)' }}>*</span> : '(optional)'}
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          {requiredReason && !reason.trim() && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
              A concise decision reason is mandatory for regulatory audit compliance.
            </span>
          )}
        </div>

        {useSlideConfirm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <SlideToConfirm
              label={`Slide to ${confirmLabel}`}
              confirmedLabel="Action Confirmed"
              onConfirm={onConfirm}
              disabled={isConfirmDisabled}
              variant={variant}
            />
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              disabled={isConfirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
export default ConfirmationDialog;
