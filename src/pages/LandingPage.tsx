import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  Workflow,
  ShieldCheck,
  FileText,
  CalendarClock,
  ClipboardCheck,
  History,
  BarChart3,
  LockKeyhole,
  FileCheck2,
  Scale,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '../context/Store';
import { formatMoney } from '../utils/logic';

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
      summary: 'Institution registers fixed deposit receipt details and attaches supporting document metadata.',
      detail: 'Joint lien details, principal amount, bank confirmation advice, and institutional reference codes are captured into a structured digital record for compliance vetting.'
    },
    {
      step: 2,
      title: 'Review & Scrutiny',
      role: 'AICTE Reviewing Official',
      department: 'Bureau of Scrutiny & Regulatory Verification',
      summary: 'Officials examine financial fields, verify document metadata, and perform consistency checks.',
      detail: 'System rules check for duplicate FDR numbers, tenure validity, and joint lien clauses. Reviewers record observations, flag discrepancies with mandatory reasons, or return records for correction.'
    },
    {
      step: 3,
      title: 'Independent Verification',
      role: 'Authorized Verification Cell',
      department: 'Designated Regulatory Verification Desk',
      summary: 'Administrative verification sign-off distinguishing human review from external banking confirmation.',
      detail: 'Records marked "Verified by Authorized Reviewer" progress to Active lifecycle monitoring with full audit event stamping. External bank confirmation remains an explicit manual or API workflow stage.'
    },
    {
      step: 4,
      title: 'Maturity & Renewal Tracking',
      role: 'Automated Regulatory Monitoring',
      department: 'Automated Compliance Engine',
      summary: 'Maturity dates are tracked dynamically with configurable thresholds (90, 60, 30, 7 days).',
      detail: 'Institutions receive automated notifications and can initiate non-destructive renewal or replacement flows that preserve historical instrument lineage and audit history.'
    },
    {
      step: 5,
      title: 'Release & Refund Decision',
      role: 'Approving Authority',
      department: 'Directorate of Approvals & Financial Sanctions',
      summary: 'Separation of duties ensures release requests are reviewed independently before financial authority sign-off.',
      detail: 'Institution users cannot approve their own release. Approving authorities review scrutiny findings and must provide written decision reasons for every approval or rejection.'
    }
  ];

  const totalPortfolioAmount = store.instruments.reduce((sum, i) => sum + i.amount, 0);
  const pendingScrutinyCount = store.instruments.filter(i =>
    ['Pending', 'Under Review', 'Correction Required'].includes(i.verification)
  ).length;

  const scrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    const elem = document.getElementById('workflow');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* ── PHASE 1: COMPLETELY SIMPLIFIED NAVBAR ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px clamp(20px, 4vw, 56px)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* LEFT: FDR Guardian logo/icon, brand name, subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Landmark size={22} />
          </div>
          <div>
            <span
              style={{
                fontWeight: 800,
                fontSize: '18px',
                color: 'var(--color-heading)',
                display: 'block',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}
            >
              FDR Guardian
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                fontWeight: 500
              }}
            >
              Institutional FDR Management Platform
            </span>
          </div>
        </div>

        {/* RIGHT: One prominent Sign In button */}
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/signin')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              fontSize: 'var(--text-sm)',
              fontWeight: 650,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span>Sign In</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── PHASE 4: REDESIGNED LANDING PAGE HERO ── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
          padding: '64px clamp(20px, 5vw, 64px) 76px'
        }}
      >
        <div
          style={{
            maxWidth: '1220px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '56px',
            alignItems: 'center'
          }}
        >
          {/* LEFT SIDE */}
          <div>
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-surface-subtle)',
                color: 'var(--color-primary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                border: '1px solid var(--color-border)'
              }}
            >
              <ShieldCheck size={14} />
              <span>FDR LIFECYCLE MANAGEMENT</span>
            </div>

            {/* Main heading */}
            <h1
              style={{
                fontSize: 'clamp(32px, 3.6vw, 46px)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--color-heading)',
                margin: '0 0 20px',
                letterSpacing: '-0.025em'
              }}
            >
              Every FDR. Every Stage. Complete Accountability.
            </h1>

            {/* Supporting text */}
            <p
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: 1.65,
                color: 'var(--color-text-muted)',
                margin: '0 0 32px',
                maxWidth: '560px'
              }}
            >
              A centralized platform for managing institutional fixed deposit records, verification workflows, maturity monitoring, linked renewals and accountable release management.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/signin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 26px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 650
                }}
              >
                <span>Sign In</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={scrollToWorkflow}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 22px',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}
              >
                <Workflow size={16} />
                <span>Explore Workflow</span>
              </button>
            </div>

            {/* Clarification note */}
            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                Simulated institutional administration environment. No claims of live bank clearinghouse integration.
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Refined FDR Lifecycle Visualization (5 Stages) */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  Governance Progression
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 'var(--text-lg)', color: 'var(--color-heading)' }}>
                  5-Stage FDR Lifecycle
                </h3>
              </div>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Workflow size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stages.map((st, idx) => {
                const isActive = activeStage === idx;
                return (
                  <div
                    key={st.title}
                    onClick={() => setActiveStage(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--color-surface-subtle)' : 'var(--color-surface)',
                      border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: 'var(--radius-full)',
                            background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                            color: isActive ? '#FFFFFF' : 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {st.step}
                        </span>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-heading)' }}>
                          {st.title}
                        </strong>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 650,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: isActive ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                          color: isActive ? '#FFFFFF' : 'var(--color-primary)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {st.role}
                      </span>
                    </div>

                    {isActive && (
                      <div style={{ margin: '10px 0 0 34px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 650, color: 'var(--color-primary)', marginBottom: '3px' }}>
                          Responsible: {st.department}
                        </div>
                        <p style={{ margin: '0 0 4px', color: 'var(--color-text)' }}>{st.summary}</p>
                        <p style={{ margin: 0, opacity: 0.9 }}>{st.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── PHASE 5: SECTION 1 – PLATFORM OVERVIEW & METRICS ── */}
      <section id="overview" style={{ padding: '56px clamp(20px, 5vw, 64px)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="eyebrow">Platform Overview</div>
              <h2 style={{ margin: '4px 0 0', fontSize: 'var(--text-2xl)', color: 'var(--color-heading)' }}>
                Demonstration Portfolio Overview
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '480px' }}>
              Calculated dynamically from active institutional records and pending regulatory workflow requests.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}
          >
            <div
              style={{
                padding: '24px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderTop: '3px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <strong style={{ fontSize: '28px', color: 'var(--color-heading)', display: 'block', marginBottom: '4px' }}>
                {store.instruments.length}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Security Instruments Tracked</span>
            </div>

            <div
              style={{
                padding: '24px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderTop: '3px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <strong style={{ fontSize: '28px', color: 'var(--color-heading)', display: 'block', marginBottom: '4px' }}>
                {formatMoney(totalPortfolioAmount)}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Total Monitored Portfolio</span>
            </div>

            <div
              style={{
                padding: '24px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderTop: '3px solid var(--color-accent)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <strong style={{ fontSize: '28px', color: 'var(--color-warning-text)', display: 'block', marginBottom: '4px' }}>
                {pendingScrutinyCount}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Pending Reviewer Scrutiny</span>
            </div>

            <div
              style={{
                padding: '24px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderTop: '3px solid var(--color-secondary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <strong style={{ fontSize: '28px', color: 'var(--color-heading)', display: 'block', marginBottom: '4px' }}>
                {store.requests.length}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Active Workflow Requests</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHASE 5: SECTION 2 – CORE CAPABILITIES ── */}
      <section id="capabilities" style={{ padding: '64px clamp(20px, 5vw, 64px)', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Institutional Governance</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-heading)', margin: '6px 0 10px' }}>
              Built for Institutional Accountability
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '620px', margin: '0 auto', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Strict separation between institution submission, official scrutiny, and final financial sanctioning.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {[
              {
                icon: FileText,
                title: 'Centralized Instrument Repository',
                desc: 'Universal registry indexed across institution codes, banks, FDR numbers, and maturity dates with multi-field search and CSV export.'
              },
              {
                icon: ShieldCheck,
                title: 'Reviewer Scrutiny & Discrepancies',
                desc: 'Reviewing officials verify document metadata, record checklist findings, and return defective records for institutional correction.'
              },
              {
                icon: CalendarClock,
                title: 'Date-Derived Maturity Tracking',
                desc: 'Reminders and alerts are calculated from calendar maturity dates and configurable regulatory threshold rules (90, 60, 30, 7 days).'
              },
              {
                icon: ClipboardCheck,
                title: 'Guarded Release Workflow',
                desc: 'Strict segregation of duties ensures institution users cannot approve their own release. Approving authorities must log written justifications.'
              },
              {
                icon: History,
                title: 'Audit Trail & Transparency',
                desc: 'Timestamped records log actor persona, role, action, and mandatory reasons for every regulatory state transition.'
              },
              {
                icon: BarChart3,
                title: 'Executive Analytics & Reporting',
                desc: 'Data-driven visual summaries for verification queues, lifecycle states, and workflow request throughput with spreadsheet exports.'
              }
            ].map(c => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-md)', color: 'var(--color-heading)' }}>
                    {c.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PHASE 5: SECTION 3 – FDR LIFECYCLE WORKFLOW ── */}
      <section id="workflow" style={{ padding: '64px clamp(20px, 5vw, 64px)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>End-to-End Progression</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-heading)', margin: '6px 0 10px' }}>
              FDR Lifecycle Workflow Architecture
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '620px', margin: '0 auto', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              How security deposit receipts transition transparently through institutional submission, official scrutiny, active tenure, and governed release.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}
          >
            {stages.map((st) => (
              <div
                key={st.title}
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {st.step}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--color-primary)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Stage {st.step}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--color-heading)' }}>
                    {st.title}
                  </h4>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 650,
                      color: 'var(--color-primary)',
                      marginBottom: '8px'
                    }}
                  >
                    {st.role}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {st.summary}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '11px',
                    color: 'var(--color-text-subtle)'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Action Desk: </span>
                  <span>{st.department}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHASE 5: SECTION 4 – GOVERNANCE, ACCOUNTABILITY & AUDITABILITY ── */}
      <section id="governance" style={{ padding: '60px clamp(20px, 5vw, 64px)', background: 'var(--color-background)' }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Accountability Framework</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-heading)', margin: '6px 0 10px' }}>
              Governance, Accountability & Auditability
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Core regulatory safeguards guaranteeing institutional deposits remain fully auditable and protected against unilateral actions.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}
          >
            <div style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Scale size={20} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--color-heading)' }}>Separation of Duties</h4>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Maker-Checker-Approver boundaries prevent conflicts of interest. An institution user cannot approve their own release request, and reviewing officials cannot unilaterally release funds.
              </p>
            </div>

            <div style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FileCheck2 size={20} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--color-heading)' }}>Non-Destructive Lineage</h4>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                FDR renewals and replacements register new successor instruments while permanently preserving the predecessor instrument, its verification notes, and historical audit entries.
              </p>
            </div>

            <div style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <LockKeyhole size={20} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--color-heading)' }}>Immutable Audit Stamping</h4>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Every action records actor persona, role, timestamp, entity reference, and mandatory written justifications for critical decisions such as discrepancy flags and release decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHASE 5: SECTION 5 – FOOTER ── */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '36px clamp(20px, 5vw, 64px)',
          background: 'var(--color-primary)',
          color: '#FFFFFF',
          borderTop: '1px solid var(--color-primary-hover)'
        }}
      >
        <div
          style={{
            maxWidth: '1220px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: 'var(--text-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-surface-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Landmark size={18} />
            </div>
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: '#FFFFFF' }}>FDR Guardian</strong>
              <span style={{ color: 'var(--color-on-primary-muted)' }}>Institutional Fixed Deposit Receipt Lifecycle Platform</span>
            </div>
          </div>

          <div style={{ color: 'var(--color-on-primary-muted)', maxWidth: '520px', lineHeight: 1.45 }}>
            Demonstration software for institutional security deposit lifecycle oversight. Fictional sample records. No direct live bank clearinghouse integration claimed.
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => navigate('/signin')}
            style={{
              background: '#FFFFFF',
              color: 'var(--color-primary)',
              fontWeight: 700,
              border: 'none',
              padding: '9px 18px'
            }}
          >
            <span>Sign In to Platform</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
