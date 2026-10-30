/**
 * 21st.dev Component: Smooth Drawer
 * @author @dorianbaffier (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/smooth-drawer
 * @adapted For FDR Guardian document preview, verification metadata, and scrutiny annotations
 */

import React, { useEffect } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Download, Calendar, HardDrive, User } from 'lucide-react';
import type { Doc, Instrument } from '../../types';

export interface SmoothDrawerProps {
  isOpen: boolean;
  document: Doc | null;
  instrument: Instrument | null;
  onClose: () => void;
  onAddNote?: (docId: string, note: string) => void;
}

export function SmoothDrawer({
  isOpen,
  document,
  instrument,
  onClose,
  onAddNote
}: SmoothDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '450 KB (Estimated)';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 1100, padding: 0 }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="smooth-drawer-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(520px, 92vw)',
          height: '100%',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1101,
          animation: 'slideInRight 220ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: 'var(--color-surface-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Document Preview
              </h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {instrument ? `${instrument.id} · ${instrument.institution}` : 'Instrument Document'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Document metadata card */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-md)', display: 'block' }}>{document.name}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Category: {document.category}
                </span>
              </div>
              <span
                className={`status ${
                  document.status === 'Verified'
                    ? 'success'
                    : document.status === 'Flagged'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {document.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
                <HardDrive size={14} /> File size: <strong style={{ color: 'var(--color-text)' }}>{formatFileSize(document.size)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
                <Calendar size={14} /> Uploaded: <strong style={{ color: 'var(--color-text)' }}>{document.uploadedAt || 'With submission'}</strong>
              </div>
            </div>
          </div>

          {/* Simulated File Preview Canvas / Frame */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Simulated Scanned Document View
            </span>
            <div
              style={{
                marginTop: '8px',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                background: '#FAFBFD',
                border: '1px dashed var(--color-border)',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <FileText size={44} color="var(--color-primary)" style={{ opacity: 0.6, marginBottom: '12px' }} />
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                {document.name}
              </strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '320px', margin: '6px 0 14px' }}>
                Fictional demonstration document metadata. In this prototype, file contents remain client-side and are not transmitted to external servers.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => alert(`Simulating download of ${document.name}`)}
                >
                  <Download size={13} /> Download Metadata Copy
                </button>
              </div>
            </div>
          </div>

          {/* Reviewer Scrutiny Notes */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', margin: '0 0 8px', color: 'var(--color-primary)' }}>
              Scrutiny & Reviewer Remarks
            </h4>
            {document.reviewerNote ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-warning)'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Scrutiny Observation:</div>
                {document.reviewerNote}
              </div>
            ) : (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                No scrutiny discrepancies noted on this document.
              </p>
            )}
          </div>

          {/* Instrument Context */}
          {instrument && (
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-subtle)',
                fontSize: 'var(--text-xs)'
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px' }}>Attached to Instrument</strong>
              <div>FDR Number: <strong>{instrument.fdrNumber}</strong></div>
              <div>Issuing Bank: <strong>{instrument.bank} ({instrument.branch})</strong></div>
              <div>Principal: <strong>₹{instrument.amount.toLocaleString('en-IN')}</strong></div>
              <div>Maturity Date: <strong>{instrument.maturityDate}</strong></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border-subtle)',
            background: 'var(--color-surface-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export default SmoothDrawer;
