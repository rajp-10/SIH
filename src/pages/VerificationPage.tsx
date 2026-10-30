import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock3, Filter, ArrowRight } from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import { DataTable } from '../components/DataTable';
import { MetricCard } from '../components/MetricCard';

export function VerificationPage() {
  const store = useStore();

  // Route Guard: Reviewing Official only
  if (!can(store.role, 'canReviewFdr')) {
    return (
      <AccessDenied
        requiredPermission="canReviewFdr"
        message="Only AICTE Reviewing Officials are authorized to access the central scrutiny and verification queue."
      />
    );
  }

  const allVisible = visibleInstruments(store);
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Under Review' | 'Discrepancy Found' | 'Correction Required'>('All');

  const pendingItems = allVisible.filter(i => i.verification !== 'Verified by Authorized Reviewer' && i.verification !== 'Rejected');
  
  const displayedItems = pendingItems.filter(i => {
    if (filterTab === 'All') return true;
    return i.verification === filterTab;
  });

  const pendingCount = pendingItems.filter(i => i.verification === 'Pending').length;
  const underReviewCount = pendingItems.filter(i => i.verification === 'Under Review').length;
  const discrepancyCount = pendingItems.filter(i => i.verification === 'Discrepancy Found').length;
  const correctionCount = pendingItems.filter(i => i.verification === 'Correction Required').length;

  return (
    <div className="content">
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Oversight</div>
          <h1>Verification & Scrutiny Queue</h1>
          <p>
            Official scrutiny workflow for reviewing submitted fields, verifying joint lien clauses, and logging discrepancies.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MetricCard
          label="Total In Queue"
          value={pendingItems.length}
          note="Unverified submissions"
          icon={<ShieldCheck size={18} />}
          accent={pendingItems.length > 0}
          onClick={() => setFilterTab('All')}
        />

        <MetricCard
          label="Pending Scrutiny"
          value={pendingCount}
          note="Awaiting first review"
          icon={<Clock3 size={18} />}
          tone="warning"
          onClick={() => setFilterTab('Pending')}
        />

        <MetricCard
          label="Under Review"
          value={underReviewCount}
          note="Active examination"
          icon={<ShieldCheck size={18} />}
          onClick={() => setFilterTab('Under Review')}
        />

        <MetricCard
          label="Discrepancies"
          value={discrepancyCount}
          note="Action required by institution"
          icon={<AlertTriangle size={18} />}
          tone={discrepancyCount > 0 ? 'danger' : 'default'}
          accent={discrepancyCount > 0}
          onClick={() => setFilterTab('Discrepancy Found')}
        />
      </div>

      <div className="panel">
        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
          {[
            { id: 'All', label: `All In Queue (${pendingItems.length})` },
            { id: 'Pending', label: `Pending (${pendingCount})` },
            { id: 'Under Review', label: `Under Review (${underReviewCount})` },
            { id: 'Discrepancy Found', label: `Discrepancies (${discrepancyCount})` },
            { id: 'Correction Required', label: `Corrections (${correctionCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`btn ${filterTab === tab.id ? 'btn-primary' : 'btn-secondary'} btn-small`}
              onClick={() => setFilterTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="alert" style={{ marginBottom: '16px' }}>
          <strong>Scrutiny Protocol:</strong> Inspect deposit certificates for explicit Member Secretary, AICTE joint lien endorsement and correct tenure. Mark checks or flag discrepancies with written justification.
        </div>

        <DataTable
          items={displayedItems}
          pageSize={8}
          emptyMessage="No instruments currently require scrutiny under this filter."
        />
      </div>

      <p className="footer-note">
        "Verified by Authorized Reviewer" attests that regulatory checks have passed within this demonstration prototype. It does not replace independent bank confirmation.
      </p>
    </div>
  );
}
export default VerificationPage;
