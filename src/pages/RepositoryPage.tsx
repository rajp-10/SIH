import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wallet,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments, exportInstrumentsToCSV } from '../utils/logic';
import { DataTable } from '../components/DataTable';
import type { Instrument } from '../types';

export function RepositoryPage() {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [verificationFilter, setVerificationFilter] = useState(searchParams.get('verification') || 'All');
  const [lifecycleFilter, setLifecycleFilter] = useState(searchParams.get('lifecycle') || 'All');
  const [bankFilter, setBankFilter] = useState('All');
  const [sortField, setSortField] = useState<'maturityDate' | 'amount' | 'institution' | 'issueDate'>('maturityDate');

  const allInstruments = visibleInstruments(store);

  // Available unique banks for filter dropdown
  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(allInstruments.map(i => i.bank))).sort();
  }, [allInstruments]);

  // Filtered & sorted records
  const filteredInstruments = useMemo(() => {
    const q = query.toLowerCase().trim();

    return allInstruments.filter(item => {
      const matchesQuery =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.fdrNumber.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q) ||
        item.bank.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q);

      const matchesVerification =
        verificationFilter === 'All' || item.verification === verificationFilter;

      const matchesLifecycle =
        lifecycleFilter === 'All' || item.lifecycle === lifecycleFilter;

      const matchesBank = bankFilter === 'All' || item.bank === bankFilter;

      return matchesQuery && matchesVerification && matchesLifecycle && matchesBank;
    });
  }, [allInstruments, query, verificationFilter, lifecycleFilter, bankFilter]);

  const clearFilters = () => {
    setQuery('');
    setVerificationFilter('All');
    setLifecycleFilter('All');
    setBankFilter('All');
    setSearchParams({});
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    verificationFilter !== 'All' ||
    lifecycleFilter !== 'All' ||
    bankFilter !== 'All';

  const handleExportCSV = () => {
    exportInstrumentsToCSV(
      filteredInstruments,
      `fdr-guardian-${store.role.toLowerCase().replace(/\s+/g, '-')}-records.csv`
    );
    store.addAudit(
      'Report Exported',
      'REPOSITORY',
      `Exported ${filteredInstruments.length} visible FDR records to CSV.`,
      `Applied filters: query='${query}', verification='${verificationFilter}'`
    );
  };

  return (
    <div className="content">
      {/* Title & Actions */}
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Repository</div>
          <h1>Fixed Deposit Instruments</h1>
          <p>
            Universal repository of all FDR records within your demonstration permitted scope.
          </p>
        </div>

        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} /> Export CSV ({filteredInstruments.length})
          </button>

          {/* CRITICAL RBAC: Only Institution User can see or trigger New FDR */}
          {can(store.role, 'canCreateFdr') && (
            <Link
              to="/app/fdr/new"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> New Submission
            </Link>
          )}
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="panel">
        {/* Toolbar & Filters */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <input
              type="text"
              className="search-input"
              aria-label="Search FDR repository"
              placeholder="Search by FDR No, Institution, Bank, Reference..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select
            className="search-input"
            aria-label="Filter verification status"
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="All">All Verifications</option>
            <option value="Pending">Pending Scrutiny</option>
            <option value="Under Review">Under Review</option>
            <option value="Correction Required">Correction Required</option>
            <option value="Discrepancy Found">Discrepancy Found</option>
            <option value="Verified by Authorized Reviewer">Verified by Reviewer</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="search-input"
            aria-label="Filter lifecycle status"
            value={lifecycleFilter}
            onChange={e => setLifecycleFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="All">All Lifecycles</option>
            <option value="Active">Active</option>
            <option value="Near Maturity">Near Maturity</option>
            <option value="Renewal Requested">Renewal Requested</option>
            <option value="Release Requested">Release Requested</option>
            <option value="Under Approval">Under Approval</option>
            <option value="Matured">Matured</option>
            <option value="Released">Released</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className="search-input"
            aria-label="Filter bank"
            value={bankFilter}
            onChange={e => setBankFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="All">All Issuing Banks</option>
            {uniqueBanks.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={clearFilters}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Active filters:
            </span>
            {query && (
              <span className="status info" style={{ fontSize: '11px' }}>
                Query: "{query}"
              </span>
            )}
            {verificationFilter !== 'All' && (
              <span className="status warning" style={{ fontSize: '11px' }}>
                Verification: {verificationFilter}
              </span>
            )}
            {lifecycleFilter !== 'All' && (
              <span className="status info" style={{ fontSize: '11px' }}>
                Lifecycle: {lifecycleFilter}
              </span>
            )}
            {bankFilter !== 'All' && (
              <span className="status success" style={{ fontSize: '11px' }}>
                Bank: {bankFilter}
              </span>
            )}
          </div>
        )}

        {/* Table View */}
        <DataTable
          items={filteredInstruments}
          pageSize={7}
          emptyMessage="No instruments match your current search and filter criteria. Try adjusting the search or clearing filters."
        />
      </div>

      <p className="footer-note">
        All instruments reflect simulated records in your permitted role scope. Bank verification status indicates simulated reviewer sign-off, not direct bank core-banking ledger access.
      </p>
    </div>
  );
}
export default RepositoryPage;
