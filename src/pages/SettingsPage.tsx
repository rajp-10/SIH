import React, { useState } from 'react';
import { Settings, RefreshCw, AlertTriangle, Check, Save } from 'lucide-react';
import { useStore } from '../context/Store';
import { can } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { StatusIsland, type IslandMessage } from '../components/21st/StatusIsland';

export function SettingsPage() {
  const store = useStore();

  // Route Guard: System Administrator only
  if (!can(store.role, 'canConfigureSettings')) {
    return (
      <AccessDenied
        requiredPermission="canConfigureSettings"
        message="Only System Administrators are permitted to manage system configuration and data reset controls."
      />
    );
  }

  const [thresholdInput, setThresholdInput] = useState(store.thresholds.join(', '));
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<IslandMessage | null>(null);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = thresholdInput
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => Number.isInteger(n) && n > 0)
      .sort((a, b) => b - a);

    if (!parsed.length) {
      alert('Please enter at least one valid whole number of days (e.g., 90, 60, 30, 7).');
      return;
    }

    store.setThresholds(parsed);
    setThresholdInput(parsed.join(', '));
    setStatusMsg({
      id: 'msg-' + Date.now(),
      title: 'Reminder Thresholds Updated',
      detail: `Configured to: [${parsed.join(', ')}] days.`,
      status: 'done'
    });
  };

  const handleConfirmReset = () => {
    store.reset();
    setResetModalOpen(false);
    setResetReason('');
    setThresholdInput('90, 60, 30, 7');
    setStatusMsg({
      id: 'msg-' + Date.now(),
      title: 'Demo Environment Reset',
      detail: 'Restored original demonstration records and cleared browser cache.',
      status: 'done'
    });
  };

  return (
    <div className="content" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <StatusIsland message={statusMsg} onDismiss={() => setStatusMsg(null)} />

      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Configuration</div>
          <h1>System Settings & Maintenance</h1>
          <p>
            Configure operational reminder thresholds, review automated rules, and manage demonstration state.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Maturity Thresholds */}
        <section className="panel">
          <div className="panel-head">
            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Maturity Reminder Rules</h2>
            <span className="status info">Automated Scheduling</span>
          </div>

          <form onSubmit={handleSaveThresholds}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Specify the days before maturity when automated alert warnings should trigger for institutional users and reviewing officials.
            </p>

            <div className="field" style={{ marginBottom: '18px' }}>
              <label>Reminder Intervals (Days before maturity, separated by commas)</label>
              <input
                type="text"
                value={thresholdInput}
                onChange={e => setThresholdInput(e.target.value)}
                placeholder="e.g. 90, 60, 30, 7"
              />
              <small className="muted tiny">
                Currently configured: <strong>{store.thresholds.join('d, ')}d</strong>.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} /> Save Threshold Rules
            </button>
          </form>
        </section>

        {/* Demo Data Management */}
        <section className="panel">
          <div className="panel-head">
            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Demonstration Environment</h2>
            <span className="status warning">Prototype State</span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Reset all modified FDR records, new submissions, workflow requests, and audit entries back to the clean initial seed state.
          </p>

          <div className="alert error" style={{ marginBottom: '18px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Irreversible Action:</strong> Resetting clears localStorage key <code>fdr-guardian-demo-v1</code>.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setResetModalOpen(true)}
            style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} /> Reset All Demo Data to Seed Records
          </button>
        </section>
      </div>

      {resetModalOpen && (
        <ConfirmationDialog
          title="Reset All Demo Data?"
          description="This action will restore the original fictional records, wipe all local demo submissions, and restore default reminder thresholds. This action cannot be undone."
          reason={resetReason}
          setReason={setResetReason}
          onCancel={() => {
            setResetModalOpen(false);
            setResetReason('');
          }}
          onConfirm={handleConfirmReset}
          requiredReason={false}
          confirmLabel="Reset Everything"
          variant="danger"
          useSlideConfirm={true}
        />
      )}
    </div>
  );
}
export default SettingsPage;
