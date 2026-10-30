import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  FilePlus2,
  ShieldCheck,
  RefreshCw,
  ArrowDownToLine,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  FileText,
  Activity,
  UserCheck,
  Users,
  Settings,
  History,
  Building2,
  Scale,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/Store';
import {
  can,
  visibleInstruments,
  visibleRequests,
  maturityLabel,
  formatMoney,
  formatDate,
  daysUntil
} from '../utils/logic';
import { MetricCard } from '../components/MetricCard';
import type { Instrument, WorkflowRequest } from '../types';

/* =========================================================================
   1. INSTITUTION USER DASHBOARD
   ========================================================================= */
function InstitutionDashboard() {
  const store = useStore();
  const navigate = useNavigate();

  // Strict scope: ONLY records belonging to their assigned institution
  const myInstruments = store.instruments.filter(i => i.institutionId === store.institutionId);
  const myInstrumentIds = new Set(myInstruments.map(i => i.id));
  const myRequests = store.requests.filter(r => myInstrumentIds.has(r.instrumentId));

  const totalSubmitted = myInstruments.length;
  const pendingVerification = myInstruments.filter(i =>
    ['Pending', 'Under Review', 'Correction Required'].includes(i.verification)
  );
  const verifiedAccepted = myInstruments.filter(i =>
    i.verification === 'Verified by Authorized Reviewer'
  );
  const requiringClarification = myInstruments.filter(i =>
    i.verification === 'Discrepancy Found' || i.verification === 'Correction Required'
  );
  const nearMaturity = myInstruments.filter(i =>
    i.lifecycle !== 'Released' && daysUntil(i.maturityDate) <= 90 && daysUntil(i.maturityDate) >= 0
  );
  const totalPortfolioSum = myInstruments.reduce((acc, i) => acc + i.amount, 0);

  const upcomingMaturities = [...myInstruments]
    .filter(i => i.lifecycle !== 'Released')
    .sort((a, b) => a.maturityDate.localeCompare(b.maturityDate))
    .slice(0, 5);

  const recentNotifications = store.notifications.slice(0, 5);

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">Institutional Desk / Overview</div>
          <h1>Institution FDR Dashboard</h1>
          <p>
            Managing fixed deposit records and compliance lifecycle for{' '}
            <strong>{store.currentUser.department || store.institutionId}</strong>.
          </p>
        </div>

        <div className="inline-actions">
          <Link
            to="/app/fdr/new"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FilePlus2 size={16} /> Submit New FDR
          </Link>
          <Link
            to="/app/releases"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowDownToLine size={16} /> Request Release
          </Link>
        </div>
      </div>

      {/* Scope Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            Operating Scope: <strong>{store.currentUser.name}</strong> ({store.institutionId}) · Dedicated Institutional Access
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Portfolio Value: <strong>{formatMoney(totalPortfolioSum)}</strong>
        </div>
      </div>

      {/* Clarification Alert if Any Discrepancy Found */}
      {requiringClarification.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-warning)',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', display: 'block' }}>
                Action Required: {requiringClarification.length} record(s) flagged for clarification
              </strong>
              <span style={{ fontSize: 'var(--text-xs)', opacity: 0.9 }}>
                Reviewing officials have noted discrepancies or missing documents on your submissions.
              </span>
            </div>
          </div>
          <Link
            to={`/app/fdr/${requiringClarification[0].id}`}
            className="btn btn-small"
            style={{
              background: 'var(--color-warning)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600
            }}
          >
            Review Discrepancy Notes →
          </Link>
        </div>
      )}

      {/* Role-Specific Metrics Grid */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MetricCard
          label="Total FDRs Submitted"
          value={totalSubmitted}
          note={`Scope: ${store.institutionId}`}
          icon={<Wallet size={18} />}
          onClick={() => navigate('/app/repository')}
        />

        <MetricCard
          label="Pending Verification"
          value={pendingVerification.length}
          note="Under scrutiny cell review"
          icon={<Clock3 size={18} />}
          tone="warning"
          accent={pendingVerification.length > 0}
        />

        <MetricCard
          label="Verified & Accepted"
          value={verifiedAccepted.length}
          note="Confirmed compliance sign-off"
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />

        <MetricCard
          label="Needs Clarification"
          value={requiringClarification.length}
          note="Discrepancies flagged"
          icon={<AlertTriangle size={18} />}
          tone={requiringClarification.length > 0 ? 'danger' : 'default'}
          accent={requiringClarification.length > 0}
        />

        <MetricCard
          label="Approaching Maturity"
          value={nearMaturity.length}
          note={`Within ${store.thresholds[0]}d regulatory window`}
          icon={<CalendarClock size={18} />}
          tone={nearMaturity.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* 2-Column Institutional Work Area */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Submissions & Maturities */}
        <div className="stack">
          {/* Recent Submissions */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  My Institutional FDR Submissions
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Latest security instruments registered by your office
                </small>
              </div>
              <Link to="/app/repository" className="table-link tiny">
                View all FDRs →
              </Link>
            </div>

            {myInstruments.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Instrument ID</th>
                      <th>Bank & Branch</th>
                      <th>FDR Number</th>
                      <th>Amount</th>
                      <th>Verification</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInstruments.slice(0, 5).map(inst => (
                      <tr key={inst.id}>
                        <td>
                          <Link to={`/app/fdr/${inst.id}`} className="table-link" style={{ fontWeight: 600 }}>
                            {inst.id}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{inst.bank}</div>
                          <div className="muted tiny">{inst.branch}</div>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px' }}>{inst.fdrNumber}</code>
                        </td>
                        <td>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{formatMoney(inst.amount)}</strong>
                        </td>
                        <td>
                          <span
                            className={`status ${
                              inst.verification === 'Verified by Authorized Reviewer'
                                ? 'success'
                                : inst.verification === 'Discrepancy Found'
                                ? 'danger'
                                : 'warning'
                            }`}
                          >
                            {inst.verification === 'Verified by Authorized Reviewer' ? 'Verified' : inst.verification}
                          </span>
                        </td>
                        <td>
                          <Link to={`/app/fdr/${inst.id}`} className="table-link tiny">
                            Inspect →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ padding: '20px', margin: 0 }}>
                No FDR records submitted yet. Use "Submit New FDR" above to register an instrument.
              </p>
            )}
          </section>

          {/* Upcoming Maturities */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  Upcoming Maturities
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Threshold monitoring for renewals or release eligibility
                </small>
              </div>
              <Link to="/app/renewals" className="table-link tiny">
                Renewals Desk →
              </Link>
            </div>

            {upcomingMaturities.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Bank</th>
                      <th>Maturity Date</th>
                      <th>Days Left</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingMaturities.map(i => {
                      const m = maturityLabel(i, store.thresholds);
                      return (
                        <tr key={i.id}>
                          <td>
                            <Link to={`/app/fdr/${i.id}`} className="table-link" style={{ fontWeight: 600 }}>
                              {i.id}
                            </Link>
                            <div className="muted tiny">{i.fdrNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 'var(--text-xs)' }}>{i.bank}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 'var(--text-xs)' }}>{formatDate(i.maturityDate)}</div>
                          </td>
                          <td>
                            <span className={`status ${m.tone}`}>{m.label}</span>
                          </td>
                          <td>
                            <Link to="/app/renewals" className="table-link tiny">
                              Initiate Renewal
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ padding: '20px', margin: 0 }}>
                No upcoming maturities within regulatory threshold.
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Workflow Requests & Alerts */}
        <div className="stack">
          {/* Active Workflow Requests */}
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                My Submitted Requests
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-subtle)',
                  color: 'var(--color-text-muted)'
                }}
              >
                {myRequests.length} Requests
              </span>
            </div>

            {myRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myRequests.map(req => (
                  <div
                    key={req.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-surface-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                        {req.kind} Request ({req.id})
                      </strong>
                      <span
                        className={`status ${
                          req.status === 'Approved'
                            ? 'success'
                            : req.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      Instrument: <strong>{req.instrumentId}</strong> · Submitted: {formatDate(req.createdAt)}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text)' }}>
                      Reason: {req.reason}
                    </p>
                    {req.decisionReason && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--color-surface)',
                          fontSize: '11px',
                          border: '1px solid var(--color-border-subtle)'
                        }}
                      >
                        <strong>Decision Reason:</strong> {req.decisionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ padding: '16px', margin: 0 }}>
                No active release or renewal requests submitted yet.
              </p>
            )}
          </section>

          {/* Recent Notifications */}
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Notifications
              </h2>
              <Link to="/app/notifications" className="table-link tiny">
                View all →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentNotifications.map(notice => (
                <div
                  key={notice.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    background: notice.read ? 'var(--color-surface)' : 'var(--color-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                      {notice.title}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {formatDate(notice.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. AICTE REVIEWING OFFICIAL DASHBOARD
   ========================================================================= */
function ReviewingOfficialDashboard() {
  const store = useStore();
  const navigate = useNavigate();

  // Full system-wide scrutiny scope
  const allInstruments = store.instruments;

  const pendingScrutiny = allInstruments.filter(i => i.verification === 'Pending');
  const underReview = allInstruments.filter(i => i.verification === 'Under Review');
  const correctionRequired = allInstruments.filter(i => i.verification === 'Correction Required');
  const discrepanciesFlagged = allInstruments.filter(i => i.verification === 'Discrepancy Found');
  const verifiedCount = allInstruments.filter(i => i.verification === 'Verified by Authorized Reviewer').length;

  const priorityQueue = allInstruments
    .filter(i => ['Pending', 'Under Review', 'Correction Required', 'Discrepancy Found'].includes(i.verification))
    .slice(0, 6);

  const recentlyScrutinized = allInstruments
    .filter(i => i.verification === 'Verified by Authorized Reviewer')
    .slice(0, 5);

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">Bureau of Scrutiny & Verification</div>
          <h1>AICTE Reviewing Official Console</h1>
          <p>
            Administrative vetting of security deposits, bank certificates, and lien clauses across all affiliated institutions.
          </p>
        </div>

        <div className="inline-actions">
          <Link
            to="/app/verification"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} /> Open Scrutiny Queue
          </Link>
          <Link
            to="/app/audit"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} /> Audit Trail
          </Link>
        </div>
      </div>

      {/* Reviewer Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            Operating Official: <strong>{store.currentUser.name}</strong> · AICTE Bureau of Scrutiny
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Authority Boundary: Human review outcome sign-off. Financial release approval is strictly segregated.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <MetricCard
          label="Pending Scrutiny"
          value={pendingScrutiny.length}
          note="Unchecked submissions"
          icon={<Clock3 size={18} />}
          tone="warning"
          accent={pendingScrutiny.length > 0}
          onClick={() => navigate('/app/verification')}
        />

        <MetricCard
          label="Under Review"
          value={underReview.length}
          note="Active examination"
          icon={<ShieldCheck size={18} />}
          tone="info"
        />

        <MetricCard
          label="Discrepancies Flagged"
          value={discrepanciesFlagged.length}
          note="Defects identified"
          icon={<AlertTriangle size={18} />}
          tone={discrepanciesFlagged.length > 0 ? 'danger' : 'default'}
          accent={discrepanciesFlagged.length > 0}
        />

        <MetricCard
          label="Corrections Required"
          value={correctionRequired.length}
          note="Returned to institution"
          icon={<RotateCcw size={18} />}
          tone="warning"
        />

        <MetricCard
          label="Verified by Reviewer"
          value={verifiedCount}
          note="Compliance confirmed"
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
      </div>

      {/* Grid: Scrutiny Priority & Follow-Ups */}
      <div className="dashboard-grid">
        {/* Left: Priority Scrutiny Queue */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Priority Scrutiny Queue
              </h2>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                Unverified submissions requiring inspection of document metadata and lien terms
              </small>
            </div>
            <Link to="/app/verification" className="table-link tiny">
              Full Queue ({priorityQueue.length}) →
            </Link>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Institution</th>
                  <th>Bank</th>
                  <th>Principal</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {priorityQueue.map(i => (
                  <tr key={i.id}>
                    <td>
                      <Link to={`/app/fdr/${i.id}`} className="table-link" style={{ fontWeight: 600 }}>
                        {i.id}
                      </Link>
                      <div className="muted tiny">{i.fdrNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{i.institution}</div>
                      <div className="muted tiny">{i.institutionId}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>{i.bank}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: 'var(--text-xs)' }}>{formatMoney(i.amount)}</strong>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          i.verification === 'Discrepancy Found'
                            ? 'danger'
                            : i.verification === 'Correction Required'
                            ? 'warning'
                            : 'info'
                        }`}
                      >
                        {i.verification}
                      </span>
                    </td>
                    <td>
                      <Link to={`/app/fdr/${i.id}`} className="btn btn-secondary btn-small" style={{ fontSize: '11px' }}>
                        Scrutinize
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Flagged Follow-Ups & Guidance */}
        <div className="stack">
          {/* Active Discrepancy Registry */}
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Flagged Discrepancy Registry
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)'
                }}
              >
                {discrepanciesFlagged.length} Flagged
              </span>
            </div>

            {discrepanciesFlagged.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {discrepanciesFlagged.map(i => (
                  <div
                    key={i.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-danger)',
                      background: 'var(--color-danger-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>
                        {i.id} · {i.institution}
                      </strong>
                      <Link to={`/app/fdr/${i.id}`} className="table-link tiny" style={{ color: 'var(--color-danger)' }}>
                        Inspect →
                      </Link>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text)', marginTop: '4px' }}>
                      <strong>Reason:</strong> {i.discrepancyReason || 'Lien terms or bank verification mismatch.'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ padding: '16px', margin: 0 }}>
                No active discrepancies flagged at this time.
              </p>
            )}
          </section>

          {/* Scrutiny Guardrails Notice */}
          <section className="panel" style={{ background: 'var(--color-surface-subtle)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
              Regulatory Scrutiny Guardrails
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              1. Reviewing officials must verify all checklist items (Bank Confirmation, Beneficiary Lien Clause, Principal Amount) before marking an instrument verified.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              2. Marking an instrument verified transitions its state to Active. It does NOT authorize release or refund.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. APPROVING AUTHORITY DASHBOARD
   ========================================================================= */
function ApprovingAuthorityDashboard() {
  const store = useStore();
  const navigate = useNavigate();

  // All release requests across the regulatory portfolio
  const releaseRequests = store.requests.filter(r => r.kind === 'Release');

  const awaitingApproval = releaseRequests.filter(r => r.status === 'Awaiting Approval');
  const underReview = releaseRequests.filter(r => r.status === 'Under Review' || r.status === 'Submitted');
  const approvedRequests = releaseRequests.filter(r => r.status === 'Approved');
  const rejectedRequests = releaseRequests.filter(r => r.status === 'Rejected');

  const pendingReleaseSum = awaitingApproval.reduce((acc, r) => {
    const inst = store.instruments.find(i => i.id === r.instrumentId);
    return acc + (inst?.amount || 0);
  }, 0);

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">Directorate of Approvals & Financial Sanctions</div>
          <h1>Approving Authority Console</h1>
          <p>
            Independent adjudication of eligible release and refund requests. Mandatory written decision justification required.
          </p>
        </div>

        <div className="inline-actions">
          <Link
            to="/app/releases"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowDownToLine size={16} /> Open Release Requests
          </Link>
          <Link
            to="/app/audit"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} /> Sanction Audit Trail
          </Link>
        </div>
      </div>

      {/* Governance Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            Approving Dignitary: <strong>{store.currentUser.name}</strong> · Financial Sanctions Authority
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Pending Financial Exposure: <strong>{formatMoney(pendingReleaseSum)}</strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MetricCard
          label="Awaiting Sanction"
          value={awaitingApproval.length}
          note="Scrutiny complete; ready for decision"
          icon={<Clock3 size={18} />}
          tone={awaitingApproval.length > 0 ? 'warning' : 'default'}
          accent={awaitingApproval.length > 0}
          onClick={() => navigate('/app/releases')}
        />

        <MetricCard
          label="In Scrutiny / Review"
          value={underReview.length}
          note="Under official examination"
          icon={<ShieldCheck size={18} />}
          tone="info"
        />

        <MetricCard
          label="Approved Sanctions"
          value={approvedRequests.length}
          note="Sanctioned release decisions"
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />

        <MetricCard
          label="Rejected Requests"
          value={rejectedRequests.length}
          note="Declined with written reason"
          icon={<AlertTriangle size={18} />}
          tone="danger"
        />
      </div>

      {/* 2-Column Approvals Area */}
      <div className="dashboard-grid">
        {/* Left: Release Requests Awaiting Sanction */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Release Requests Awaiting Your Sanction
              </h2>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                Vetted by scrutiny cell and awaiting final administrative authorization
              </small>
            </div>
            <Link to="/app/releases" className="table-link tiny">
              View all requests →
            </Link>
          </div>

          {awaitingApproval.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Linked Instrument</th>
                    <th>Institution</th>
                    <th>Principal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {awaitingApproval.map(r => {
                    const inst = store.instruments.find(i => i.id === r.instrumentId);
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.id}</strong>
                          <div className="muted tiny">{formatDate(r.createdAt)}</div>
                        </td>
                        <td>
                          <Link to={`/app/fdr/${r.instrumentId}`} className="table-link" style={{ fontWeight: 600 }}>
                            {r.instrumentId}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)' }}>{inst?.institution || 'Unknown'}</div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>
                            {inst ? formatMoney(inst.amount) : '—'}
                          </strong>
                        </td>
                        <td>
                          <Link to="/app/releases" className="btn btn-primary btn-small" style={{ fontSize: '11px' }}>
                            Render Decision
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted" style={{ padding: '20px', margin: 0 }}>
              No release requests currently awaiting approval.
            </p>
          )}
        </section>

        {/* Right: Recent Sanction History & Guardrails */}
        <div className="stack">
          {/* Recent Decisions */}
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Recent Decision Activity
              </h2>
              <Link to="/app/audit" className="table-link tiny">
                Audit log →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...approvedRequests, ...rejectedRequests].slice(0, 4).map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                      {req.id} · {req.status}
                    </strong>
                    <span className={`status ${req.status === 'Approved' ? 'success' : 'danger'}`}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Instrument: <strong>{req.instrumentId}</strong> · Decided by: {req.decidedBy || 'Authority'}
                  </div>
                  {req.decisionReason && (
                    <div style={{ fontSize: '11px', marginTop: '4px', fontStyle: 'italic', color: 'var(--color-text)' }}>
                      "{req.decisionReason}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Legal Guardrails Notice */}
          <section className="panel" style={{ background: 'var(--color-surface-subtle)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
              Sanctioning Principles
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              1. Regulatory approval grants formal administrative release. It does not represent an automated interbank NEFT/RTGS transaction.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              2. Separation of duties strictly prohibits an authority from creating FDR submissions or approving requests without prior scrutiny sign-off.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. SYSTEM ADMINISTRATOR DASHBOARD
   ========================================================================= */
function SystemAdminDashboard() {
  const store = useStore();
  const navigate = useNavigate();

  const totalUsers = store.users.length;
  const totalAuditEvents = store.audit.length;
  const totalInstruments = store.instruments.length;
  const totalRequests = store.requests.length;

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">Technical Operations & Governance</div>
          <h1>System Administrator Dashboard</h1>
          <p>
            Technical administration, reminder thresholds, demonstration account roles, and system-wide audit integrity.
          </p>
        </div>

        <div className="inline-actions">
          <Link
            to="/app/users"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={16} /> User & Role Management
          </Link>
          <Link
            to="/app/settings"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={16} /> Notification Thresholds
          </Link>
        </div>
      </div>

      {/* Admin Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            System Administrator: <strong>{store.currentUser.name}</strong> · Technical Division
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Authority Boundary: Technical oversight only. No financial release or verification sign-off authority.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MetricCard
          label="Registered Demo Users"
          value={totalUsers}
          note="Across 4 operational personas"
          icon={<Users size={18} />}
          onClick={() => navigate('/app/users')}
        />

        <MetricCard
          label="Audit Log Volume"
          value={totalAuditEvents}
          note="Recorded regulatory mutations"
          icon={<History size={18} />}
          onClick={() => navigate('/app/audit')}
        />

        <MetricCard
          label="Monitored Instruments"
          value={totalInstruments}
          note="Total repository records"
          icon={<Wallet size={18} />}
          onClick={() => navigate('/app/repository')}
        />

        <MetricCard
          label="Active Reminder Thresholds"
          value={`[${store.thresholds.join(', ')}]d`}
          note="Configurable alert days"
          icon={<CalendarClock size={18} />}
          onClick={() => navigate('/app/settings')}
        />
      </div>

      {/* 2-Column Administrative Area */}
      <div className="dashboard-grid">
        {/* Left: Persona & Access Directory */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Demonstration Users & Personas
              </h2>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                Account directory and access scope definitions
              </small>
            </div>
            <Link to="/app/users" className="table-link tiny">
              Manage Users →
            </Link>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Assigned Scope</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {store.users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <div className="muted tiny">{u.id}</div>
                    </td>
                    <td>
                      <span className="status info">{u.role}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>
                        {u.role === 'Institution User' ? u.institutionId : 'Central AICTE'}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '11px' }}>{u.email || '—'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Recent Audit Events & Reset Controls */}
        <div className="stack">
          {/* Recent Audit Events */}
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                Recent Audit Trail Stream
              </h2>
              <Link to="/app/audit" className="table-link tiny">
                View all logs →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.audit.slice(0, 5).map(ev => (
                <div
                  key={ev.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                      {ev.action}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {formatDate(ev.timestamp)}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Actor: <strong>{ev.actor}</strong> ({ev.role})
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-text)' }}>
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Demo Reset */}
          <section className="panel" style={{ background: 'var(--color-surface-subtle)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
              Demo State Management
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Reset application state to default initial seed instruments, requests, and notifications.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                if (window.confirm('Reset all demo records and restored initial state?')) {
                  store.reset();
                  alert('Demonstration dataset reset to initial state.');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} /> Reset Demonstration State
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN DASHBOARD COMPONENT DISPATCHER
   ========================================================================= */
export function DashboardPage() {
  const store = useStore();

  switch (store.role) {
    case 'Institution User':
      return <InstitutionDashboard />;
    case 'AICTE Reviewing Official':
      return <ReviewingOfficialDashboard />;
    case 'Approving Authority':
      return <ApprovingAuthorityDashboard />;
    case 'System Administrator':
    default:
      return <SystemAdminDashboard />;
  }
}

export default DashboardPage;
