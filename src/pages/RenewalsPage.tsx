import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Link2
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments, visibleRequests, formatMoney, formatDate } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import { StatusIsland, type IslandMessage } from '../components/21st/StatusIsland';
import type { Instrument, WorkflowRequest } from '../types';

export function RenewalsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstId = searchParams.get('instrument') || '';

  const permittedInstruments = visibleInstruments(store);
  const permittedRequests = visibleRequests(store).filter(
    r => r.kind === 'Renewal' || r.kind === 'Replacement'
  );

  const canInitiate = can(store.role, 'canRequestRenewal');
  const canReview = can(store.role, 'canReviewFdr');

  const [selectedInstId, setSelectedInstId] = useState(preselectedInstId || (permittedInstruments[0]?.id || ''));
  const [reason, setReason] = useState('');
  const [newFdrNumber, setNewFdrNumber] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMaturityDate, setNewMaturityDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<IslandMessage | null>(null);

  const selectedInstrument = permittedInstruments.find(i => i.id === selectedInstId);

  // Quick fill defaults when instrument changes
  const handleSelectInstrument = (id: string) => {
    setSelectedInstId(id);
    const inst = permittedInstruments.find(i => i.id === id);
    if (inst) {
      setNewFdrNumber(`${inst.fdrNumber}-REN`);
      setNewAmount(String(inst.amount));
    }
  };

  // Submit formal renewal workflow request
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstId || !reason.trim()) return;

    const reqId = `REN-${3000 + store.requests.length + 1}`;
    const newReq: WorkflowRequest = {
      id: reqId,
      kind: 'Renewal',
      instrumentId: selectedInstId,
      status: 'Submitted',
      reason: reason.trim(),
      actor: store.currentUser.name,
      actorRole: store.role,
      createdAt: new Date().toISOString()
    };

    store.addRequest(newReq);
    setReason('');
    setStatusMsg({
      id: 'msg-' + Date.now(),
      title: 'Renewal Request Submitted',
      detail: `${reqId} filed for review.`,
      status: 'done'
    });
  };

  // Complete direct replacement flow: creates new linked record, preserves historic old record
  const handleCompleteReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstId || !reason.trim() || !newFdrNumber.trim()) return;

    const created = store.renewInstrument(
      selectedInstId,
      {
        fdrNumber: newFdrNumber.trim(),
        amount: Number(newAmount) || selectedInstrument?.amount || 500000,
        maturityDate: newMaturityDate || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
      },
      reason.trim()
    );

    setStatusMsg({
      id: 'msg-' + Date.now(),
      title: 'Replacement FDR Created',
      detail: `Created successor instrument ${created.id}. Historic record preserved.`,
      status: 'done',
      action: {
        label: 'View New FDR',
        onClick: () => navigate('/app/fdr/' + created.id)
      }
    });

    setReason('');
    setNewFdrNumber('');
  };

  return (
    <div className="content">
      <StatusIsland message={statusMsg} onDismiss={() => setStatusMsg(null)} />

      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Workflows</div>
          <h1>Renewals & Replacement</h1>
          <p>
            Track maturing deposit renewals. Replacing an instrument creates a linked successor record while preserving historic audit trail.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Initiation Form */}
        <section className="panel">
          <div className="panel-head">
            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>
              {canInitiate ? 'Register Renewal / Replacement' : 'Renewal Workflow Information'}
            </h2>
            <span className="status info">Linked Lineage</span>
          </div>

          {canInitiate ? (
            <form onSubmit={handleCompleteReplacement}>
              <div className="field" style={{ marginBottom: '14px' }}>
                <label>Select Maturing Instrument to Renew <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select
                  value={selectedInstId}
                  onChange={e => handleSelectInstrument(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choose an instrument --</option>
                  {permittedInstruments.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.id} · {i.fdrNumber} — {i.bank} ({formatMoney(i.amount)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInstrument && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    marginBottom: '16px',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  <div>Current FDR: <strong>{selectedInstrument.fdrNumber}</strong> ({selectedInstrument.bank})</div>
                  <div>Current Maturity: <strong>{formatDate(selectedInstrument.maturityDate)}</strong></div>
                  <div>Principal Amount: <strong>{formatMoney(selectedInstrument.amount)}</strong></div>
                </div>
              )}

              <div className="field" style={{ marginBottom: '14px' }}>
                <label>New Replacement FDR Advice Number <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="text"
                  value={newFdrNumber}
                  onChange={e => setNewFdrNumber(e.target.value)}
                  placeholder="e.g. DEMO-884201-REN"
                />
              </div>

              <div className="field" style={{ marginBottom: '14px' }}>
                <label>New Stated Maturity Date</label>
                <input
                  type="date"
                  value={newMaturityDate}
                  onChange={e => setNewMaturityDate(e.target.value)}
                />
              </div>

              <div className="field" style={{ marginBottom: '18px' }}>
                <label>Renewal Reason & Authorization Context <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Extension of AICTE approval mandate for academic term 2026-2027..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedInstId || !reason.trim() || !newFdrNumber.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Execute Replacement & Link Records
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!selectedInstId || !reason.trim()}
                  onClick={handleSubmitRequest}
                >
                  Submit For Review Only
                </button>
              </div>

              <p className="footer-note" style={{ marginTop: '12px' }}>
                Replacement maintains parent-child linkage. Historic events on {selectedInstId || 'old FDR'} remain intact.
              </p>
            </form>
          ) : (
            <div style={{ padding: '16px 0' }}>
              <p className="muted" style={{ margin: '0 0 14px' }}>
                Your current role (<strong>{store.role}</strong>) oversees review and approval of renewals. Only Institution Users can register replacement instruments.
              </p>
              <div className="alert">
                Reviewers verify that the renewed deposit maintains equal or greater principal amount and continuous lien endorsement.
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Workflow Guardrails */}
        <section className="panel">
          <div className="panel-head">
            <h2>Renewal Lineage Rules</h2>
            <Link2 size={18} color="var(--color-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                1
              </span>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>No Destructive Overwrites</strong>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Prior deposit certificates, verification notes, and timestamps are sealed into history and archived.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                2
              </span>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>Bidirectional Record Linkage</strong>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Successor instrument references `replacementFor`, and original record references `replacementId`.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                3
              </span>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>Scrutiny Queue Routing</strong>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  The new successor instrument is queued for official scrutiny with initial status `Pending`.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Requests Queue Table */}
      <section className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-head">
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Renewal & Replacement Queue</h2>
          <span className="status info">{permittedRequests.length} Requests</span>
        </div>

        {permittedRequests.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Original Instrument</th>
                  <th>Replacement Link</th>
                  <th>Requester</th>
                  <th>Reason / Context</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permittedRequests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.id}</strong>
                      <div className="muted tiny">{r.kind}</div>
                    </td>
                    <td>
                      <Link to={'/app/fdr/' + r.instrumentId} className="table-link">
                        {r.instrumentId}
                      </Link>
                    </td>
                    <td>
                      {r.replacementId ? (
                        <Link to={'/app/fdr/' + r.replacementId} className="table-link" style={{ fontWeight: 600 }}>
                          {r.replacementId} →
                        </Link>
                      ) : (
                        <span className="muted tiny">Pending registration</span>
                      )}
                    </td>
                    <td>
                      <div>{r.actor}</div>
                      <span className="muted tiny">{r.actorRole}</span>
                    </td>
                    <td style={{ maxWidth: '280px', whiteSpace: 'normal' }}>
                      {r.reason}
                    </td>
                    <td>
                      <span className={`status ${r.status === 'Completed' ? 'success' : 'info'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {canReview && r.status === 'Submitted' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => {
                            store.updateRequest(r.id, { status: 'Under Review' }, 'Renewal Under Review', 'Scrutiny cell inspecting renewal');
                          }}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ padding: '28px' }}>
            No renewal requests in this scope.
          </div>
        )}
      </section>
    </div>
  );
}
export default RenewalsPage;
