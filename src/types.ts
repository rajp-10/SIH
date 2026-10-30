export type Role =
  | 'Institution User'
  | 'AICTE Reviewing Official'
  | 'Approving Authority'
  | 'System Administrator';

export type VerificationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Correction Required'
  | 'Discrepancy Found'
  | 'Verified by Authorized Reviewer'
  | 'Rejected';

export type LifecycleStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Active'
  | 'Near Maturity'
  | 'Renewal Requested'
  | 'Release Requested'
  | 'Under Approval'
  | 'Matured'
  | 'Released'
  | 'Archived';

export type DocumentStatus =
  | 'Complete'
  | 'Missing Documents'
  | 'Discrepancy Detected';

export interface Doc {
  id: string;
  name: string;
  category: 'FDR Copy' | 'Issuance Certificate' | 'Institutional Board Approval' | 'Bank Confirmation' | 'Supporting Document';
  status: 'Uploaded' | 'Missing' | 'Verified' | 'Flagged';
  size?: number;
  uploadedAt?: string;
  reviewerNote?: string;
}

export interface ReviewCheck {
  id: string;
  label: string;
  passed: boolean;
  notes?: string;
  checkedBy?: string;
  checkedAt?: string;
}

export interface Instrument {
  id: string;
  institution: string;
  institutionId: string;
  bank: string;
  branch: string;
  fdrNumber: string;
  amount: number;
  issueDate: string;
  maturityDate: string;
  verification: VerificationStatus;
  documentStatus: DocumentStatus;
  lifecycle: LifecycleStatus;
  reference: string;
  documents: Doc[];
  reviewChecks?: ReviewCheck[];
  reviewNotes?: string;
  discrepancyReason?: string;
  history: string[];
  replacementFor?: string;
  replacementId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkflowRequest {
  id: string;
  kind: 'Renewal' | 'Replacement' | 'Release';
  instrumentId: string;
  status: 'Submitted' | 'Under Review' | 'Awaiting Approval' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  reason: string;
  actor: string;
  actorRole: Role;
  createdAt: string;
  amount?: number;
  issueDate?: string;
  maturityDate?: string;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
  replacementId?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  read: boolean;
  instrumentId?: string;
  link?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  entity: string;
  description: string;
  reason?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  title?: string;
  role: Role;
  institutionId: string;
  email: string;
  password?: string;
  department?: string;
}

export interface DemoState {
  instruments: Instrument[];
  requests: WorkflowRequest[];
  notifications: Notice[];
  audit: AuditEvent[];
  role: Role;
  institutionId: string;
  thresholds: number[];
  users: DemoUser[];
  isAuthenticated: boolean;
  currentUserId?: string;
}
