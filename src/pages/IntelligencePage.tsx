import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  ShieldCheck,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  CalendarClock,
  Layers,
  Scale,
  Building2,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  LockKeyhole,
  History,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../context/Store';
import { visibleInstruments, visibleRequests, formatMoney, formatDate, can } from '../utils/logic';
import {
  analyzeFdrIntelligence,
  type SeverityLevel,
  type ValidationFinding,
  type MaturityBucket
} from '../utils/intelligence';
import { MetricCard } from '../components/MetricCard';
import { AccessDenied } from '../components/AccessDenied';

export function IntelligencePage() {
  const store = useStore();
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. STRICT ROUTE-LEVEL AUTHORIZATION ENFORCEMENT
  // ──────────────────────────────────────────────────────────────────────────
  // Institution User: Access forbidden (must use their own dashboard & repository)
  // System Administrator: Technical monitoring only (financial intelligence segregated)
  if (!can(store.role, 'canViewIntelligence')) {
    return (
      <AccessDenied
        requiredPermission="canViewIntelligence"
        message={
          store.role === 'Institution User'
            ? 'FDR Intelligence is an administrative compliance and sanctioning console restricted to regulatory officials. Affiliated institutions manage their FDR submissions, clarification requests, and renewals through the Institutional Desk.'
            : 'System Administrators oversee technical operations, user administration, and system governance. Financial and compliance intelligence is strictly restricted to Scrutiny Reviewers and Sanctioning Authorities to maintain separation of duties.'
        }
      />
    );
  }

  // Scoped data access strictly respecting RBAC
  const scopedInstruments = visibleInstruments(store);
  const scopedRequests = visibleRequests(store);

  // Compute intelligence dynamically from real application data
  const summary = useMemo(() => {
    return analyzeFdrIntelligence(scopedInstruments, scopedRequests, store.role);
  }, [scopedInstruments, scopedRequests, store.role]);

  const isReviewer = store.role === 'AICTE Reviewing Official';
  const isApprover = store.role === 'Approving Authority';

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'maturity' | 'replacement' | 'methodology'>('overview');

  // Filter states for Smart Validation Engine (Reviewer) / Discrepancy Oversight (Approver)
  const [severityFilter, setSeverityFilter] = useState<'ALL' | SeverityLevel>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Maturity intelligence bucket filter
  const [maturityBucketFilter, setMaturityBucketFilter] = useState<'ALL' | MaturityBucket>('ALL');
  const [maturitySort, setMaturitySort] = useState<'days-asc' | 'days-desc' | 'amount-desc'>('days-asc');

  // Filtered validation findings
  const filteredFindings = useMemo(() => {
    return summary.findings.filter(f => {
      if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
      if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchFdr = f.fdrNumber.toLowerCase().includes(q);
        const matchInst = f.institution.toLowerCase().includes(q);
        const matchIssue = f.issue.toLowerCase().includes(q);
        if (!matchFdr && !matchInst && !matchIssue) return false;
      }
      return true;
    });
  }, [summary.findings, severityFilter, categoryFilter, searchQuery]);

  // Flattened maturity items for display
  const allMaturityItems = useMemo(() => {
    const list = [
      ...summary.maturityBreakdown.matured,
      ...summary.maturityBreakdown.within7Days,
      ...summary.maturityBreakdown.within30Days,
      ...summary.maturityBreakdown.within60Days,
      ...summary.maturityBreakdown.onSchedule
    ];

    let filtered = list;
    if (maturityBucketFilter !== 'ALL') {
      filtered = list.filter(m => m.bucket === maturityBucketFilter);
    }

    return filtered.sort((a, b) => {
      if (maturitySort === 'days-asc') return a.daysRemaining - b.daysRemaining;
      if (maturitySort === 'days-desc') return b.daysRemaining - a.daysRemaining;
      if (maturitySort === 'amount-desc') return b.instrument.amount - a.instrument.amount;
      return 0;
    });
  }, [summary.maturityBreakdown, maturityBucketFilter, maturitySort]);

  // Approver-specific metrics
  const releaseRequests = scopedRequests.filter(r => r.kind === 'Release');
  const awaitingApprovalRequests = releaseRequests.filter(r => r.status === 'Awaiting Approval');
  const approvedSanctionsCount = releaseRequests.filter(r => r.status === 'Approved').length;

  const totalAwaitingSanctionAmount = awaitingApprovalRequests.reduce((sum, req) => {
    const inst = scopedInstruments.find(i => i.id === req.instrumentId);
    return sum + (inst?.amount || 0);
  }, 0);

  const totalMaturedExposure = scopedInstruments
    .filter(i => i.lifecycle !== 'Released' && i.lifecycle !== 'Archived')
    .reduce((sum, i) => sum + i.amount, 0);

  const activeDiscrepancyInstruments = scopedInstruments.filter(
    i => i.verification === 'Discrepancy Found' || i.verification === 'Correction Required'
  );

  return (
    <div className="content">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">
            {isApprover
              ? 'Directorate of Approvals & Financial Sanctions / Intelligence'
              : 'AICTE Bureau of Scrutiny & Verification / Intelligence'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>
              {isApprover ? 'FDR Intelligence – Sanctions & Exposure Console' : 'FDR Intelligence – Review & Scrutiny Engine'}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isApprover ? 'var(--color-surface-ivory)' : 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              {isApprover ? 'Approval Focus' : 'Scrutiny Focus'}
            </span>
          </div>
          <p style={{ marginTop: '6px' }}>
            {isApprover ? (
              <>
                Financial exposure monitoring, maturity horizons, compliance sign-offs, and adjudication oversight across all registered deposit records.
              </>
            ) : (
              <>
                Comprehensive regulatory screening, duplicate detection, metadata validation, and predecessor-to-successor lineage tracking.
              </>
            )}
          </p>
        </div>

        {/* Role-Specific Header Actions */}
        <div className="inline-actions">
          {isReviewer && (
            <>
              <Link to="/app/verification" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Open Scrutiny Queue
              </Link>
              <Link to="/app/audit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} /> Audit Trail
              </Link>
            </>
          )}

          {isApprover && (
            <>
              <Link to="/app/releases" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={16} /> Pending Sanctions ({awaitingApprovalRequests.length})
              </Link>
              <Link to="/app/audit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} /> Sanction Audit Trail
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Operational Scope Indicator ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit size={18} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            Operating Authority: <strong>{store.currentUser.name}</strong> ({store.role})
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {isApprover ? (
            <>Pending Release Financial Exposure: <strong>{formatMoney(totalAwaitingSanctionAmount)}</strong></>
          ) : (
            <>Portfolio Coverage: <strong>{summary.totalAnalyzed} FDR Records Evaluated</strong></>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ROLE-SPECIFIC OVERVIEW METRICS                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isReviewer ? (
        /* Reviewer Metrics: Comprehensive Operational & Compliance Checks */
        <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
          <MetricCard
            label="Total Records Analysed"
            value={summary.totalAnalyzed}
            note="System-wide repository scope"
            icon={<BrainCircuit size={18} />}
            onClick={() => setActiveTab('overview')}
          />

          <MetricCard
            label="Requires Attention"
            value={summary.recordsRequiringAttention}
            note="Compliance or date items"
            icon={<AlertTriangle size={18} />}
            tone={summary.recordsRequiringAttention > 0 ? 'warning' : 'default'}
            accent={summary.recordsRequiringAttention > 0}
            onClick={() => setActiveTab('validation')}
          />

          <MetricCard
            label="Upcoming Maturities"
            value={summary.upcomingMaturitiesCount}
            note="Within 60d or matured"
            icon={<CalendarClock size={18} />}
            tone={summary.upcomingMaturitiesCount > 0 ? 'warning' : 'default'}
            onClick={() => setActiveTab('maturity')}
          />

          <MetricCard
            label="Duplicate Number Flags"
            value={summary.potentialDuplicatesCount}
            note="Identical FDR conflicts"
            icon={<Copy size={18} />}
            tone={summary.potentialDuplicatesCount > 0 ? 'danger' : 'default'}
            accent={summary.potentialDuplicatesCount > 0}
            onClick={() => {
              setActiveTab('validation');
              setCategoryFilter('Duplicate');
            }}
          />

          <MetricCard
            label="Incomplete Submissions"
            value={summary.incompleteSubmissionsCount}
            note="Missing metadata or docs"
            icon={<FileText size={18} />}
            tone={summary.incompleteSubmissionsCount > 0 ? 'warning' : 'default'}
            onClick={() => {
              setActiveTab('validation');
              setCategoryFilter('Document Metadata');
            }}
          />

          <MetricCard
            label="Pending Scrutiny"
            value={summary.pendingScrutinyCount}
            note="Awaiting review sign-off"
            icon={<Clock3 size={18} />}
            tone="info"
            onClick={() => navigate('/app/verification')}
          />
        </div>
      ) : (
        /* Approving Authority Metrics: Sanctions, Exposure & Discrepancies */
        <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: '24px' }}>
          <MetricCard
            label="Awaiting Release Sanction"
            value={awaitingApprovalRequests.length}
            note="Vetted by scrutiny; ready for decision"
            icon={<Clock3 size={18} />}
            tone={awaitingApprovalRequests.length > 0 ? 'warning' : 'default'}
            accent={awaitingApprovalRequests.length > 0}
            onClick={() => navigate('/app/releases')}
          />

          <MetricCard
            label="Pending Financial Sanction"
            value={formatMoney(totalAwaitingSanctionAmount)}
            note="Capital release exposure"
            icon={<Scale size={18} />}
            tone={totalAwaitingSanctionAmount > 0 ? 'info' : 'default'}
            onClick={() => navigate('/app/releases')}
          />

          <MetricCard
            label="Active Portfolio Principal"
            value={formatMoney(totalMaturedExposure)}
            note="Total unreleased deposits"
            icon={<Layers size={18} />}
          />

          <MetricCard
            label="Active Discrepancies Flagged"
            value={activeDiscrepancyInstruments.length}
            note="Release eligibility withheld"
            icon={<AlertTriangle size={18} />}
            tone={activeDiscrepancyInstruments.length > 0 ? 'danger' : 'default'}
            accent={activeDiscrepancyInstruments.length > 0}
            onClick={() => {
              setActiveTab('validation');
              setCategoryFilter('Data Consistency');
            }}
          />

          <MetricCard
            label="Sanctions Approved"
            value={approvedSanctionsCount}
            note="Formally discharged deposits"
            icon={<CheckCircle2 size={18} />}
            tone="success"
            onClick={() => navigate('/app/releases')}
          />
        </div>
      )}

      {/* ── Module Tabs ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '24px',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-muted)'
          }}
        >
          {isApprover ? 'Sanction Overview & Indicators' : `Overview & Risk Indicators (${summary.riskIndicators.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validation')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'validation' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'validation' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isApprover ? 'Compliance & Discrepancy Oversight' : 'Smart Validation Engine'}
          {summary.findings.length > 0 && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: summary.findings.some(f => f.severity === 'Critical') ? 'var(--color-danger)' : 'var(--color-warning)',
                color: '#FFFFFF'
              }}
            >
              {summary.findings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maturity')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'maturity' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'maturity' ? 'var(--color-primary)' : 'var(--color-text-muted)'
          }}
        >
          {isApprover ? 'Maturity & Release Horizons' : `Maturity Intelligence (${summary.upcomingMaturitiesCount})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('replacement')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'replacement' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'replacement' ? 'var(--color-primary)' : 'var(--color-text-muted)'
          }}
        >
          Replacement Lineage ({summary.replacementItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('methodology')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'methodology' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'methodology' ? 'var(--color-primary)' : 'var(--color-text-muted)'
          }}
        >
          Governance & Segregation
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & INDICATORS                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="stack" style={{ gap: '20px' }}>
          {/* Regulatory Disclaimer Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-ivory)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.5 }}>
              {isApprover ? (
                <>
                  <strong>Sanction Adjudication Notice:</strong> As Approving Authority, you hold independent financial release authority.
                  Administrative document scrutiny and bank confirmation validation are strictly segregated to Reviewing Officials.
                  Only release requests with complete compliance clearance should be sanctioned.
                </>
              ) : (
                <>
                  <strong>Deterministic Scrutiny Notice:</strong> The indicators below represent deterministic, rule-based regulatory checks derived from active repository records.
                  Administrative scrutiny and independent physical bank confirmation remain mandatory separate processes.
                </>
              )}
            </div>
          </div>

          {/* Section C: Risk & Attention Indicators Table */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  {isApprover ? 'Regulatory Compliance & Exposure Indicators' : 'Institutional Risk & Attention Indicators'}
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Rule-based classification showing the explicit justification behind every indicator
                </small>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('validation')}
                className="table-link tiny"
              >
                {isApprover ? 'View discrepancy details →' : 'View all validation findings →'}
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Attention Level</th>
                    <th>FDR Record</th>
                    <th>Institution</th>
                    <th>Principal Amount</th>
                    <th>Primary Classification Justification</th>
                    <th>Recommended Next Action</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.riskIndicators.map(ind => {
                    const badgeClass =
                      ind.severity === 'Critical'
                        ? 'danger'
                        : ind.severity === 'High'
                        ? 'danger'
                        : ind.severity === 'Medium'
                        ? 'warning'
                        : 'success';

                    return (
                      <tr key={ind.instrumentId}>
                        <td>
                          <span className={`status ${badgeClass}`} style={{ fontWeight: 600 }}>
                            {ind.severity}
                          </span>
                        </td>
                        <td>
                          <Link to={`/app/fdr/${ind.instrumentId}`} className="table-link" style={{ fontWeight: 600 }}>
                            {ind.instrumentId}
                          </Link>
                          <div className="muted tiny">{ind.fdrNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{ind.institution}</div>
                          <div className="muted tiny">{ind.institutionId}</div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{formatMoney(ind.amount)}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {ind.primaryReason}
                          </div>
                          <div className="muted tiny" style={{ marginTop: '2px', maxWidth: '340px' }}>
                            {ind.details[0]}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                            {/* If Approver, ensure only approval-appropriate recommendations appear */}
                            {isApprover
                              ? ind.severity === 'Critical' || ind.severity === 'High'
                                ? 'Withhold release sanction pending scrutiny clearance.'
                                : 'Monitor release eligibility upon maturity.'
                              : ind.recommendedAction}
                          </div>
                        </td>
                        <td>
                          {isApprover ? (
                            <Link
                              to={`/app/fdr/${ind.instrumentId}`}
                              className="btn btn-secondary btn-small"
                              style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                            >
                              Inspect Record
                            </Link>
                          ) : (
                            <Link
                              to={ind.actionRoute}
                              className="btn btn-secondary btn-small"
                              style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                            >
                              {ind.actionLabel}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section F: Contextual Recommended Actions Split */}
          <div className="dashboard-grid">
            {/* Left: Operational Directives Tailored by Role */}
            <section className="panel">
              <div className="panel-head">
                <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                  {isApprover ? 'Sanctioning Directives & Exposure Oversight' : 'Scrutiny Cell Operational Directives'}
                </h3>
                <span className="muted tiny">Role: {store.role}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isApprover ? (
                  /* Approval-Only Recommendations */
                  <>
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Adjudicate Vetted Release Requests</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {awaitingApprovalRequests.length} release requests have completed scrutiny verification and await your formal sanction decision.
                      </p>
                      <Link to="/app/releases" className="table-link tiny">Open Sanctions Queue →</Link>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Withhold Sanction on Discrepancy Records</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {activeDiscrepancyInstruments.length} records have active scrutiny discrepancies. Regulatory rules prohibit financial discharge prior to reviewer sign-off.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('validation'); setCategoryFilter('Data Consistency'); }}
                        className="table-link tiny"
                        style={{ border: 'none', background: 'none', padding: 0 }}
                      >
                        Inspect Flagged Instruments →
                      </button>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Monitor Matured Financial Exposure</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Assess portfolio value of security deposits reaching statutory maturity across all institutions.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('maturity')}
                        className="table-link tiny"
                        style={{ border: 'none', background: 'none', padding: 0 }}
                      >
                        Examine Maturity Horizon Schedule →
                      </button>
                    </div>
                  </>
                ) : (
                  /* Reviewer-Only Recommendations */
                  <>
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Priority Scrutiny Assignment</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {summary.pendingScrutinyCount} unverified records pending examination of bank seals and joint lien endorsements.
                      </p>
                      <Link to="/app/verification" className="table-link tiny">Go to Scrutiny Cell Queue →</Link>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Duplicate Instrument Investigation</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {summary.potentialDuplicatesCount} potential duplicate FDR numbers flagged. Cross-examine branch codes and customer copies.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('validation'); setCategoryFilter('Duplicate'); }}
                        className="table-link tiny"
                        style={{ border: 'none', background: 'none', padding: 0 }}
                      >
                        Filter Duplicate Findings →
                      </button>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                      <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Incomplete Metadata Clarifications</strong>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {summary.incompleteSubmissionsCount} submissions lack required issuance certificate or mandatory field data.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('validation'); setCategoryFilter('Document Metadata'); }}
                        className="table-link tiny"
                        style={{ border: 'none', background: 'none', padding: 0 }}
                      >
                        Inspect Missing Document Records →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Right: Successor Lineage Snapshot */}
            <section className="panel">
              <div className="panel-head">
                <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                  Successor Lineage Snapshot
                </h3>
                <button type="button" onClick={() => setActiveTab('replacement')} className="table-link tiny">
                  Full lineage ({summary.replacementItems.length}) →
                </button>
              </div>

              {summary.replacementItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary.replacementItems.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                        background: 'var(--color-surface-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {item.originalId} &rarr; {item.replacementId}
                        </span>
                        <span className="status success" style={{ fontSize: '10px' }}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {item.institution} · {formatMoney(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ padding: '16px', margin: 0 }}>
                  No replacement chains registered in the current operational scope.
                </p>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: SMART VALIDATION / DISCREPANCY OVERSIGHT              */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'validation' && (
        <div className="stack" style={{ gap: '20px' }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by FDR, institution, or issue..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 30px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-input-border)',
                    width: '260px'
                  }}
                />
              </div>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as any)}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-input-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical Severity</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-input-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="ALL">All Rule Categories</option>
                <option value="Duplicate">Duplicate FDR Conflicts</option>
                <option value="Mandatory Field">Mandatory Field Omissions</option>
                <option value="Date Sequence">Chronological Sequence</option>
                <option value="Document Metadata">Document Metadata</option>
                <option value="Data Consistency">Consistency & Scrutiny</option>
                <option value="Replacement Linkage">Replacement Linkage</option>
              </select>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Showing <strong>{filteredFindings.length}</strong> of {summary.findings.length} findings
            </div>
          </div>

          {/* Findings Table */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  {isApprover ? 'Compliance & Scrutiny Discrepancies Log' : 'Smart Validation Findings Log'}
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  {isApprover
                    ? 'Audit view of compliance findings affecting release eligibility. Scrutiny clearance must be granted by Reviewing Officials.'
                    : 'Transparent automated check findings. Findings do not automatically approve or reject any FDR.'}
                </small>
              </div>
            </div>

            {filteredFindings.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Category</th>
                      <th>FDR Record</th>
                      <th>Institution</th>
                      <th>Issue Detected</th>
                      <th>Explanation</th>
                      <th>Suggested Action</th>
                      <th>Current Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFindings.map(f => {
                      const badgeClass =
                        f.severity === 'Critical'
                          ? 'danger'
                          : f.severity === 'High'
                          ? 'danger'
                          : f.severity === 'Medium'
                          ? 'warning'
                          : 'info';

                      return (
                        <tr key={f.id}>
                          <td>
                            <span className={`status ${badgeClass}`} style={{ fontWeight: 600 }}>
                              {f.severity}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                              {f.category}
                            </span>
                          </td>
                          <td>
                            <Link to={`/app/fdr/${f.instrumentId}`} className="table-link" style={{ fontWeight: 600 }}>
                              {f.instrumentId}
                            </Link>
                            <div className="muted tiny">{f.fdrNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{f.institution}</div>
                            <div className="muted tiny">{f.institutionId}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                              {f.issue}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', maxWidth: '280px', lineHeight: 1.4 }}>
                              {f.explanation}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                              {/* If Approver, show approval directive */}
                              {isApprover
                                ? 'Withhold release sanction until Reviewing Official verifies clearance.'
                                : f.suggestedAction}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status ${
                                f.currentStatus === 'Verified by Authorized Reviewer'
                                  ? 'success'
                                  : f.currentStatus === 'Discrepancy Found'
                                  ? 'danger'
                                  : 'warning'
                              }`}
                            >
                              {f.currentStatus}
                            </span>
                          </td>
                          <td>
                            {isApprover ? (
                              <Link
                                to={`/app/fdr/${f.instrumentId}`}
                                className="btn btn-secondary btn-small"
                                style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                              >
                                View Record &rarr;
                              </Link>
                            ) : (
                              <Link
                                to={f.actionRoute}
                                className="btn btn-secondary btn-small"
                                style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                              >
                                {f.actionLabel} &rarr;
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px', color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>
                  No Matching Findings
                </h3>
                <p className="muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>
                  All evaluated records within this filter selection satisfy the corresponding validation rules.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 3: MATURITY INTELLIGENCE                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'maturity' && (
        <div className="stack" style={{ gap: '20px' }}>
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
              <strong>Maturity Governance Principle:</strong> Reaching maturity is a scheduled operational event, not a compliance violation.
              Institutions have statutory windows to initiate renewals or request lien discharge.
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Active Notification Thresholds: <strong>[{store.thresholds.join(', ')}] Days</strong>
            </div>
          </div>

          {/* Bucket Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMaturityBucketFilter('ALL')}
                className={`btn btn-small ${maturityBucketFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Monitored ({allMaturityItems.length})
              </button>

              <button
                type="button"
                onClick={() => setMaturityBucketFilter('Already Matured')}
                className={`btn btn-small ${maturityBucketFilter === 'Already Matured' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Already Matured ({summary.maturityBreakdown.matured.length})
              </button>

              <button
                type="button"
                onClick={() => setMaturityBucketFilter('Within 7 Days')}
                className={`btn btn-small ${maturityBucketFilter === 'Within 7 Days' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Within 7 Days ({summary.maturityBreakdown.within7Days.length})
              </button>

              <button
                type="button"
                onClick={() => setMaturityBucketFilter('Within 30 Days')}
                className={`btn btn-small ${maturityBucketFilter === 'Within 30 Days' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Within 30 Days ({summary.maturityBreakdown.within30Days.length})
              </button>

              <button
                type="button"
                onClick={() => setMaturityBucketFilter('Within 60 Days')}
                className={`btn btn-small ${maturityBucketFilter === 'Within 60 Days' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Within 60 Days ({summary.maturityBreakdown.within60Days.length})
              </button>

              <button
                type="button"
                onClick={() => setMaturityBucketFilter('No Immediate Concern')}
                className={`btn btn-small ${maturityBucketFilter === 'No Immediate Concern' ? 'btn-primary' : 'btn-secondary'}`}
              >
                On Schedule ({summary.maturityBreakdown.onSchedule.length})
              </button>
            </div>

            <select
              value={maturitySort}
              onChange={e => setMaturitySort(e.target.value as any)}
              style={{
                padding: '6px 10px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-input-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            >
              <option value="days-asc">Maturity Date: Soonest First</option>
              <option value="days-desc">Maturity Date: Furthest First</option>
              <option value="amount-desc">Principal Amount: Highest First</option>
            </select>
          </div>

          {/* Maturity Table */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  {isApprover ? 'Maturity Schedule & Financial Commitments' : 'Maturity Horizon Schedule'}
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Live day-boundary calculation against statutory renewal and release windows
                </small>
              </div>
            </div>

            {allMaturityItems.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Instrument ID</th>
                      <th>FDR Number</th>
                      <th>Institution</th>
                      <th>Bank & Branch</th>
                      <th>Principal</th>
                      <th>Maturity Date</th>
                      <th>Status Timeline</th>
                      <th>Lifecycle</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMaturityItems.map(item => (
                      <tr key={item.instrument.id}>
                        <td>
                          <Link to={`/app/fdr/${item.instrument.id}`} className="table-link" style={{ fontWeight: 600 }}>
                            {item.instrument.id}
                          </Link>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px' }}>{item.instrument.fdrNumber}</code>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{item.instrument.institution}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)' }}>{item.instrument.bank}</div>
                          <div className="muted tiny">{item.instrument.branch}</div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{formatMoney(item.instrument.amount)}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{formatDate(item.instrument.maturityDate)}</div>
                        </td>
                        <td>
                          <span className={`status ${item.tone}`} style={{ fontWeight: 600 }}>
                            {item.statusLabel}
                          </span>
                        </td>
                        <td>
                          <span className="status info" style={{ fontSize: '10px' }}>
                            {item.instrument.lifecycle}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/app/fdr/${item.instrument.id}`}
                            className="table-link tiny"
                          >
                            Inspect &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ padding: '24px', margin: 0, textAlign: 'center' }}>
                No instruments in the selected maturity bucket.
              </p>
            )}
          </section>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 4: REPLACEMENT LINEAGE                                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'replacement' && (
        <div className="stack" style={{ gap: '20px' }}>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                  Replacement & Renewal Lineage Ledger
                </h2>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Pedigree tracking linking predecessor fixed deposits to successor instruments and preserving audit trails
                </small>
              </div>
            </div>

            {summary.replacementItems.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Original (Predecessor)</th>
                      <th>Successor (Replacement)</th>
                      <th>Institution</th>
                      <th>Principal</th>
                      <th>Predecessor Maturity</th>
                      <th>Successor Issue Date</th>
                      <th>Successor Maturity</th>
                      <th>Linkage Status</th>
                      <th>History Lineage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.replacementItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <Link to={`/app/fdr/${item.originalId}`} className="table-link" style={{ fontWeight: 600 }}>
                            {item.originalId}
                          </Link>
                          <div className="muted tiny">{item.originalFdrNumber}</div>
                        </td>
                        <td>
                          <Link to={`/app/fdr/${item.replacementId}`} className="table-link" style={{ fontWeight: 600 }}>
                            {item.replacementId}
                          </Link>
                          <div className="muted tiny">{item.replacementFdrNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{item.institution}</div>
                          <div className="muted tiny">{item.institutionId}</div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{formatMoney(item.amount)}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)' }}>{formatDate(item.originalMaturityDate)}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)' }}>{formatDate(item.replacementIssueDate)}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)' }}>{formatDate(item.replacementMaturityDate)}</div>
                        </td>
                        <td>
                          <span className="status success" style={{ fontWeight: 600 }}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', maxWidth: '240px', lineHeight: 1.3 }}>
                            {item.historySummary}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <Layers size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px', color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>
                  No Replacement Lineage Found
                </h3>
                <p className="muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>
                  No successor instruments have been linked via the renewal or replacement workflow in this scope.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 5: METHODOLOGY & SEGREGATION OF DUTIES                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'methodology' && (
        <div className="stack" style={{ gap: '20px' }}>
          <section className="panel">
            <div className="panel-head">
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                FDR Guardian Intelligence Methodology & Segregation of Duties
              </h2>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.6 }}>
                The FDR Intelligence module is designed as an institutional compliance validation and tracking system.
                It enforces transparency and consistency across security deposit records without black-box machine learning or simulated live interbank capabilities.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '8px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: '6px' }}>
                    1. Automated Data Validation
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Deterministic rule screening checking duplicate FDR numbers, mandatory field presence, chronological date sequence, and document metadata completeness.
                    Does not auto-approve or reject.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: '6px' }}>
                    2. Administrative Scrutiny
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Human examination conducted exclusively by authorized AICTE Reviewing Officials. Reviewers verify joint beneficiary lien clauses, branch authorized signatory seals, and sanction limits.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: '6px' }}>
                    3. Independent Verification
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Formal confirmation from issuing bank branches. The portal tracks confirmation letter metadata and status without asserting automated core banking (CBS/SFMS) integration.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: '6px' }}>
                    4. Financial Sanction
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Segregated authority boundary restricted to the Approving Authority. Approves or declines statutory release requests with mandatory written justification and immutable audit logging.
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-ivory)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5
                }}
              >
                <strong>Strict Segregation of Duties Enforced:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  <li><strong>Institution Users:</strong> Cannot access FDR Intelligence; manage their records via the Institutional Desk.</li>
                  <li><strong>System Administrators:</strong> Retain technical management; cannot access financial intelligence or approval decisions.</li>
                  <li><strong>Reviewing Officials:</strong> Perform administrative scrutiny; cannot approve financial releases.</li>
                  <li><strong>Approving Authorities:</strong> Sanction releases; cannot perform administrative scrutiny or alter FDR submissions.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default IntelligencePage;
