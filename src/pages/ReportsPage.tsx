import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, Download, FileSpreadsheet, ShieldCheck, Workflow, CalendarClock } from 'lucide-react';
import { useStore } from '../context/Store';
import { visibleInstruments, visibleRequests, exportInstrumentsToCSV, formatMoney } from '../utils/logic';
import { DataTable } from '../components/DataTable';
import { MetricCard } from '../components/MetricCard';

export function ReportsPage() {
  const store = useStore();
  const items = visibleInstruments(store);
  const requests = visibleRequests(store);

  // Dynamic lifecycle counts
  const lifecycleData = [
    { name: 'Active', count: items.filter(i => i.lifecycle === 'Active').length, color: '#123B3A' },
    { name: 'Near Maturity', count: items.filter(i => i.lifecycle === 'Near Maturity').length, color: '#C69A55' },
    { name: 'Under Approval', count: items.filter(i => i.lifecycle === 'Under Approval').length, color: '#19324D' },
    { name: 'Released', count: items.filter(i => i.lifecycle === 'Released').length, color: '#65727A' },
    { name: 'Archived', count: items.filter(i => i.lifecycle === 'Archived').length, color: '#8C9A94' }
  ];

  // Dynamic verification counts
  const verificationData = [
    { name: 'Verified', count: items.filter(i => i.verification === 'Verified by Authorized Reviewer').length, color: '#1D6B4E' },
    { name: 'Pending', count: items.filter(i => i.verification === 'Pending').length, color: '#C69A55' },
    { name: 'Under Review', count: items.filter(i => i.verification === 'Under Review').length, color: '#19324D' },
    { name: 'Discrepancy', count: items.filter(i => i.verification === 'Discrepancy Found').length, color: '#B92D3B' },
    { name: 'Correction', count: items.filter(i => i.verification === 'Correction Required').length, color: '#9E6E12' },
    { name: 'Rejected', count: items.filter(i => i.verification === 'Rejected').length, color: '#941F2B' }
  ];

  // Request statuses
  const requestStatuses = ['Submitted', 'Under Review', 'Awaiting Approval', 'Approved', 'Rejected', 'Completed'];
  const requestData = requestStatuses.map(status => ({
    status,
    count: requests.filter(r => r.status === status).length
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

  const handleDownloadCSV = () => {
    exportInstrumentsToCSV(items, `fdr-guardian-management-report-${Date.now()}.csv`);
    store.addAudit(
      'Management Report Exported',
      'REPORTS',
      `Exported CSV report with ${items.length} records. Total portfolio value: ${formatMoney(totalAmount)}.`
    );
  };

  return (
    <div className="content">
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Analytics</div>
          <h1>Management Reports & Analytics</h1>
          <p>
            Real-time analytics and data-driven distributions calculated from your permitted demonstration dataset.
          </p>
        </div>

        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} /> Export Instruments CSV ({items.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <MetricCard
          label="Permitted Instruments"
          value={items.length}
          note="Records in current scope"
          icon={<FileSpreadsheet size={18} />}
        />
        <MetricCard
          label="Scope Value (INR)"
          value={formatMoney(totalAmount)}
          note="Total deposit principal"
          icon={<ShieldCheck size={18} />}
        />
        <MetricCard
          label="Workflow Requests"
          value={requests.length}
          note="Renewals and release requests"
          icon={<Workflow size={18} />}
        />
        <MetricCard
          label="Verified Ratio"
          value={`${items.length ? Math.round((items.filter(i => i.verification === 'Verified by Authorized Reviewer').length / items.length) * 100) : 0}%`}
          note="Scrutiny sign-off rate"
          icon={<BarChart3 size={18} />}
          accent
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="dashboard-grid">
        {/* Verification Status Distribution (Recharts) */}
        <section className="panel">
          <div className="panel-head">
            <h2>Verification Queue Distribution</h2>
            <span className="status info">Live Data</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrap chart-table" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Status Category</th>
                  <th style={{ textAlign: 'right' }}>Instrument Count</th>
                  <th style={{ textAlign: 'right' }}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {verificationData.map(v => (
                  <tr key={v.name}>
                    <td>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: v.color, marginRight: '8px' }} />
                      {v.name}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{v.count}</td>
                    <td style={{ textAlign: 'right' }}>
                      {items.length ? ((v.count / items.length) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Workflow Requests Status (Recharts) */}
        <section className="panel">
          <div className="panel-head">
            <h2>Workflow Requests Distribution</h2>
            <span className="status success">Throughput</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrap chart-table" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Request Status</th>
                  <th style={{ textAlign: 'right' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {requestData.map(r => (
                  <tr key={r.status}>
                    <td>{r.status}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="footer-note" style={{ marginTop: '20px' }}>
        Exported CSV files contain raw, unaggregated records with escaped quotes and standard tabular fields suitable for compliance audits and spreadsheet imports.
      </p>
    </div>
  );
}
export default ReportsPage;
