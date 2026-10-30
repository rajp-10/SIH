import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  CheckCircle2,
  AlertTriangle,
  LockKeyhole,
  Check,
  X,
  FileText,
  Clock3,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments, visibleRequests, formatMoney, formatDate } from '../utils/logic';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { StatusIsland, type IslandMessage } from '../components/21st/StatusIsland';
import type { WorkflowRequest, Instrument } from '../types';

export function ReleasesPage() {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const preselectedInstId = searchParams.get('instrument') || '';

  const permittedInstruments = visibleInstruments(store);
  const releaseRequests = visibleRequests(store).filter(r => r.kind === 'Release');

  const canRequest = can(store.role, 'canRequestRelease');
  const canReview = can(store.role, 'canReviewFdr');
  const canApprove = can(store.role, 'canApproveRelease');

  const [selectedInstId, setSelectedInstId] = useState(preselectedInstId || (permittedInstruments[0]?.id || ''));
  const [requestReason, setRequestReason] = useState('');
  const [activeModalRequest, setActiveModalRequest] = useState<{ req: WorkflowRequest; action: 'Approve' | 'Reject' | 'Recommend' } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<IslandMessage | null>(null);

  const selectedInstrument = permittedInstruments.find(i => i.id === selectedInstId);

  // Submit release request (Institution User)
  const handleInitiateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstId || !requestReason.trim()) return;

    const reqId = `REL-${3000 + store.requests.length + 1}`;
    const newReq: WorkflowRequest = {
      id: reqId,
      kind: 'Release',
      instrumentId: selectedInstId,
      status: 'Submitted',
      reason: requestReason.trim(),
      actor: store.currentUser.name,
      actorRole: store.role,
      createdAt: new Date().toISOString()
    };

    store.addRequest(newReq);
    setRequestReason('');
    setStatusMsg({
      id: 'msg-' + Date.now(),
      title: 'Release Request Created',
      detail: `${reqId} submitted for formal scrutiny and subsequent approval.`,
      status: 'done'
    });
  };

  // Execute review or approval transition
  const handleConfirmAction = () => {
    if (!activeModalRequest) return;
    const { req, action } = activeModalRequest;

    // CRITICAL RBAC CHECK: Institution user CANNOT approve their own request
    if (action === 'Approve' && (!canApprove || req.actorRole === 'Institution User' && store.role === 'Institution User')) {
      alert('Security Exception: Institution Users cannot approve their own release requests. An independent Approving Authority is required.');
      setActiveModalRequest(null);
      return;
    }

    if ((action === 'Approve' || action === 'Reject') && !decisionReason.trim()) {
      alert('A written decision reason is mandatory for regulatory compliance.');
      return;
    }

    if (action === 'Recommend') {
      store.updateRequest(
        req.id,
        { status: 'Awaiting Approval' },
        'Release Recommended for Approval',
        decisionReason || 'Scrutiny cell verified compliance checklist'
      );
      setStatusMsg({
        id: 'msg-' + Date.now(),
        title: 'Release Recommended',
        detail: `${req.id} forwarded to Approving Authority.`,
        status: 'done'
      });
    } else if (action === 'Approve') {
      store.updateRequest(
        req.id,
        { status: 'Approved' },
        'Release Request Approved',
        decisionReason
      );
      setStatusMsg({
        id: 'msg-' + Date.now(),
        title: 'Release Request Approved',
        detail: `Sanctioned release for ${req.instrumentId}. Lien discharge authorized.`,
        status: 'done'
      });
    } else if (action === 'Reject') {
      store.updateRequest(
        req.id,
        { status: 'Rejected' },
        'Release Request Rejected',
        decisionReason
      );
      setStatusMsg({
        id: 'msg-' + Date.now(),
        title: 'Release Request Rejected',
        detail: `Request ${req.id} rejected: ${decisionReason}`,
        status: 'error'
      });
    }

    setActiveModalRequest(null);
    setDecisionReason('');
  };

  return (
    <div className="content">
      <StatusIsland message={statusMsg} onDismiss={() => setStatusMsg(null)} />

      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Workflows</div>
          <h1>Security Deposit Release & Refund</h1>
          <p>
            Governed release process with strict segregation of duties between requesting institutions, scrutiny officials, and approving authorities.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Initiation / Instructions */}
        <section className="panel">
          <div className="panel-head">
            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>
              {canRequest ? 'Request Deposit Release' : 'Release Authority Console'}
            </h2>
            <span className={`status ${canApprove ? 'accent' : 'info'}`}>
              {store.role}
            </span>
          </div>

          {canRequest ? (
            <form onSubmit={handleInitiateRelease}>
              <div className="field" style={{ marginBottom: '14px' }}>
                <label>Select FDR Instrument for Release <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select
                  value={selectedInstId}
                  onChange={e => setSelectedInstId(e.target.value)}
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
                  <div>FDR Number: <strong>{selectedInstrument.fdrNumber}</strong> ({selectedInstrument.bank})</div>
                  <div>Lifecycle Status: <strong>{selectedInstrument.lifecycle}</strong></div>
                  <div>Principal Value: <strong>{formatMoney(selectedInstrument.amount)}</strong></div>
                  <div>Stated Maturity: <strong>{formatDate(selectedInstrument.maturityDate)}</strong></div>
                </div>
              )}

              <div className="field" style={{ marginBottom: '18px' }}>
                <label>Justification for Release Request <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <textarea
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  placeholder="Detail completion of regulatory approval tenure or statutory discharge criteria..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedInstId || !requestReason.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowDownToLine size={15} /> Submit Formal Release Request
              </button>

              <p className="footer-note" style={{ marginTop: '12px' }}>
                Submitting a release request routes the record through official scrutiny. An Institution User cannot approve this request.
              </p>
            </form>
          ) : (
            <div style={{ padding: '14px 0' }}>
              <p className="muted" style={{ margin: '0 0 14px' }}>
                {canApprove
                  ? 'As Approving Authority, you have final statutory sanction to approve or reject verified release requests.'
                  : 'As Reviewing Official, you examine release applications and document evidence before recommending approval.'}
              </p>
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: canApprove ? 'var(--color-accent-subtle)' : 'var(--color-surface-subtle)',
                  border: `1px solid ${canApprove ? 'var(--color-warning)' : 'var(--color-border)'}`,
                  fontSize: 'var(--text-xs)'
                }}
              >
                <strong>Statutory Guardrail Enforced:</strong> Releasing security deposits discharges the official AICTE joint lien. Approving authorities must input a comprehensive audit justification.
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Workflow Segregation of Duties */}
        <section className="panel">
          <div className="panel-head">
            <h2>Three-Tier Segregation of Duties</h2>
            <LockKeyhole size={18} color="var(--color-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'block' }}>
                Tier 1: Request Initiation (Institution User)
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Institution submits proof of tenure completion. Can view request progress, but cannot approve or bypass review.
              </p>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'block' }}>
                Tier 2: Scrutiny & Recommendation (Reviewing Official)
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Verifies absence of regulatory encumbrances or compliance penalties. Recommends eligible requests to Authority.
              </p>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-primary)'
              }}
            >
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'block' }}>
                Tier 3: Decision Sanction (Approving Authority)
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Holds exclusive financial release authorization. Mandates documented decision reasons for permanent audit logs.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Release Requests Table */}
      <section className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-head">
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Release & Refund Request Queue</h2>
          <span className="status info">{releaseRequests.length} Requests</span>
        </div>

        {releaseRequests.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Instrument</th>
                  <th>Requester Role</th>
                  <th>Reason for Release</th>
                  <th>Status</th>
                  <th>Decision Remarks</th>
                  <th style={{ textAlign: 'center' }}>Available Actions</th>
                </tr>
              </thead>
              <tbody>
                {releaseRequests.map(req => {
                  const isAwaitingApproval = req.status === 'Awaiting Approval';
                  const isSubmitted = req.status === 'Submitted' || req.status === 'Under Review';

                  return (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.id}</strong>
                        <div className="muted tiny">{new Date(req.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td>
                        <Link to={'/app/fdr/' + req.instrumentId} className="table-link" style={{ fontWeight: 600 }}>
                          {req.instrumentId}
                        </Link>
                      </td>
                      <td>
                        <div>{req.actor}</div>
                        <span className="muted tiny">{req.actorRole}</span>
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'normal', fontSize: 'var(--text-xs)' }}>
                        {req.reason}
                      </td>
                      <td>
                        <span
                          className={`status ${
                            req.status === 'Approved'
                              ? 'success'
                              : req.status === 'Rejected'
                              ? 'danger'
                              : req.status === 'Awaiting Approval'
                              ? 'warning'
                              : 'info'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '220px', whiteSpace: 'normal', fontSize: 'var(--text-xs)' }}>
                        {req.decisionReason ? (
                          <div>
                            <strong>{req.decisionReason}</strong>
                            {req.decidedBy && <div className="muted tiny">By: {req.decidedBy}</div>}
                          </div>
                        ) : (
                          <span className="muted tiny">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {/* Reviewer Action: Recommend */}
                          {canReview && isSubmitted && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => {
                                setDecisionReason('');
                                setActiveModalRequest({ req, action: 'Recommend' });
                              }}
                            >
                              Scrutinize & Recommend
                            </button>
                          )}

                          {/* Approving Authority Actions: Approve or Reject */}
                          {canApprove && isAwaitingApproval && (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-small"
                                onClick={() => {
                                  setDecisionReason('');
                                  setActiveModalRequest({ req, action: 'Approve' });
                                }}
                              >
                                Sanction Approval
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => {
                                  setDecisionReason('');
                                  setActiveModalRequest({ req, action: 'Reject' });
                                }}
                                style={{ color: 'var(--color-danger)' }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Institution User: View Only */}
                          {store.role === 'Institution User' && (
                            <span className="muted tiny">Request under scrutiny</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ padding: '28px' }}>
            No release requests recorded in this scope.
          </div>
        )}
      </section>

      {/* Confirmation Dialog with Required Written Justification */}
      {activeModalRequest && (
        <ConfirmationDialog
          title={`Confirm Release Decision: ${activeModalRequest.action}`}
          description={
            activeModalRequest.action === 'Approve'
              ? `You are authorizing the formal release and lien discharge of instrument ${activeModalRequest.req.instrumentId}. This decision will update the instrument lifecycle to "Released" and be sealed into the audit log.`
              : activeModalRequest.action === 'Reject'
              ? `You are rejecting release request ${activeModalRequest.req.id}. Provide an official explanation for the institution.`
              : `Confirm that scrutiny of ${activeModalRequest.req.instrumentId} has passed and recommend it to the Competent Financial Authority.`
          }
          reason={decisionReason}
          setReason={setDecisionReason}
          onCancel={() => {
            setActiveModalRequest(null);
            setDecisionReason('');
          }}
          onConfirm={handleConfirmAction}
          requiredReason={true}
          reasonPlaceholder="Enter statutory audit justification..."
          confirmLabel={`Apply ${activeModalRequest.action}`}
          variant={activeModalRequest.action === 'Reject' ? 'danger' : activeModalRequest.action === 'Approve' ? 'success' : 'primary'}
          useSlideConfirm={activeModalRequest.action === 'Approve'}
        />
      )}
    </div>
  );
}
export default ReleasesPage;
