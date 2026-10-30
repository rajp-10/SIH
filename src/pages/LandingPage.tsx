import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  ShieldCheck,
  FileText,
  CalendarClock,
  ClipboardCheck,
  History,
  LockKeyhole,
  FileCheck2,
  Scale,
  CheckCircle2,
  ArrowUpRight,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/Store';
import { formatMoney, formatDate } from '../utils/logic';

export function LandingPage() {
  const navigate = useNavigate();
  const store = useStore();
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      step: 1,
      title: 'FDR Submission',
      role: 'Institution User',
      department: 'Institutional Registrar / Finance Office',
      summary: 'Institution uploads deposit receipt, joint lien mandate, and key financial metadata.',
      detail: 'Principal amount, bank details, and institutional reference codes are captured into a structured digital record awaiting regulatory examination.'
    },
    {
      step: 2,
      title: 'Review & Scrutiny',
      role: 'Reviewing Official',
      department: 'Bureau of Scrutiny & Regulatory Verification',
      summary: 'Officials examine certificate terms, verify document metadata, and perform consistency checks.',
      detail: 'Automated rules evaluate duplicate FDR references and valid tenure date ordering. Officials log formal observations, flag discrepancies, or return records for correction.'
    },
    {
      step: 3,
      title: 'Independent Verification',
      role: 'Verification Cell',
      department: 'Designated Regulatory Verification Desk',
      summary: 'Administrative verification sign-off distinguishing human review from external banking confirmation.',
      detail: 'Authorized reviewers record verification outcomes. The system maintains strict separation between internal document scrutiny and external bank confirmation.'
    },
    {
      step: 4,
      title: 'Maturity & Renewal Tracking',
      role: 'Regulatory Engine',
      department: 'Automated Compliance Monitoring',
      summary: 'Calendar-based maturity alerts (90, 60, 30, 7 days) and linked successor FDR registration.',
      detail: 'Institutions receive automated notifications and can initiate non-destructive renewals that preserve predecessor instrument records and audit lineage.'
    },
    {
      step: 5,
      title: 'Release & Refund Decision',
      role: 'Approving Authority',
      department: 'Directorate of Approvals & Financial Sanctions',
      summary: 'Strict segregation of duties for deposit release with mandatory written justifications.',
      detail: 'Institutions cannot approve their own release. Approving authorities review scrutiny findings and record binding administrative decisions.'
    }
  ];

  const totalPortfolioAmount = store.instruments.reduce((sum, i) => sum + i.amount, 0);
  const pendingScrutinyCount = store.instruments.filter(i =>
    ['Pending', 'Under Review', 'Correction Required'].includes(i.verification)
  ).length;
  const activeCount = store.instruments.filter(i => i.lifecycle === 'Active').length;

  const scrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    const elem = document.getElementById('workflow');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* ── 1. MINIMAL INSTITUTIONAL NAVBAR ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(20px, 4vw, 56px)',
          height: '64px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* LEFT: FDR Guardian logo and name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Landmark size={18} />
          </div>
          <div>
            <span
              style={{
                fontWeight: 750,
                fontSize: '16px',
                color: 'var(--color-heading)',
                display: 'block',
                lineHeight: 1.2,
                letterSpacing: '-0.015em'
              }}
            >
              FDR Guardian
            </span>
          </div>
        </div>

        {/* RIGHT: Only one Sign In button */}
        <div>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => navigate('/signin')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontWeight: 650
            }}
          >
            <span>Sign In</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── 2. HERO SECTION WITH PROCESS DIAGRAM ── */}
      <section
        style={{
          padding: '52px clamp(20px, 4vw, 56px) 60px',
          background: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '44px',
            alignItems: 'center'
          }}
        >
          {/* Left Column */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-heading)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                border: '1px solid var(--color-border)'
              }}
            >
              <ShieldCheck size={13} color="var(--color-primary)" />
              <span>FDR LIFECYCLE MANAGEMENT</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                fontWeight: 750,
                lineHeight: 1.18,
                color: 'var(--color-heading)',
                margin: '0 0 16px',
                letterSpacing: '-0.02em'
              }}
            >
              Every FDR. Every Stage. Complete Accountability.
            </h1>

            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
                margin: '0 0 26px',
                maxWidth: '520px'
              }}
            >
              A centralized platform for institutional fixed deposit records, verification workflows, maturity monitoring and accountable release management.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/signin')}
                style={{
                  padding: '10px 22px',
                  fontWeight: 650
                }}
              >
                <span>Sign In</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={scrollToWorkflow}
                className="btn btn-secondary"
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                <span>Explore Workflow</span>
              </button>
            </div>

            <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Administrative oversight environment. External bank verification remains an explicit manual or API verification stage.
            </div>
          </div>

          {/* Right Column: Genuine Institutional Process Diagram */}
          <div className="process-diagram">
            <div className="process-diagram-head">
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-secondary)' }}>
                  Institutional Architecture
                </span>
                <h3>5-Stage Regulatory Progression</h3>
              </div>
              <span className="status info" style={{ fontSize: '10px' }}>
                Stage {activeStage + 1} of 5
              </span>
            </div>

            <div className="process-nodes">
              {stages.map((st, idx) => {
                const isActive = activeStage === idx;
                const isLast = idx === stages.length - 1;

                return (
                  <div
                    key={st.title}
                    className={`process-node ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveStage(idx)}
                  >
                    {!isLast && <div className="process-spine" />}

                    <div className="process-badge">
                      {st.step}
                    </div>

                    <div className="process-node-body">
                      <div className="process-node-title">
                        <strong>{st.title}</strong>
                        <span className="process-node-role">{st.role}</span>
                      </div>

                      <div className="process-node-desc">
                        {st.summary}
                      </div>

                      {isActive && (
                        <div
                          style={{
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid var(--color-border)',
                            fontSize: '11px',
                            color: 'var(--color-heading)'
                          }}
                        >
                          <span style={{ fontWeight: 650 }}>Desk: </span>
                          <span>{st.department}</span>
                          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
                            {st.detail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION 1: INSTITUTIONAL PORTFOLIO LEDGER (NOT 4 FLOATING CARDS) ── */}
      <section id="overview" className="section" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">Platform Overview</div>
              <h2>Institutional Deposit Ledger</h2>
            </div>
            <p>
              Consolidated real-time metrics calculated directly from active institutional records and pending regulatory submissions.
            </p>
          </div>

          {/* Unified Ledger Strip */}
          <div className="ledger-strip">
            <div className="ledger-cell">
              <span className="ledger-cell-label">Monitored Portfolio</span>
              <span className="ledger-cell-value">{formatMoney(totalPortfolioAmount)}</span>
              <span className="ledger-cell-sub">Aggregate sanctioned deposits</span>
            </div>

            <div className="ledger-cell">
              <span className="ledger-cell-label">Active Instruments</span>
              <span className="ledger-cell-value">{activeCount}</span>
              <span className="ledger-cell-sub">Compliant & monitored</span>
            </div>

            <div className="ledger-cell">
              <span className="ledger-cell-label">Pending Scrutiny</span>
              <span className="ledger-cell-value" style={{ color: 'var(--color-warning-text)' }}>
                {pendingScrutinyCount}
              </span>
              <span className="ledger-cell-sub">Awaiting reviewer examination</span>
            </div>

            <div className="ledger-cell">
              <span className="ledger-cell-label">Workflow Requests</span>
              <span className="ledger-cell-value">{store.requests.length}</span>
              <span className="ledger-cell-sub">Release & renewal queues</span>
            </div>
          </div>

          {/* Realistic Data Preview Ledger Snippet */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Live Demonstration Ledger Excerpt
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Showing 3 of {store.instruments.length} registered institutional FDRs
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Institution</th>
                    <th>FDR Number</th>
                    <th>Bank & Branch</th>
                    <th>Amount</th>
                    <th>Maturity</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {store.instruments.slice(0, 3).map(inst => (
                    <tr key={inst.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 650 }}>{inst.id}</td>
                      <td>{inst.institution}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{inst.fdrNumber}</td>
                      <td>{inst.bank} ({inst.branch})</td>
                      <td style={{ fontWeight: 600 }}>{formatMoney(inst.amount)}</td>
                      <td>{formatDate(inst.maturityDate)}</td>
                      <td>
                        <span className={`status ${inst.verification === 'Verified by Authorized Reviewer' ? 'success' : inst.verification === 'Discrepancy Found' ? 'danger' : 'warning'}`}>
                          {inst.verification === 'Verified by Authorized Reviewer' ? 'Verified' : inst.verification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION 2: CORE CAPABILITIES (STRUCTURED EDITORIAL MATRIX) ── */}
      <section id="capabilities" className="section" style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">Institutional Governance</div>
              <h2>Core Operational Capabilities</h2>
            </div>
            <p>
              Designed for statutory transparency, role-based segregation, and complete audit reproducibility across institutional deposits.
            </p>
          </div>

          {/* Structured 2-Column Editorial Grid (Not repeating generic cards) */}
          <div className="editorial-grid">
            <div className="editorial-item">
              <div className="editorial-item-header">
                <FileText size={18} color="var(--color-primary)" />
                <h3>Centralized Instrument Repository</h3>
              </div>
              <p>
                Universal registry indexed across institution codes, issuing banks, FDR references, and maturity dates with multi-field search and CSV export.
              </p>
            </div>

            <div className="editorial-item">
              <div className="editorial-item-header">
                <ShieldCheck size={18} color="var(--color-primary)" />
                <h3>Official Reviewer Scrutiny Queue</h3>
              </div>
              <p>
                Authorized officials verify joint lien endorsements, check document metadata, record checklist observations, and flag discrepancies with mandatory reasons.
              </p>
            </div>

            <div className="editorial-item">
              <div className="editorial-item-header">
                <CalendarClock size={18} color="var(--color-primary)" />
                <h3>Date-Derived Maturity Tracking</h3>
              </div>
              <p>
                Automated compliance monitoring tracks calendar maturity dates with configurable notification thresholds (90, 60, 30, and 7 days).
              </p>
            </div>

            <div className="editorial-item">
              <div className="editorial-item-header">
                <ClipboardCheck size={18} color="var(--color-primary)" />
                <h3>Segregated Release & Refund Workflow</h3>
              </div>
              <p>
                Three-tier segregation ensures institutions cannot sanction their own release. Approving authorities must log binding written justifications.
              </p>
            </div>

            <div className="editorial-item">
              <div className="editorial-item-header">
                <History size={18} color="var(--color-primary)" />
                <h3>Non-Destructive Lineage & Audit Trail</h3>
              </div>
              <p>
                Successor instruments link to predecessor records without overwriting historical data. Every state transition is stamped with actor, role, and timestamp.
              </p>
            </div>

            <div className="editorial-item">
              <div className="editorial-item-header">
                <LockKeyhole size={18} color="var(--color-primary)" />
                <h3>Institutional Scope Isolation</h3>
              </div>
              <p>
                Strict RBAC guarantees institution users inspect solely their own records, while central reviewers and approvers maintain system-wide governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SECTION 3: FDR LIFECYCLE WORKFLOW (INSTITUTIONAL PROCESS MATRIX) ── */}
      <section id="workflow" className="section" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">End-to-End Progression</div>
              <h2>FDR Lifecycle Workflow Architecture</h2>
            </div>
            <p>
              How institutional deposits transition from initial submission through regulatory scrutiny, active tenure monitoring, and governed release.
            </p>
          </div>

          <div className="workflow-table">
            <div className="workflow-row header">
              <div>Stage</div>
              <div>Milestone</div>
              <div>Governance & Operational Action</div>
              <div>Regulatory Outcome</div>
            </div>

            {stages.map((st) => (
              <div key={st.title} className="workflow-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--color-powder-blue)',
                      color: 'var(--color-heading)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '11px',
                      fontWeight: 750
                    }}
                  >
                    {st.step}
                  </span>
                </div>

                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-heading)', display: 'block' }}>
                    {st.title}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{st.role}</span>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text)', fontSize: '12px', lineHeight: 1.45 }}>
                    {st.summary}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Responsible: {st.department}
                  </div>
                </div>

                <div>
                  <span className="status info" style={{ fontSize: '10px' }}>
                    {st.step === 1 ? 'Record Created' : st.step === 2 ? 'Scrutiny Recorded' : st.step === 3 ? 'Verification Stamped' : st.step === 4 ? 'Tenure Monitored' : 'Binding Decision'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SECTION 4: GOVERNANCE ARCHITECTURE (COMPARATIVE SPLIT PANEL) ── */}
      <section id="governance" className="section" style={{ background: 'var(--color-background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">Accountability Framework</div>
              <h2>Governance & Integrity Controls</h2>
            </div>
            <p>
              Architectural principles preventing unilateral alterations, preserving historical instrument lineage, and maintaining compliance integrity.
            </p>
          </div>

          <div className="gov-split">
            <div className="gov-panel">
              <h3>
                <Scale size={18} color="var(--color-primary)" />
                Maker-Checker-Approver Separation
              </h3>
              <p>
                Strict role separation ensures institutional finance teams, scrutiny reviewers, and approving authorities operate within distinct statutory boundaries.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                • Institution users cannot approve release requests.<br />
                • Reviewing officials cannot create new FDRs or release deposits.<br />
                • Approving authorities enforce mandatory written justifications.
              </div>
            </div>

            <div className="gov-panel">
              <h3>
                <FileCheck2 size={18} color="var(--color-primary)" />
                Immutable Lineage & Audit Stamping
              </h3>
              <p>
                Deposit renewals register successor instruments linked explicitly to predecessor IDs, preserving prior scrutiny observations and documents intact.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                • Predecessor instruments are never overwritten or deleted.<br />
                • Every status transition logs persona, timestamp, and entity ID.<br />
                • Discrepancy flags and release decisions require written reasons.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. INSTITUTIONAL FOOTER ── */}
      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Landmark size={15} />
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--color-heading)' }}>FDR Guardian</strong>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              Institutional FDR Management Platform
            </span>
          </div>
        </div>

        <div style={{ color: 'var(--color-text-muted)', maxWidth: '480px', lineHeight: 1.4 }}>
          Demonstration software for institutional security deposit lifecycle oversight. Fictional sample records.
        </div>

        <div>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => navigate('/signin')}
            style={{ fontWeight: 650 }}
          >
            <span>Sign In to Platform</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
