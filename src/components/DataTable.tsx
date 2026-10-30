import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { Instrument } from '../types';
import { useStore } from '../context/Store';
import { maturityLabel, formatMoney, formatDate } from '../utils/logic';

export interface DataTableProps {
  items: Instrument[];
  pageSize?: number;
  emptyMessage?: string;
  onSelectDocument?: (instrument: Instrument) => void;
}

export function DataTable({
  items,
  pageSize = 8,
  emptyMessage = 'No matching instruments in this view.',
  onSelectDocument
}: DataTableProps) {
  const store = useStore();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Instrument>('maturityDate');
  const [sortAsc, setSortAsc] = useState(true);

  if (!items.length) {
    return (
      <div className="empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Search size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
        <h3 style={{ margin: '0 0 6px', fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
          No Matching Records
        </h3>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  const handleSort = (field: keyof Instrument) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const displayedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getVerificationTone = (status: Instrument['verification']) => {
    switch (status) {
      case 'Verified by Authorized Reviewer':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'Correction Required':
      case 'Discrepancy Found':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getDocTone = (status: Instrument['documentStatus']) => {
    switch (status) {
      case 'Complete':
        return 'success';
      case 'Missing Documents':
        return 'warning';
      default:
        return 'danger';
    }
  };

  return (
    <div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Instrument / FDR No. <ArrowUpDown size={12} opacity={0.6} />
                </div>
              </th>
              <th onClick={() => handleSort('institution')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Institution <ArrowUpDown size={12} opacity={0.6} />
                </div>
              </th>
              <th onClick={() => handleSort('bank')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Bank & Branch <ArrowUpDown size={12} opacity={0.6} />
                </div>
              </th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Amount <ArrowUpDown size={12} opacity={0.6} />
                </div>
              </th>
              <th onClick={() => handleSort('maturityDate')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Maturity <ArrowUpDown size={12} opacity={0.6} />
                </div>
              </th>
              <th>Verification</th>
              <th>Documents</th>
              <th>Lifecycle</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map(i => {
              const m = maturityLabel(i, store.thresholds);
              return (
                <tr key={i.id}>
                  <td>
                    <button
                      className="table-link"
                      onClick={() => navigate('/app/fdr/' + i.id)}
                      style={{ fontWeight: 600 }}
                    >
                      {i.id}
                    </button>
                    <div className="muted tiny" style={{ fontFamily: 'var(--font-mono)' }}>
                      {i.fdrNumber}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{i.institution}</div>
                    <span className="muted tiny" style={{ fontSize: '11px' }}>
                      Scope: {i.institutionId}
                    </span>
                  </td>
                  <td>
                    <div>{i.bank}</div>
                    <div className="muted tiny">{i.branch}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatMoney(i.amount)}
                  </td>
                  <td>
                    <div>{formatDate(i.maturityDate)}</div>
                    <div style={{ marginTop: '2px' }}>
                      <span className={`status ${m.tone}`}>{m.label}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${getVerificationTone(i.verification)}`}>
                      {i.verification === 'Verified by Authorized Reviewer' ? 'Verified' : i.verification}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getDocTone(i.documentStatus)}`}>
                      {i.documentStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: i.lifecycle === 'Released' ? 'var(--color-info)' : 'var(--color-primary)'
                      }}
                    >
                      {i.lifecycle}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => navigate('/app/fdr/' + i.id)}
                        aria-label={`View instrument details for ${i.id}`}
                      >
                        <Eye size={13} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 4px 4px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedItems.length)} of {sortedItems.length} records
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default DataTable;
