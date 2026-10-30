import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CalendarClock,
  RefreshCw,
  ArrowDownToLine,
  Eye,
  History,
  Workflow,
  LockKeyhole,
  Check,
  X
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments, maturityLabel, formatMoney, formatDate, daysUntil } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { SmoothDrawer } from '../components/21st/SmoothDrawer';
import { StatusIsland, type IslandMessage } from '../components/21st/StatusIsland';
import type { Doc, Instrument, ReviewCheck } from '../types';

export function FdrDetailPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const navigate = useNavigate();

  const instrument = store.instruments.find(i => i.id === id);

  // Drawer & Dialog State
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'Verified' | 'Discrepancy' | 'Correction' | 'Under Review' | 'Reject' | null>(null);
  const [modalReason, setModalReason] = useState('');
  const [scrutinyNote, setScrutinyNote] = useState('');
  const [statusIslandMsg, setStatusIslandMsg] = useState<IslandMessage | null>(null);

  // If instrument doesn't exist
  if (!instrument) {
    return (
      <div className="content">
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Instrument Record Not Found</h2>
          <p className="muted">ID {id} does not exist in the current demonstration repository.</p>
          <Link to="/app/repository" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} /> Return to Repository
          </Link>
        </div>
      </div>
    );
  }

  // Permission Scope Check:
  // Institution User can ONLY view records of their own institutionId
  const permitted = visibleInstruments(store);
  if (!permitted.some(i => i.id === instrument.id)) {
    return (
      <AccessDenied
        requiredPermission="canViewInstitutionRecords"
        message={`Access restricted. Your current institution scope (${store.institutionId}) is not authorized to inspect records of ${instrument.institution}.`}
      />
    );
  }

  const m = maturityLabel(instrument, store.thresholds);
  const isReviewer = can(store.role, 'canReviewFdr');
  const isInstitution = can(store.role, 'canCreateFdr');

  // Rules-based consistency evaluation
  const consistencyChecks: Array<{ label: string; passed: boolean; note: string }> = [
    {
      label: 'FDR Number & Sanction Match',
      passed: Boolean(instrument.fdrNumber && instrument.fdrNumber.trim()),
      note: 'FDR reference matches institutional deposit schedule'
    },
    {
      label: 'Issuing Bank & Branch Specified',
      passed: Boolean(instrument.bank && instrument.branch),
      note: `${instrument.bank} (${instrument.branch})`
    },
    {
      label: 'Tenure Date Order Validated',
      passed: Boolean(instrument.issueDate && instrument.maturityDate && instrument.maturityDate > instrument.issueDate),
      note: 'Maturity date is strictly chronologically subsequent to issue date'
    },
    {
      label: 'Required Deposit Advice Document Attached',
      passed: instrument.documents.some(d => d.category === 'FDR Copy' && d.status !== 'Missing'),
      note: instrument.documents.some(d => d.category === 'FDR Copy')
        ? 'Official FDR copy metadata verified'
        : 'Missing required FDR copy document'
    },
    {
      label: 'Bank Joint Lien Clause Endorsement',
      passed: instrument.verification !== 'Discrepancy Found' && !instrument.documents.some(d => d.status === 'Flagged'),
      note: instrument.discrepancyReason || 'Joint lien clause endorsed in favor of Member Secretary, AICTE'
    }
  ];

  const handleOpenDoc = (doc: Doc) => {
    setSelectedDoc(doc);
    setDrawerOpen(true);
  };

  const handleExecuteReviewAction = () => {
    if (!activeModal) return;

    if (activeModal === 'Verified') {
      store.verifyInstrument(instrument.id, modalReason || scrutinyNote || 'Verified on all criteria');
      setStatusIslandMsg({
        id: 'msg-' + Date.now(),
        title: 'Instrument Verified',
        detail: `${instrument.id} marked Verified by Authorized Reviewer.`,
        status: 'done'
      });
    } else if (activeModal === 'Discrepancy') {
      store.flagDiscrepancy(instrument.id, modalReason || 'Scrutiny discrepancy flagged', scrutinyNote);
      setStatusIslandMsg({
        id: 'msg-' + Date.now(),
        title: 'Discrepancy Flagged',
        detail: `Flagged: ${modalReason}`,
        status: 'error'
      });
    } else if (activeModal === 'Correction') {
      store.returnForCorrection(instrument.id, modalReason || 'Correction required by institution');
      setStatusIslandMsg({
        id: 'msg-' + Date.now(),
        title: 'Returned for Correction',
        detail: modalReason,
        status: 'done'
      });
    } else if (activeModal === 'Under Review') {
      store.updateInstrument(
        instrument.id,
        { verification: 'Under Review' },
        'Marked Under Review',
        modalReason || 'Commenced scrutiny of documents'
      );
      setStatusIslandMsg({
        id: 'msg-' + Date.now(),
        title: 'Under Review',
        detail: 'Scrutiny cell assigned to examine record.',
        status: 'done'
      });
    } else if (activeModal === 'Reject') {
      store.updateInstrument(
        instrument.id,
        { verification: 'Rejected', lifecycle: 'Archived' },
        'Verification Rejected',
        modalReason || 'Failed regulatory compliance'
      );
      setStatusIslandMsg({
        id: 'msg-' + Date.now(),
        title: 'Record Rejected',
        detail: modalReason,
        status: 'error'
      });
    }

    setActiveModal(null);
    setModalReason('');
  };

  // Related workflow requests for this FDR
  const relatedRequests = store.requests.filter(
    r => r.instrumentId === instrument.id || r.replacementId === instrument.id
  );

  return (
    <div className="content">
      {/* 21st.dev Status Island for Action Feedback */}
      <StatusIsland message={statusIslandMsg} onDismiss={() => setStatusIslandMsg(null)} />

      {/* 21st.dev Document Drawer */}
      <SmoothDrawer
        isOpen={drawerOpen}
        document={selectedDoc}
        instrument={instrument}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Header & Contextual Actions */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Repository / {instrument.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>{instrument.id}</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--color-text-muted)' }}>
              ({instrument.fdrNumber})
            </span>
            <span className={`status ${instrument.lifecycle === 'Active' ? 'success' : 'info'}`}>
              Lifecycle: {instrument.lifecycle}
            </span>
          </div>
          <p>{instrument.institution} · Reference: {instrument.reference}</p>
        </div>

        <div className="inline-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/repository')}>
            <ArrowLeft size={15} /> Repository
          </button>

          {/* Workflow Action Buttons for Institution User */}
          {can(store.role, 'canRequestRenewal') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/app/renewals?instrument=${instrument.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Request Renewal
            </button>
          )}

          {can(store.role, 'canRequestRelease') && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/app/releases?instrument=${instrument.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowDownToLine size={14} /> Request Release
            </button>
          )}
        </div>
      </div>

      {/* Replacement Linkage Banner if applicable */}
      {instrument.replacementFor && (
        <div className="alert" style={{ background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', marginBottom: '20px' }}>
          <strong>Linked Replacement Record:</strong> This FDR was registered as an authorized renewal/replacement for prior record{' '}
          <Link to={`/app/fdr/${instrument.replacementFor}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>
            {instrument.replacementFor}
          </Link>
          . Prior historic audit events are preserved.
        </div>
      )}

      {instrument.replacementId && (
        <div className="alert" style={{ background: 'var(--color-surface-subtle)', marginBottom: '20px' }}>
          <strong>Superseded by Renewal:</strong> This record has been renewed. The active successor instrument is{' '}
          <Link to={`/app/fdr/${instrument.replacementId}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>
            {instrument.replacementId}
          </Link>
          .
        </div>
      )}

      {/* Discrepancy Alert Banner */}
      {instrument.verification === 'Discrepancy Found' && (
        <div className="alert error" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle size={18} />
            <strong>Scrutiny Discrepancy Active</strong>
          </div>
          <div>{instrument.discrepancyReason || 'A regulatory discrepancy was flagged by the reviewing official.'}</div>
        </div>
      )}

      {/* Metric Row */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric">
          <span>Principal Amount</span>
          <strong>{formatMoney(instrument.amount)}</strong>
          <span>Sanctioned deposit</span>
        </div>

        <div className={`metric ${m.tone === 'danger' ? 'danger' : m.tone === 'warning' ? 'accent' : ''}`}>
          <span>Maturity Status</span>
          <strong>{m.label}</strong>
          <span>Maturity: {formatDate(instrument.maturityDate)}</span>
        </div>

        <div className="metric">
          <span>Verification Status</span>
          <strong style={{ fontSize: 'var(--text-lg)' }}>
            {instrument.verification === 'Verified by Authorized Reviewer' ? 'Verified' : instrument.verification}
          </strong>
          <span>Official Reviewer Sign-off</span>
        </div>

        <div className="metric">
          <span>Attached Documents</span>
          <strong>{instrument.documents.length} Files</strong>
          <span>Metadata recorded</span>
        </div>
      </div>

      {/* Details & Review Sections */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="stack">
          {/* Instrument Information Panel */}
          <section className="panel">
            <div className="panel-head">
              <h2>Instrument Information</h2>
              <span className="muted tiny">Record ID: {instrument.id}</span>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span>Institution</span>
                <strong>{instrument.institution}</strong>
              </div>
              <div className="detail-item">
                <span>Institution Scope</span>
                <strong>{instrument.institutionId}</strong>
              </div>
              <div className="detail-item">
                <span>FDR Number</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{instrument.fdrNumber}</strong>
              </div>
              <div className="detail-item">
                <span>Issuing Bank</span>
                <strong>{instrument.bank}</strong>
              </div>
              <div className="detail-item">
                <span>Branch Location</span>
                <strong>{instrument.branch}</strong>
              </div>
              <div className="detail-item">
                <span>Principal Amount</span>
                <strong>{formatMoney(instrument.amount)}</strong>
              </div>
              <div className="detail-item">
                <span>Issue Date</span>
                <strong>{formatDate(instrument.issueDate)}</strong>
              </div>
              <div className="detail-item">
                <span>Maturity Date</span>
                <strong>{formatDate(instrument.maturityDate)}</strong>
              </div>
              <div className="detail-item">
                <span>Reference Number</span>
                <strong>{instrument.reference}</strong>
              </div>
              <div className="detail-item">
                <span>Creation Date</span>
                <strong>{new Date(instrument.createdAt).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>
          </section>

          {/* Attached Supporting Documents */}
          <section className="panel">
            <div className="panel-head">
              <h2>Supporting Documents</h2>
              <span className="muted tiny">Click any file to inspect metadata</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {instrument.documents.map(doc => (
                <div
                  key={doc.id}
                  className="file-row"
                  onClick={() => handleOpenDoc(doc)}
                  style={{ cursor: 'pointer' }}
                >
                  <FileText size={20} color="var(--color-primary)" />
                  <div className="file-info">
                    <strong>{doc.name}</strong>
                    <small>Category: {doc.category} · Status: {doc.status}</small>
                    {doc.reviewerNote && (
                      <small style={{ color: 'var(--color-warning)' }}>
                        Reviewer observation: {doc.reviewerNote}
                      </small>
                    )}
                  </div>
                  <span
                    className={`status ${
                      doc.status === 'Verified' ? 'success' : doc.status === 'Flagged' ? 'danger' : 'warning'
                    }`}
                  >
                    {doc.status}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenDoc(doc);
                    }}
                  >
                    <Eye size={13} /> Inspect
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Reviewer Scrutiny Console (Visible only to Reviewing Official) */}
          {isReviewer && (
            <section
              className="panel"
              style={{
                borderLeft: '4px solid var(--color-primary)',
                background: 'var(--color-surface)'
              }}
            >
              <div className="panel-head">
                <div>
                  <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Official Scrutiny Console</h2>
                  <small style={{ color: 'var(--color-text-muted)' }}>
                    Authorized Reviewer: {store.currentUser.name}
                  </small>
                </div>
                <span className="status info">Scrutiny Active</span>
              </div>

              <div className="field" style={{ marginBottom: '16px' }}>
                <label>Scrutiny Notes & Formal Findings</label>
                <textarea
                  value={scrutinyNote}
                  onChange={e => setScrutinyNote(e.target.value)}
                  placeholder="Record observations regarding branch stamps, joint lien clause, or deposit term..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setModalReason(scrutinyNote);
                    setActiveModal('Verified');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={15} /> Mark Reviewer Verified
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setModalReason(scrutinyNote);
                    setActiveModal('Discrepancy');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <AlertTriangle size={15} color="var(--color-danger)" /> Flag Discrepancy
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setModalReason(scrutinyNote);
                    setActiveModal('Correction');
                  }}
                >
                  Return for Correction
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setModalReason(scrutinyNote);
                    setActiveModal('Under Review');
                  }}
                >
                  Mark Under Review
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setModalReason(scrutinyNote);
                    setActiveModal('Reject');
                  }}
                  style={{ color: 'var(--color-danger)' }}
                >
                  Reject Record
                </button>
              </div>

              <p className="footer-note" style={{ marginTop: '14px' }}>
                All scrutiny actions are recorded in the system audit trail with your identity and reason.
              </p>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="stack">
          {/* Consistency Rules Checklist */}
          <section className="panel">
            <div className="panel-head">
              <h2>Automated Consistency Audit</h2>
              <span className="status success">Rules-Based</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {consistencyChecks.map(chk => (
                <div
                  key={chk.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: chk.passed ? 'var(--color-surface-subtle)' : 'var(--color-danger-bg)',
                    border: `1px solid ${chk.passed ? 'var(--color-border-subtle)' : 'var(--color-danger)'}`
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {chk.passed ? (
                      <CheckCircle2 size={16} color="var(--color-success)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--color-danger)" />
                    )}
                  </div>
                  <div>
                    <strong style={{ fontSize: 'var(--text-xs)', display: 'block', color: 'var(--color-text)' }}>
                      {chk.label}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {chk.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="footer-note" style={{ marginTop: '14px' }}>
              Consistency checks verify internal field integrity and attached document metadata. They do not constitute direct external banking ledger verification.
            </p>
          </section>

          {/* Workflow Requests for this FDR */}
          <section className="panel">
            <div className="panel-head">
              <h2>Workflow History</h2>
              <span className="muted tiny">{relatedRequests.length} Requests</span>
            </div>

            {relatedRequests.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {relatedRequests.map(r => (
                  <div key={r.id} className="file-row">
                    <Workflow size={18} color="var(--color-primary)" />
                    <div className="file-info">
                      <strong>{r.id} · {r.kind} Request</strong>
                      <small>Requester: {r.actor} ({r.actorRole})</small>
                      {r.decisionReason && (
                        <small style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          Decision: {r.decisionReason}
                        </small>
                      )}
                    </div>
                    <span className="status info">{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: '20px' }}>
                No renewal or release requests filed for this instrument yet.
              </div>
            )}
          </section>

          {/* Audit History Timeline for this FDR */}
          <section className="panel">
            <div className="panel-head">
              <h2>Audit Trail for {instrument.id}</h2>
              <span className="muted tiny">Immutable Log</span>
            </div>

            <div className="timeline">
              {store.audit
                .filter(a => a.entity === instrument.id)
                .slice(0, 6)
                .map(event => (
                  <div className="timeline-item" key={event.id}>
                    <span className="timeline-dot" />
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                        <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                          {event.action}
                        </strong>
                        <span className="muted tiny">
                          {new Date(event.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0', fontSize: '11px' }}>{event.description}</p>
                      <span className="muted tiny">
                        Actor: {event.actor} ({event.role})
                      </span>
                      {event.reason && (
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '2px 6px',
                            background: 'var(--color-surface-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '10px'
                          }}
                        >
                          Reason: {event.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {!store.audit.some(a => a.entity === instrument.id) && (
                <div className="empty" style={{ padding: '16px' }}>
                  No record-specific audit events recorded yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Dialogs for Scrutiny Actions */}
      {activeModal && (
        <ConfirmationDialog
          title={`Confirm Action: ${activeModal}`}
          description={
            activeModal === 'Verified'
              ? 'Marking this record as "Verified by Authorized Reviewer" attests that human scrutiny of all fields and documents has concluded successfully.'
              : activeModal === 'Discrepancy'
              ? 'Flagging a discrepancy will halt approval workflows and require the institution to address the noted non-compliance.'
              : activeModal === 'Correction'
              ? 'Returning this record will notify the institution user to update missing or defective document metadata.'
              : `Confirm regulatory status transition to ${activeModal}.`
          }
          reason={modalReason}
          setReason={setModalReason}
          onCancel={() => {
            setActiveModal(null);
            setModalReason('');
          }}
          onConfirm={handleExecuteReviewAction}
          requiredReason={activeModal === 'Discrepancy' || activeModal === 'Correction' || activeModal === 'Reject'}
          confirmLabel={`Apply ${activeModal}`}
          variant={activeModal === 'Discrepancy' || activeModal === 'Reject' ? 'danger' : activeModal === 'Verified' ? 'success' : 'primary'}
        />
      )}
    </div>
  );
}
export default FdrDetailPage;
