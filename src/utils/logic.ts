import type { DemoState, Role, Instrument, WorkflowRequest, VerificationStatus, LifecycleStatus } from '../types';

export const STORAGE_KEY = 'fdr-guardian-demo-v1';

export type Permission =
  | 'canCreateFdr'
  | 'canViewInstitutionRecords'
  | 'canReviewFdr'
  | 'canFlagDiscrepancy'
  | 'canRequestRenewal'
  | 'canRequestRelease'
  | 'canApproveRelease'
  | 'canManageUsers'
  | 'canConfigureSettings'
  | 'canViewAuditLog'
  | 'canExportReports'
  | 'canViewIntelligence'
  // Legacy / granular permission keys for backward-compatibility
  | 'instrument:view-own'
  | 'instrument:view-scope'
  | 'instrument:create'
  | 'verification:review'
  | 'request:renew'
  | 'request:release'
  | 'request:review'
  | 'release:decide'
  | 'system:users'
  | 'system:settings'
  | 'audit:view'
  | 'demo:reset'
  | 'notification:read';

export const rolePermissions: Record<Role, Permission[]> = {
  'Institution User': [
    'canCreateFdr',
    'canViewInstitutionRecords',
    'canRequestRenewal',
    'canRequestRelease',
    'canExportReports',
    'instrument:view-own',
    'instrument:create',
    'request:renew',
    'request:release',
    'notification:read'
  ],
  'AICTE Reviewing Official': [
    'canViewInstitutionRecords',
    'canReviewFdr',
    'canFlagDiscrepancy',
    'canViewAuditLog',
    'canExportReports',
    'canViewIntelligence',
    'instrument:view-scope',
    'verification:review',
    'request:review',
    'audit:view',
    'notification:read'
  ],
  'Approving Authority': [
    'canViewInstitutionRecords',
    'canApproveRelease',
    'canViewAuditLog',
    'canExportReports',
    'canViewIntelligence',
    'instrument:view-scope',
    'release:decide',
    'audit:view',
    'notification:read'
  ],
  'System Administrator': [
    'canViewInstitutionRecords',
    'canManageUsers',
    'canConfigureSettings',
    'canViewAuditLog',
    'canExportReports',
    'system:users',
    'system:settings',
    'audit:view',
    'demo:reset',
    'instrument:view-scope',
    'notification:read'
  ]
};

// Also maintain permissions object for backward compatibility
export const permissions = rolePermissions;

export function can(role: Role, permission: Permission | string): boolean {
  const allowed = rolePermissions[role] as string[] | undefined;
  return allowed ? allowed.includes(permission) : false;
}

export function visibleInstruments(state: DemoState): Instrument[] {
  if (can(state.role, 'instrument:view-scope')) {
    return state.instruments;
  }
  return state.instruments.filter(i => i.institutionId === state.institutionId);
}

export function visibleRequests(state: DemoState): WorkflowRequest[] {
  if (can(state.role, 'instrument:view-scope')) {
    return state.requests;
  }
  const permittedInstrumentIds = new Set(visibleInstruments(state).map(i => i.id));
  return state.requests.filter(r => permittedInstrumentIds.has(r.instrumentId));
}

export function daysUntil(dateStr: string, now: Date = new Date()): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr + 'T00:00:00');
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - current.getTime()) / 86400000);
}

export function maturityLabel(
  i: Instrument,
  thresholds: number[] = [90, 60, 30, 7],
  now: Date = new Date()
): { label: string; tone: 'success' | 'warning' | 'danger' | 'info'; days: number } {
  const days = daysUntil(i.maturityDate, now);
  if (days < 0) {
    return { label: `Matured ${Math.abs(days)}d ago`, tone: 'danger', days };
  }
  if (days === 0) {
    return { label: 'Matures today', tone: 'danger', days };
  }
  if (days <= 7) {
    return { label: `Due in ${days}d`, tone: 'danger', days };
  }
  if (thresholds.some(t => days <= t)) {
    return { label: `Due in ${days}d`, tone: 'warning', days };
  }
  return { label: 'On schedule', tone: 'success', days };
}

export function validateInstrument(
  v: Partial<Instrument>,
  all: Instrument[],
  currentId?: string
): Record<string, string> {
  const e: Record<string, string> = {};
  
  if (!v.institution?.trim()) {
    e.institution = 'Institution is required';
  }
  
  if (!v.fdrNumber?.trim()) {
    e.fdrNumber = 'FDR number is required';
  } else {
    const isDuplicate = all.some(
      i => i.id !== currentId && i.fdrNumber.toLowerCase() === v.fdrNumber!.trim().toLowerCase()
    );
    if (isDuplicate) {
      e.fdrNumber = 'This FDR number already exists';
    }
  }

  if (!v.bank?.trim()) {
    e.bank = 'Bank name is required';
  }

  const amt = Number(v.amount);
  if (isNaN(amt) || amt <= 0) {
    e.amount = 'Enter an amount greater than zero';
  }

  if (!v.issueDate) {
    e.issueDate = 'Issue date is required';
  }

  if (!v.maturityDate) {
    e.maturityDate = 'Maturity date is required';
  } else if (v.issueDate && v.maturityDate <= v.issueDate) {
    e.maturityDate = 'Maturity date must be after issue date';
  }

  return e;
}

export function canTransitionLifecycle(from: LifecycleStatus, to: LifecycleStatus): boolean {
  if (from === to) return true;
  const allowedMap: Record<LifecycleStatus, LifecycleStatus[]> = {
    'Draft': ['Submitted', 'Archived'],
    'Submitted': ['Under Review', 'Archived'],
    'Under Review': ['Active', 'Archived'],
    'Active': ['Near Maturity', 'Renewal Requested', 'Release Requested', 'Matured', 'Archived'],
    'Near Maturity': ['Renewal Requested', 'Release Requested', 'Matured', 'Active'],
    'Renewal Requested': ['Active', 'Archived', 'Under Approval'],
    'Release Requested': ['Under Approval', 'Active'],
    'Under Approval': ['Released', 'Active'],
    'Matured': ['Renewal Requested', 'Release Requested', 'Archived'],
    'Released': ['Archived'],
    'Archived': []
  };
  return allowedMap[from]?.includes(to) ?? false;
}

export function canTransitionVerification(from: VerificationStatus, to: VerificationStatus): boolean {
  if (from === to) return true;
  const allowedMap: Record<VerificationStatus, VerificationStatus[]> = {
    'Pending': ['Under Review', 'Correction Required', 'Discrepancy Found', 'Verified by Authorized Reviewer', 'Rejected'],
    'Under Review': ['Correction Required', 'Discrepancy Found', 'Verified by Authorized Reviewer', 'Rejected'],
    'Correction Required': ['Pending', 'Under Review'],
    'Discrepancy Found': ['Under Review', 'Correction Required', 'Rejected'],
    'Verified by Authorized Reviewer': ['Under Review', 'Discrepancy Found', 'Rejected'],
    'Rejected': ['Under Review']
  };
  return allowedMap[from]?.includes(to) ?? false;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function exportInstrumentsToCSV(items: Instrument[], filename = 'fdr-guardian-instruments.csv') {
  const headers = [
    'Instrument ID',
    'Institution',
    'Institution Code',
    'Bank',
    'Branch',
    'FDR Number',
    'Amount (INR)',
    'Issue Date',
    'Maturity Date',
    'Days to Maturity',
    'Verification Status',
    'Document Status',
    'Lifecycle Status',
    'Replacement For',
    'Created At'
  ];

  const rows = items.map(i => {
    const days = daysUntil(i.maturityDate);
    return [
      i.id,
      i.institution,
      i.institutionId,
      i.bank,
      i.branch,
      i.fdrNumber,
      i.amount,
      i.issueDate,
      i.maturityDate,
      days,
      i.verification,
      i.documentStatus,
      i.lifecycle,
      i.replacementFor || 'N/A',
      i.createdAt
    ];
  });

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
