import type { DemoState, Instrument, WorkflowRequest, Notice, AuditEvent, DemoUser } from '../types';
import { DEMO_USERS } from './auth';

const now = new Date();
const dateOffset = (days: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const seedUsers: DemoUser[] = DEMO_USERS;

export const seedInstruments: Instrument[] = [
  {
    id: 'FDR-1001',
    institution: 'North Valley Institute of Technology',
    institutionId: 'inst-1',
    bank: 'State Bank of India',
    branch: 'New Delhi Corporate Centre',
    fdrNumber: 'DEMO-884201',
    amount: 1500000,
    issueDate: dateOffset(-365),
    maturityDate: dateOffset(120),
    verification: 'Verified by Authorized Reviewer',
    documentStatus: 'Complete',
    lifecycle: 'Active',
    reference: 'AICTE/FDR/2025/NVIT-01',
    documents: [
      { id: 'DOC-1001-1', name: 'Original_FDR_Receipt.pdf', category: 'FDR Copy', status: 'Verified', size: 1245000, uploadedAt: dateOffset(-365) },
      { id: 'DOC-1001-2', name: 'Bank_Issuance_Certificate.pdf', category: 'Issuance Certificate', status: 'Verified', size: 840000, uploadedAt: dateOffset(-365) }
    ],
    reviewChecks: [
      { id: 'CHK-1', label: 'Principal amount matches sanctioned requirement', passed: true, checkedBy: 'R. K. Verma' },
      { id: 'CHK-2', label: 'Bank branch seal and authorized signatory present', passed: true, checkedBy: 'R. K. Verma' },
      { id: 'CHK-3', label: 'FDR issued in joint favor of AICTE and Institution', passed: true, checkedBy: 'R. K. Verma' }
    ],
    reviewNotes: 'All document checks passed. Term matches statutory requirement for 5-year deposit.',
    history: [
      'Verified by Authorized Reviewer: Human review passed on all criteria.',
      'Scrutiny initiated by AICTE Reviewing Official.',
      'Instrument record created by Institution User.'
    ],
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString()
  },
  {
    id: 'FDR-1002',
    institution: 'North Valley Institute of Technology',
    institutionId: 'inst-1',
    bank: 'Punjab National Bank',
    branch: 'Connaught Place Branch',
    fdrNumber: 'DEMO-884202',
    amount: 850000,
    issueDate: dateOffset(-360),
    maturityDate: dateOffset(23),
    verification: 'Pending',
    documentStatus: 'Missing Documents',
    lifecycle: 'Near Maturity',
    reference: 'AICTE/FDR/2025/NVIT-02',
    documents: [
      { id: 'DOC-1002-1', name: 'Scanned_FDR_CustomerCopy.pdf', category: 'FDR Copy', status: 'Uploaded', size: 980000, uploadedAt: dateOffset(-360) },
      { id: 'DOC-1002-2', name: 'Bank_Lien_Confirmation.pdf', category: 'Bank Confirmation', status: 'Missing', reviewerNote: 'Lien confirmation letter pending from branch manager.' }
    ],
    reviewChecks: [
      { id: 'CHK-1', label: 'Principal amount matches sanctioned requirement', passed: true },
      { id: 'CHK-2', label: 'Bank branch seal and authorized signatory present', passed: false, notes: 'Branch stamp illegible on scanned customer copy' },
      { id: 'CHK-3', label: 'FDR issued in joint favor of AICTE and Institution', passed: true }
    ],
    reviewNotes: 'Requires re-upload of official issuance certificate with clear bank seal.',
    history: [
      'Document flagged: Missing formal bank lien confirmation.',
      'Submitted for review by North Valley Institute of Technology.'
    ],
    createdAt: new Date(Date.now() - 360 * 86400000).toISOString()
  },
  {
    id: 'FDR-1003',
    institution: 'North Valley Institute of Technology',
    institutionId: 'inst-1',
    bank: 'HDFC Bank',
    branch: 'Sector 62 Noida Branch',
    fdrNumber: 'DEMO-884203',
    amount: 2100000,
    issueDate: dateOffset(-350),
    maturityDate: dateOffset(8),
    verification: 'Discrepancy Found',
    documentStatus: 'Discrepancy Detected',
    lifecycle: 'Near Maturity',
    reference: 'AICTE/FDR/2025/NVIT-03',
    discrepancyReason: 'Deposit tenure indicates auto-renewal clause without explicit AICTE joint lien clause on certificate.',
    documents: [
      { id: 'DOC-1003-1', name: 'FDR_Term_Deposit_Receipt.pdf', category: 'FDR Copy', status: 'Flagged', size: 1420000, uploadedAt: dateOffset(-350) },
      { id: 'DOC-1003-2', name: 'Issuance_Certificate_HDFC.pdf', category: 'Issuance Certificate', status: 'Flagged', size: 650000, uploadedAt: dateOffset(-350) }
    ],
    reviewChecks: [
      { id: 'CHK-1', label: 'Principal amount matches sanctioned requirement', passed: true },
      { id: 'CHK-2', label: 'Bank branch seal and authorized signatory present', passed: true },
      { id: 'CHK-3', label: 'FDR issued in joint favor of AICTE and Institution', passed: false, notes: 'Lien clause omitted from page 2' }
    ],
    reviewNotes: 'Discrepancy flagged: Joint lien clause must explicitly reference AICTE Approval Regulations.',
    history: [
      'Discrepancy flagged by Reviewing Official: Joint lien endorsement missing.',
      'Scrutiny commenced.',
      'Record submitted by Institution.'
    ],
    createdAt: new Date(Date.now() - 350 * 86400000).toISOString()
  },
  {
    id: 'FDR-1004',
    institution: 'Eastern Institute of Applied Studies',
    institutionId: 'inst-2',
    bank: 'Bank of Baroda',
    branch: 'Kolkata Main Branch',
    fdrNumber: 'DEMO-771901',
    amount: 600000,
    issueDate: dateOffset(-200),
    maturityDate: dateOffset(65),
    verification: 'Correction Required',
    documentStatus: 'Missing Documents',
    lifecycle: 'Active',
    reference: 'AICTE/FDR/2025/EIAS-01',
    documents: [
      { id: 'DOC-1004-1', name: 'FDR_Scan_Draft.pdf', category: 'FDR Copy', status: 'Uploaded', size: 1100000, uploadedAt: dateOffset(-200) }
    ],
    reviewNotes: 'Institution requested to upload Board resolution authorizing the security deposit.',
    history: [
      'Returned for correction: Board resolution document required.',
      'Submitted by Eastern Institute of Applied Studies.'
    ],
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString()
  },
  {
    id: 'FDR-1005',
    institution: 'Western Technical Academy',
    institutionId: 'inst-3',
    bank: 'Canara Bank',
    branch: 'Pune Camp Branch',
    fdrNumber: 'DEMO-551122',
    amount: 1750000,
    issueDate: dateOffset(-730),
    maturityDate: dateOffset(-12),
    verification: 'Verified by Authorized Reviewer',
    documentStatus: 'Complete',
    lifecycle: 'Under Approval',
    reference: 'AICTE/FDR/2024/WTA-01',
    documents: [
      { id: 'DOC-1005-1', name: 'Original_FDR_Receipt.pdf', category: 'FDR Copy', status: 'Verified', size: 1350000, uploadedAt: dateOffset(-730) },
      { id: 'DOC-1005-2', name: 'Bank_Issuance_Certificate.pdf', category: 'Issuance Certificate', status: 'Verified', size: 910000, uploadedAt: dateOffset(-730) }
    ],
    reviewNotes: 'Stated term completed. Scrutiny cell verified no pending encumbrances or compliance penalties.',
    history: [
      'Release request recommended by Reviewing Official; forwarded to Approving Authority.',
      'Release requested by Institution following completion of approved program tenure.',
      'Verified by Authorized Reviewer upon initial submission.'
    ],
    createdAt: new Date(Date.now() - 730 * 86400000).toISOString()
  },
  {
    id: 'FDR-1006',
    institution: 'Eastern Institute of Applied Studies',
    institutionId: 'inst-2',
    bank: 'Union Bank of India',
    branch: 'Salt Lake Sector V Branch',
    fdrNumber: 'DEMO-771902',
    amount: 950000,
    issueDate: dateOffset(-180),
    maturityDate: dateOffset(180),
    verification: 'Verified by Authorized Reviewer',
    documentStatus: 'Complete',
    lifecycle: 'Active',
    reference: 'AICTE/FDR/2025/EIAS-02',
    documents: [
      { id: 'DOC-1006-1', name: 'UBI_FDR_Deposit_Copy.pdf', category: 'FDR Copy', status: 'Verified', size: 1200000, uploadedAt: dateOffset(-180) },
      { id: 'DOC-1006-2', name: 'UBI_Certificate_Of_Lien.pdf', category: 'Issuance Certificate', status: 'Verified', size: 780000, uploadedAt: dateOffset(-180) }
    ],
    reviewNotes: 'Clean verification record. Valid 1-year deposit under standard security mandate.',
    history: [
      'Verified by Authorized Reviewer.',
      'Submitted by Eastern Institute of Applied Studies.'
    ],
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString()
  },
  {
    id: 'FDR-1007',
    institution: 'Western Technical Academy',
    institutionId: 'inst-3',
    bank: 'State Bank of India',
    branch: 'Shivajinagar Branch',
    fdrNumber: 'DEMO-551123',
    amount: 400000,
    issueDate: dateOffset(-90),
    maturityDate: dateOffset(34),
    verification: 'Pending',
    documentStatus: 'Complete',
    lifecycle: 'Active',
    reference: 'AICTE/FDR/2025/WTA-02',
    documents: [
      { id: 'DOC-1007-1', name: 'SBI_FDR_Receipt.pdf', category: 'FDR Copy', status: 'Uploaded', size: 890000, uploadedAt: dateOffset(-90) },
      { id: 'DOC-1007-2', name: 'SBI_Confirmation_Letter.pdf', category: 'Bank Confirmation', status: 'Uploaded', size: 540000, uploadedAt: dateOffset(-90) }
    ],
    reviewNotes: 'Awaiting reviewer assignment in regional queue.',
    history: [
      'Submitted by Western Technical Academy. Awaiting scrutiny.'
    ],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'FDR-1008',
    institution: 'North Valley Institute of Technology',
    institutionId: 'inst-1',
    bank: 'Axis Bank',
    branch: 'Mayur Vihar Branch',
    fdrNumber: 'DEMO-884204',
    amount: 720000,
    issueDate: dateOffset(-365),
    maturityDate: dateOffset(4),
    verification: 'Rejected',
    documentStatus: 'Discrepancy Detected',
    lifecycle: 'Archived',
    reference: 'AICTE/FDR/2024/NVIT-04',
    discrepancyReason: 'Deposit receipt submitted was an unconfirmed provisional voucher without bank transaction confirmation number.',
    documents: [
      { id: 'DOC-1008-1', name: 'Provisional_Voucher.pdf', category: 'FDR Copy', status: 'Flagged', size: 450000, uploadedAt: dateOffset(-365) }
    ],
    reviewNotes: 'Record rejected. Institution instructed to file fresh submission with final fixed deposit advice.',
    history: [
      'Verification Rejected: Provisional counter-slip is invalid for security deposit compliance.',
      'Record submitted by North Valley Institute of Technology.'
    ],
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString()
  }
];

export const seedRequests: WorkflowRequest[] = [
  {
    id: 'REN-2001',
    kind: 'Renewal',
    instrumentId: 'FDR-1002',
    status: 'Under Review',
    reason: 'FDR-1002 maturity approaching in 23 days; renewal receipt and term extension letter submitted.',
    actor: 'Dr. Priya Sharma',
    actorRole: 'Institution User',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'REL-3001',
    kind: 'Release',
    instrumentId: 'FDR-1005',
    status: 'Awaiting Approval',
    reason: 'Tenure of approved technical program completed successfully. Institution requests release and lien discharge.',
    actor: 'Western Technical Academy',
    actorRole: 'Institution User',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'REL-3002',
    kind: 'Release',
    instrumentId: 'FDR-1006',
    status: 'Rejected',
    reason: 'Premature release request submitted prior to mandatory compliance inspection.',
    actor: 'Eastern Institute of Applied Studies',
    actorRole: 'Institution User',
    decisionReason: 'Regulatory inspection pending. Release cannot be approved prior to compliance sign-off.',
    decidedBy: 'S. C. Nair (Approving Authority)',
    decidedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

export const seedNotifications: Notice[] = [
  {
    id: 'N-1',
    title: 'Maturity Approaching',
    description: 'FDR-1003 (₹21,00,000) reaches stated maturity in 8 days. Action required.',
    severity: 'warning',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    read: false,
    instrumentId: 'FDR-1003',
    link: '/app/fdr/FDR-1003'
  },
  {
    id: 'N-2',
    title: 'Discrepancy Flagged',
    description: 'FDR-1003 has been flagged for missing joint lien endorsement by scrutiny cell.',
    severity: 'error',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    read: false,
    instrumentId: 'FDR-1003',
    link: '/app/fdr/FDR-1003'
  },
  {
    id: 'N-3',
    title: 'Release Decision Pending',
    description: 'Release request REL-3001 for FDR-1005 is awaiting authorized approval decision.',
    severity: 'info',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    read: false,
    instrumentId: 'FDR-1005',
    link: '/app/releases'
  },
  {
    id: 'N-4',
    title: 'Document Metadata Required',
    description: 'FDR-1002 requires official Bank Lien Confirmation before verification can proceed.',
    severity: 'warning',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    read: true,
    instrumentId: 'FDR-1002',
    link: '/app/fdr/FDR-1002'
  }
];

export const seedAudit: AuditEvent[] = [
  {
    id: 'AUD-001',
    timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
    actor: 'Dr. Priya Sharma',
    role: 'Institution User',
    action: 'Release Request Created',
    entity: 'REL-3001',
    description: 'Submitted release request for FDR-1005 (Canara Bank).',
    reason: 'Mandatory statutory tenure completed.'
  },
  {
    id: 'AUD-002',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    actor: 'R. K. Verma',
    role: 'AICTE Reviewing Official',
    action: 'Release Scrutiny Completed',
    entity: 'REL-3001',
    description: 'Recommended release request REL-3001 for approval to Competent Financial Authority.',
    reason: 'Compliance checklist verified with no outstanding penalties.'
  },
  {
    id: 'AUD-003',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    actor: 'R. K. Verma',
    role: 'AICTE Reviewing Official',
    action: 'Discrepancy Flagged',
    entity: 'FDR-1003',
    description: 'Flagged discrepancy on FDR-1003 for missing AICTE lien clause.',
    reason: 'Lien endorsement on HDFC deposit receipt omitted mandatory regulatory reference.'
  },
  {
    id: 'AUD-004',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    actor: 'S. C. Nair',
    role: 'Approving Authority',
    action: 'Release Request Rejected',
    entity: 'REL-3002',
    description: 'Rejected release request REL-3002 for FDR-1006.',
    reason: 'Regulatory inspection pending. Release cannot be approved prior to compliance sign-off.'
  },
  {
    id: 'AUD-005',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    actor: 'Aditi Sen',
    role: 'System Administrator',
    action: 'Threshold Settings Updated',
    entity: 'SETTINGS',
    description: 'Configured automated reminder thresholds to [90, 60, 30, 7] days.',
    reason: 'Aligned with quarterly compliance notification schedule.'
  }
];

export const initialState: DemoState = {
  instruments: seedInstruments,
  requests: seedRequests,
  notifications: seedNotifications,
  audit: seedAudit,
  role: 'Institution User',
  institutionId: 'inst-1',
  currentUserId: 'u-inst-1',
  thresholds: [90, 60, 30, 7],
  users: seedUsers,
  isAuthenticated: false
};
