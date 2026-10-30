import type { Instrument, WorkflowRequest, Role } from '../types';
import { daysUntil } from './logic';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ValidationFinding {
  id: string;
  instrumentId: string;
  fdrNumber: string;
  institution: string;
  institutionId: string;
  category: 'Duplicate' | 'Mandatory Field' | 'Date Sequence' | 'Document Metadata' | 'Data Consistency' | 'Replacement Linkage';
  severity: SeverityLevel;
  issue: string;
  explanation: string;
  suggestedAction: string;
  currentStatus: string;
  lifecycle: string;
  actionRoute: string;
  actionLabel: string;
}

export interface RiskIndicator {
  instrumentId: string;
  fdrNumber: string;
  institution: string;
  institutionId: string;
  amount: number;
  severity: SeverityLevel;
  primaryReason: string;
  details: string[];
  recommendedAction: string;
  actionRoute: string;
  actionLabel: string;
}

export type MaturityBucket = 'Already Matured' | 'Within 7 Days' | 'Within 30 Days' | 'Within 60 Days' | 'No Immediate Concern';

export interface MaturityItem {
  instrument: Instrument;
  daysRemaining: number;
  bucket: MaturityBucket;
  statusLabel: string;
  tone: 'danger' | 'warning' | 'info' | 'success';
}

export interface ReplacementItem {
  id: string;
  originalId: string;
  originalFdrNumber: string;
  originalMaturityDate: string;
  replacementId: string;
  replacementFdrNumber: string;
  replacementIssueDate: string;
  replacementMaturityDate: string;
  institution: string;
  institutionId: string;
  amount: number;
  status: string;
  historySummary: string;
}

export interface IntelligenceSummary {
  totalAnalyzed: number;
  recordsRequiringAttention: number;
  upcomingMaturitiesCount: number;
  potentialDuplicatesCount: number;
  incompleteSubmissionsCount: number;
  pendingScrutinyCount: number;
  findings: ValidationFinding[];
  riskIndicators: RiskIndicator[];
  maturityBreakdown: {
    matured: MaturityItem[];
    within7Days: MaturityItem[];
    within30Days: MaturityItem[];
    within60Days: MaturityItem[];
    onSchedule: MaturityItem[];
  };
  replacementItems: ReplacementItem[];
}

/**
 * Deterministic, rule-based intelligence engine for FDR Guardian.
 * Evaluates scoped instruments and workflow requests against institutional compliance rules.
 */
export function analyzeFdrIntelligence(
  instruments: Instrument[],
  requests: WorkflowRequest[] = [],
  role: Role = 'Institution User',
  now: Date = new Date()
): IntelligenceSummary {
  const findings: ValidationFinding[] = [];
  const riskIndicators: RiskIndicator[] = [];

  // Group by normalized FDR number to detect potential duplicate registrations
  const fdrNumberMap = new Map<string, Instrument[]>();
  for (const inst of instruments) {
    const norm = (inst.fdrNumber || '').trim().toUpperCase();
    if (norm) {
      const existing = fdrNumberMap.get(norm) || [];
      existing.push(inst);
      fdrNumberMap.set(norm, existing);
    }
  }

  // All instrument IDs set for rapid reference lookup
  const instrumentIdSet = new Set(instruments.map(i => i.id));

  // Counter sets for deduplicated summary metrics
  const attentionInstrumentIds = new Set<string>();
  const duplicateInstrumentIds = new Set<string>();
  const incompleteInstrumentIds = new Set<string>();
  const pendingScrutinyInstrumentIds = new Set<string>();
  const upcomingMaturityInstrumentIds = new Set<string>();

  // Process each instrument through transparent rule checks
  for (const inst of instruments) {
    const instFindings: ValidationFinding[] = [];
    const days = daysUntil(inst.maturityDate, now);

    // Track pending scrutiny
    if (inst.verification === 'Pending' || inst.verification === 'Under Review') {
      pendingScrutinyInstrumentIds.add(inst.id);
    }

    // Track upcoming maturities (within 60 days or already matured)
    if (inst.lifecycle !== 'Released' && inst.lifecycle !== 'Archived') {
      if (days <= 60) {
        upcomingMaturityInstrumentIds.add(inst.id);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 1: Duplicate FDR Number Check
    // ──────────────────────────────────────────────────────────────────────────
    const normFdr = (inst.fdrNumber || '').trim().toUpperCase();
    const duplicates = fdrNumberMap.get(normFdr) || [];
    if (duplicates.length > 1) {
      duplicateInstrumentIds.add(inst.id);
      const otherInsts = duplicates.filter(d => d.id !== inst.id);
      const otherIds = otherInsts.map(d => d.id).join(', ');
      instFindings.push({
        id: `FIND-DUP-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        category: 'Duplicate',
        severity: 'Critical',
        issue: 'Potential Duplicate FDR Number Conflict',
        explanation: `FDR number '${inst.fdrNumber}' is identically registered on ${duplicates.length} records (${otherIds}). Requires administrative verification of deposit uniqueness.`,
        suggestedAction: role === 'AICTE Reviewing Official'
          ? 'Cross-examine bank branch advice and compare physical certificate scans.'
          : 'Check issuance certificate and verify FDR reference with issuing bank.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Inspect Conflict'
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 2: Mandatory Field Completeness Check
    // ──────────────────────────────────────────────────────────────────────────
    const missingFields: string[] = [];
    if (!inst.institution?.trim()) missingFields.push('Institution Name');
    if (!inst.bank?.trim()) missingFields.push('Bank Name');
    if (!inst.branch?.trim()) missingFields.push('Branch Name');
    if (!inst.fdrNumber?.trim()) missingFields.push('FDR Number');
    if (!inst.amount || inst.amount <= 0) missingFields.push('Valid Principal Amount (> 0)');
    if (!inst.issueDate) missingFields.push('Issue Date');
    if (!inst.maturityDate) missingFields.push('Maturity Date');

    if (missingFields.length > 0) {
      incompleteInstrumentIds.add(inst.id);
      instFindings.push({
        id: `FIND-MAND-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber || 'Missing',
        institution: inst.institution || 'Unknown',
        institutionId: inst.institutionId,
        category: 'Mandatory Field',
        severity: inst.amount <= 0 || !inst.fdrNumber ? 'Critical' : 'High',
        issue: `Missing Mandatory Field: ${missingFields.join(', ')}`,
        explanation: `Record lacks required regulatory data attributes required for statutory compliance.`,
        suggestedAction: 'Update FDR record metadata to supply missing attributes.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Rectify Details'
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 3: Date Sequence & Chronological Integrity Check
    // ──────────────────────────────────────────────────────────────────────────
    if (inst.issueDate && inst.maturityDate) {
      if (inst.maturityDate <= inst.issueDate) {
        incompleteInstrumentIds.add(inst.id);
        instFindings.push({
          id: `FIND-DATE-INV-${inst.id}`,
          instrumentId: inst.id,
          fdrNumber: inst.fdrNumber,
          institution: inst.institution,
          institutionId: inst.institutionId,
          category: 'Date Sequence',
          severity: 'Critical',
          issue: 'Maturity Date Precedes or Matches Issue Date',
          explanation: `Issue date (${inst.issueDate}) cannot be equal to or later than maturity date (${inst.maturityDate}). Inverted tenure chronology detected.`,
          suggestedAction: 'Review deposit certificate and correct deposit tenure dates.',
          currentStatus: inst.verification,
          lifecycle: inst.lifecycle,
          actionRoute: `/app/fdr/${inst.id}`,
          actionLabel: 'Correct Dates'
        });
      }

      // Check if maturity is already expired without renewal or release action
      if (days < 0 && inst.lifecycle !== 'Released' && inst.lifecycle !== 'Archived') {
        instFindings.push({
          id: `FIND-DATE-EXP-${inst.id}`,
          instrumentId: inst.id,
          fdrNumber: inst.fdrNumber,
          institution: inst.institution,
          institutionId: inst.institutionId,
          category: 'Date Sequence',
          severity: 'Medium',
          issue: `Matured Instrument Pending Action (${Math.abs(days)}d past maturity)`,
          explanation: `Deposit reached statutory maturity on ${inst.maturityDate}. No formal discharge or renewal action completed.`,
          suggestedAction: role === 'Institution User'
            ? 'Submit renewal certificate or file a formal release request.'
            : 'Initiate maturity compliance review or issue notice to institution.',
          currentStatus: inst.verification,
          lifecycle: inst.lifecycle,
          actionRoute: `/app/renewals?instrument=${inst.id}`,
          actionLabel: 'Initiate Renewal'
        });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 4: Document Metadata & Supporting Attachment Check
    // ──────────────────────────────────────────────────────────────────────────
    const docs = inst.documents || [];
    const hasFdrCopy = docs.some(d => d.category === 'FDR Copy' && d.status !== 'Missing');
    const hasBankCert = docs.some(d => (d.category === 'Bank Confirmation' || d.category === 'Issuance Certificate') && d.status !== 'Missing');
    const hasMissingDocs = inst.documentStatus === 'Missing Documents' || docs.some(d => d.status === 'Missing');

    if (docs.length === 0 || !hasFdrCopy || hasMissingDocs) {
      incompleteInstrumentIds.add(inst.id);
      const detailMsg = docs.length === 0
        ? 'No supporting documents uploaded.'
        : !hasFdrCopy
        ? 'Official FDR receipt copy not found.'
        : 'Bank confirmation or issuance certificate pending upload.';

      instFindings.push({
        id: `FIND-DOC-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        category: 'Document Metadata',
        severity: docs.length === 0 ? 'High' : 'Medium',
        issue: `Incomplete Document Metadata: ${detailMsg}`,
        explanation: `Institutional security compliance requires verifiable bank receipt copy and formal branch confirmation letter.`,
        suggestedAction: 'Upload official signed branch certificates in the document repository.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Upload Documents'
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 5: Data Consistency & Scrutiny Discrepancies
    // ──────────────────────────────────────────────────────────────────────────
    if (inst.verification === 'Discrepancy Found') {
      instFindings.push({
        id: `FIND-DISC-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        category: 'Data Consistency',
        severity: 'High',
        issue: 'Active Regulatory Scrutiny Discrepancy Flagged',
        explanation: inst.discrepancyReason || 'Reviewing official identified a mismatch in lien terms, beneficiary endorsement, or deposit validity.',
        suggestedAction: role === 'Institution User'
          ? 'Review scrutiny notes and upload clarified documentation.'
          : 'Monitor resubmitted clarification and complete scrutiny checklist.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Review Discrepancy'
      });
    } else if (inst.verification === 'Correction Required') {
      instFindings.push({
        id: `FIND-CORR-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        category: 'Data Consistency',
        severity: 'Medium',
        issue: 'Returned for Administrative Correction',
        explanation: inst.reviewNotes || 'Institutional resubmission required to address missing council resolutions or signatures.',
        suggestedAction: 'Rectify specified data items and resubmit for verification.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Resolve Correction'
      });
    }

    // Contradiction: Verified status but marked Missing Documents
    if (inst.verification === 'Verified by Authorized Reviewer' && inst.documentStatus === 'Missing Documents') {
      instFindings.push({
        id: `FIND-CONTR-${inst.id}`,
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        category: 'Data Consistency',
        severity: 'Critical',
        issue: 'Status Contradiction: Verified with Missing Documents',
        explanation: 'Record is marked as Verified by Authorized Reviewer despite document status indicating missing statutory documents.',
        suggestedAction: 'Scrutiny cell must re-audit verification checklist evidence.',
        currentStatus: inst.verification,
        lifecycle: inst.lifecycle,
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'Re-audit Record'
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rule 6: Replacement Record Linkage & Ancestry Check
    // ──────────────────────────────────────────────────────────────────────────
    if (inst.replacementFor) {
      if (!instrumentIdSet.has(inst.replacementFor)) {
        incompleteInstrumentIds.add(inst.id);
        instFindings.push({
          id: `FIND-REPL-MISS-${inst.id}`,
          instrumentId: inst.id,
          fdrNumber: inst.fdrNumber,
          institution: inst.institution,
          institutionId: inst.institutionId,
          category: 'Replacement Linkage',
          severity: 'Critical',
          issue: 'Missing Predecessor Instrument Reference',
          explanation: `Instrument states it replaces '${inst.replacementFor}', but predecessor record does not exist in the active repository scope.`,
          suggestedAction: 'Verify predecessor FDR ID linkage or cross-reference historical manual deposit register.',
          currentStatus: inst.verification,
          lifecycle: inst.lifecycle,
          actionRoute: `/app/fdr/${inst.id}`,
          actionLabel: 'Verify Linkage'
        });
      }
    }

    // Collect all findings
    findings.push(...instFindings);

    // ──────────────────────────────────────────────────────────────────────────
    // Overall Risk & Attention Level Determination for Instrument
    // ──────────────────────────────────────────────────────────────────────────
    if (instFindings.length > 0) {
      attentionInstrumentIds.add(inst.id);

      // Determine highest severity finding
      const hasCritical = instFindings.some(f => f.severity === 'Critical');
      const hasHigh = instFindings.some(f => f.severity === 'High');
      const hasMedium = instFindings.some(f => f.severity === 'Medium');

      const severity: SeverityLevel = hasCritical
        ? 'Critical'
        : hasHigh
        ? 'High'
        : hasMedium
        ? 'Medium'
        : 'Low';

      const primary = instFindings[0];

      riskIndicators.push({
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        amount: inst.amount,
        severity,
        primaryReason: primary.issue,
        details: instFindings.map(f => f.explanation),
        recommendedAction: primary.suggestedAction,
        actionRoute: primary.actionRoute,
        actionLabel: primary.actionLabel
      });
    } else {
      // Clean record with low risk / routine monitoring
      riskIndicators.push({
        instrumentId: inst.id,
        fdrNumber: inst.fdrNumber,
        institution: inst.institution,
        institutionId: inst.institutionId,
        amount: inst.amount,
        severity: 'Low',
        primaryReason: 'Routine Compliance Monitoring',
        details: ['All mandatory metadata complete, no duplicate conflicts detected, supporting documents on file.'],
        recommendedAction: 'Maintain periodic maturity tracking.',
        actionRoute: `/app/fdr/${inst.id}`,
        actionLabel: 'View Record'
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Maturity Intelligence Breakdown
  // ──────────────────────────────────────────────────────────────────────────
  const maturityBreakdown = {
    matured: [] as MaturityItem[],
    within7Days: [] as MaturityItem[],
    within30Days: [] as MaturityItem[],
    within60Days: [] as MaturityItem[],
    onSchedule: [] as MaturityItem[]
  };

  for (const inst of instruments) {
    if (inst.lifecycle === 'Released' || inst.lifecycle === 'Archived') continue;

    const days = daysUntil(inst.maturityDate, now);

    if (days < 0) {
      maturityBreakdown.matured.push({
        instrument: inst,
        daysRemaining: days,
        bucket: 'Already Matured',
        statusLabel: `Matured ${Math.abs(days)}d ago`,
        tone: 'danger'
      });
    } else if (days <= 7) {
      maturityBreakdown.within7Days.push({
        instrument: inst,
        daysRemaining: days,
        bucket: 'Within 7 Days',
        statusLabel: days === 0 ? 'Matures Today' : `Matures in ${days}d`,
        tone: 'danger'
      });
    } else if (days <= 30) {
      maturityBreakdown.within30Days.push({
        instrument: inst,
        daysRemaining: days,
        bucket: 'Within 30 Days',
        statusLabel: `Due in ${days}d`,
        tone: 'warning'
      });
    } else if (days <= 60) {
      maturityBreakdown.within60Days.push({
        instrument: inst,
        daysRemaining: days,
        bucket: 'Within 60 Days',
        statusLabel: `Due in ${days}d`,
        tone: 'info'
      });
    } else {
      maturityBreakdown.onSchedule.push({
        instrument: inst,
        daysRemaining: days,
        bucket: 'No Immediate Concern',
        statusLabel: `${days}d remaining`,
        tone: 'success'
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Replacement Intelligence Mapping
  // ──────────────────────────────────────────────────────────────────────────
  const replacementItems: ReplacementItem[] = [];

  // 1. Trace successor records that have replacementFor
  for (const succ of instruments) {
    if (succ.replacementFor) {
      const pred = instruments.find(i => i.id === succ.replacementFor);
      replacementItems.push({
        id: `REPL-${succ.id}`,
        originalId: succ.replacementFor,
        originalFdrNumber: pred?.fdrNumber || 'Unknown Original',
        originalMaturityDate: pred?.maturityDate || '—',
        replacementId: succ.id,
        replacementFdrNumber: succ.fdrNumber,
        replacementIssueDate: succ.issueDate,
        replacementMaturityDate: succ.maturityDate,
        institution: succ.institution,
        institutionId: succ.institutionId,
        amount: succ.amount,
        status: succ.lifecycle === 'Active' ? 'Successor Active' : succ.lifecycle,
        historySummary: succ.history?.[0] || `Replaces ${succ.replacementFor}`
      });
    }
  }

  // 2. Also trace workflow requests of kind Replacement or Renewal that completed
  for (const req of requests) {
    if (req.kind === 'Renewal' && req.replacementId) {
      const exists = replacementItems.some(r => r.replacementId === req.replacementId);
      if (!exists) {
        const pred = instruments.find(i => i.id === req.instrumentId);
        const succ = instruments.find(i => i.id === req.replacementId);
        if (pred || succ) {
          replacementItems.push({
            id: req.id,
            originalId: req.instrumentId,
            originalFdrNumber: pred?.fdrNumber || 'Predecessor',
            originalMaturityDate: pred?.maturityDate || '—',
            replacementId: req.replacementId,
            replacementFdrNumber: succ?.fdrNumber || 'Successor',
            replacementIssueDate: succ?.issueDate || req.createdAt.slice(0, 10),
            replacementMaturityDate: succ?.maturityDate || '—',
            institution: pred?.institution || succ?.institution || 'Institutional Desk',
            institutionId: pred?.institutionId || succ?.institutionId || '',
            amount: succ?.amount || pred?.amount || 0,
            status: req.status === 'Completed' ? 'Successor Linked' : req.status,
            historySummary: req.reason || 'Renewal workflow replacement'
          });
        }
      }
    }
  }

  return {
    totalAnalyzed: instruments.length,
    recordsRequiringAttention: attentionInstrumentIds.size,
    upcomingMaturitiesCount: upcomingMaturityInstrumentIds.size,
    potentialDuplicatesCount: duplicateInstrumentIds.size,
    incompleteSubmissionsCount: incompleteInstrumentIds.size,
    pendingScrutinyCount: pendingScrutinyInstrumentIds.size,
    findings,
    riskIndicators,
    maturityBreakdown,
    replacementItems
  };
}
