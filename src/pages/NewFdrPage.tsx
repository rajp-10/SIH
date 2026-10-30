import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FilePlus2,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  AlertTriangle,
  Upload,
  Landmark,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, validateInstrument, formatMoney, formatDate } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import { LifecycleStepper } from '../components/21st/LifecycleStepper';
import type { Doc, Instrument } from '../types';

export function NewFdrPage() {
  const store = useStore();
  const navigate = useNavigate();

  // CRITICAL RBAC ENFORCEMENT:
  // Reject access immediately if user is not Institution User
  if (!can(store.role, 'canCreateFdr')) {
    return (
      <AccessDenied
        requiredPermission="canCreateFdr"
        message="Only authorized Institution Users are permitted to register and submit new Fixed Deposit Receipt records."
      />
    );
  }

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    institution: 'North Valley Institute of Technology',
    institutionId: store.institutionId || 'inst-1',
    bank: 'State Bank of India',
    branch: 'New Delhi Corporate Branch',
    reference: 'AICTE/2026/FDR-NEW',
    fdrNumber: '',
    amount: '',
    issueDate: new Date().toISOString().slice(0, 10),
    maturityDate: ''
  });

  const [documents, setDocuments] = useState<Doc[]>([
    {
      id: 'DOC-INIT-1',
      name: 'FDR_Official_Deposit_Receipt.pdf',
      category: 'FDR Copy',
      status: 'Uploaded',
      size: 1150000,
      uploadedAt: new Date().toISOString().slice(0, 10)
    },
    {
      id: 'DOC-INIT-2',
      name: 'Bank_Lien_Confirmation_Letter.pdf',
      category: 'Issuance Certificate',
      status: 'Uploaded',
      size: 780000,
      uploadedAt: new Date().toISOString().slice(0, 10)
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const steps = [
    { id: 'step-inst', title: 'Institution & Bank', description: 'Institutional scope and issuing bank' },
    { id: 'step-terms', title: 'Financial Terms', description: 'Principal amount, FDR number & tenure' },
    { id: 'step-docs', title: 'Document Metadata', description: 'Supporting certificates & deposit copy' },
    { id: 'step-review', title: 'Review & Submit', description: 'Consistency audit and submission' }
  ];

  // Validate step before proceeding
  const validateCurrentStep = (stepIdx: number): boolean => {
    const allErrors = validateInstrument(
      {
        institution: formData.institution,
        bank: formData.bank,
        fdrNumber: formData.fdrNumber,
        amount: Number(formData.amount),
        issueDate: formData.issueDate,
        maturityDate: formData.maturityDate
      },
      store.instruments
    );

    if (stepIdx === 0) {
      const stepErrors: Record<string, string> = {};
      if (allErrors.institution) stepErrors.institution = allErrors.institution;
      if (allErrors.bank) stepErrors.bank = allErrors.bank;
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    if (stepIdx === 1) {
      const stepErrors: Record<string, string> = {};
      if (allErrors.fdrNumber) stepErrors.fdrNumber = allErrors.fdrNumber;
      if (allErrors.amount) stepErrors.amount = allErrors.amount;
      if (allErrors.issueDate) stepErrors.issueDate = allErrors.issueDate;
      if (allErrors.maturityDate) stepErrors.maturityDate = allErrors.maturityDate;
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    if (stepIdx === 2) {
      if (!documents.some(d => d.category === 'FDR Copy')) {
        setErrors({ docs: 'At least one FDR Copy document must be attached.' });
        return false;
      }
      return true;
    }

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newDocs: Doc[] = files.map((file, i) => ({
      id: `DOC-UPLOAD-${Date.now()}-${i}`,
      name: file.name,
      category: /cert|lien/i.test(file.name)
        ? 'Issuance Certificate'
        : /board|approval/i.test(file.name)
        ? 'Institutional Board Approval'
        : 'FDR Copy',
      status: 'Uploaded',
      size: file.size,
      uploadedAt: new Date().toISOString().slice(0, 10)
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    if (errors.docs) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.docs;
        return next;
      });
    }
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(3)) {
      return;
    }

    setIsSubmitting(true);

    // Generate next unique instrument ID
    const maxNum = Math.max(0, ...store.instruments.map(i => Number(i.id.replace('FDR-', '')) || 0));
    const newId = `FDR-${maxNum + 1}`;

    const newInstrument: Instrument = {
      id: newId,
      institution: formData.institution,
      institutionId: formData.institutionId,
      bank: formData.bank,
      branch: formData.branch || 'Central Branch',
      fdrNumber: formData.fdrNumber.trim(),
      amount: Number(formData.amount),
      issueDate: formData.issueDate,
      maturityDate: formData.maturityDate,
      reference: formData.reference || `REF-${newId}`,
      verification: 'Pending',
      documentStatus: documents.length >= 2 ? 'Complete' : 'Missing Documents',
      lifecycle: 'Active',
      documents,
      history: [
        `Record registered and submitted by ${store.currentUser.name} (${store.role}).`
      ],
      createdAt: new Date().toISOString()
    };

    store.addInstrument(newInstrument);

    // Direct navigate to created record
    setTimeout(() => {
      navigate('/app/fdr/' + newId);
    }, 200);
  };

  return (
    <div className="content" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Submission</div>
          <h1>New Fixed Deposit Submission</h1>
          <p>
            Register a security deposit instrument. All document metadata remains local to this demonstration prototype.
          </p>
        </div>

        <div className="inline-actions">
          <Link to="/app/repository" className="btn btn-secondary">
            <ArrowLeft size={15} /> Cancel & Return
          </Link>
        </div>
      </div>

      <div className="panel" style={{ padding: '28px 32px' }}>
        {/* 21st.dev Stepper */}
        <LifecycleStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={step => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          {/* STEP 0: Institution & Bank Information */}
          {currentStep === 0 && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)', margin: '0 0 18px' }}>
                1. Institutional Scope & Issuing Bank
              </h2>

              <div className="form-grid">
                <div className="field full">
                  <label>Institution Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={e => updateField('institution', e.target.value)}
                    placeholder="Official institution name"
                  />
                  {errors.institution && <span className="error-text">{errors.institution}</span>}
                </div>

                <div className="field">
                  <label>Institution Code / Scope</label>
                  <input
                    type="text"
                    value={formData.institutionId}
                    disabled
                    style={{ background: 'var(--color-disabled)' }}
                  />
                  <small className="muted tiny">Locked to your authenticated institution demo scope.</small>
                </div>

                <div className="field">
                  <label>Institutional Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={e => updateField('reference', e.target.value)}
                    placeholder="e.g. AICTE/2026/FDR-01"
                  />
                </div>

                <div className="field">
                  <label>Issuing Bank Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.bank}
                    onChange={e => updateField('bank', e.target.value)}
                    placeholder="e.g. State Bank of India, Punjab National Bank"
                  />
                  {errors.bank && <span className="error-text">{errors.bank}</span>}
                </div>

                <div className="field">
                  <label>Branch & Location</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={e => updateField('branch', e.target.value)}
                    placeholder="e.g. Corporate Centre, New Delhi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Financial & Term Details */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)', margin: '0 0 18px' }}>
                2. Financial Amount & Tenure Details
              </h2>

              <div className="form-grid">
                <div className="field">
                  <label>FDR / Reference Number <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.fdrNumber}
                    onChange={e => updateField('fdrNumber', e.target.value)}
                    placeholder="e.g. DEMO-991201"
                  />
                  {errors.fdrNumber && <span className="error-text">{errors.fdrNumber}</span>}
                  <small className="muted tiny">Must be a unique fixed deposit advice reference.</small>
                </div>

                <div className="field">
                  <label>Principal Amount (INR) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.amount}
                    onChange={e => updateField('amount', e.target.value)}
                    placeholder="e.g. 1500000"
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>

                <div className="field">
                  <label>Deposit Issue Date <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={e => updateField('issueDate', e.target.value)}
                  />
                  {errors.issueDate && <span className="error-text">{errors.issueDate}</span>}
                </div>

                <div className="field">
                  <label>Maturity Date <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="date"
                    value={formData.maturityDate}
                    onChange={e => updateField('maturityDate', e.target.value)}
                  />
                  {errors.maturityDate && <span className="error-text">{errors.maturityDate}</span>}
                  <small className="muted tiny">Must be strictly after the deposit issue date.</small>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Supporting Documents Attachment */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)', margin: '0 0 10px' }}>
                3. Supporting Document Metadata
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 18px' }}>
                Attach scanned receipts and bank lien certificates. Local file metadata is retained in your browser; binary contents are not uploaded to any remote server.
              </p>

              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--color-surface-subtle)',
                  marginBottom: '20px'
                }}
              >
                <Upload size={32} color="var(--color-primary)" style={{ opacity: 0.7, margin: '0 auto 10px' }} />
                <strong style={{ display: 'block', fontSize: 'var(--text-md)', marginBottom: '4px' }}>
                  Select Supporting PDF Documents
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '14px' }}>
                  FDR deposit advice, bank joint lien confirmation, board sanction letter (.pdf, .png, .jpg)
                </span>
                <label className="btn btn-secondary btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <span>Choose files to attach</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {errors.docs && (
                <div className="alert error" style={{ marginBottom: '16px' }}>
                  {errors.docs}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map(doc => (
                  <div key={doc.id} className="file-row">
                    <FileText size={20} color="var(--color-primary)" />
                    <div className="file-info">
                      <strong>{doc.name}</strong>
                      <small>Category: {doc.category} · Status: {doc.status}</small>
                    </div>
                    <span className="status success">Attached</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                      aria-label={`Remove document ${doc.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Review & Final Submission */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)', margin: '0 0 10px' }}>
                4. Review Submission & Audit Check
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 20px' }}>
                Confirm the instrument parameters before submitting to the central scrutiny queue.
              </p>

              <div className="detail-grid" style={{ marginBottom: '24px' }}>
                <div className="detail-item">
                  <span>Institution</span>
                  <strong>{formData.institution}</strong>
                </div>
                <div className="detail-item">
                  <span>Scope Code</span>
                  <strong>{formData.institutionId}</strong>
                </div>
                <div className="detail-item">
                  <span>Issuing Bank</span>
                  <strong>{formData.bank} ({formData.branch})</strong>
                </div>
                <div className="detail-item">
                  <span>FDR Number</span>
                  <strong>{formData.fdrNumber}</strong>
                </div>
                <div className="detail-item">
                  <span>Principal Amount</span>
                  <strong>{formData.amount ? formatMoney(Number(formData.amount)) : '—'}</strong>
                </div>
                <div className="detail-item">
                  <span>Issue Date</span>
                  <strong>{formatDate(formData.issueDate)}</strong>
                </div>
                <div className="detail-item">
                  <span>Maturity Date</span>
                  <strong>{formatDate(formData.maturityDate)}</strong>
                </div>
                <div className="detail-item">
                  <span>Attached Documents</span>
                  <strong>{documents.length} verified metadata records</strong>
                </div>
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '20px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  Automated Pre-Flight Guardrails:
                </div>
                <div>✓ FDR number format checked and duplicate conflict verified against all records.</div>
                <div>✓ Maturity date validated strictly after deposit issue date.</div>
                <div>✓ Principal amount validated positive whole-currency value.</div>
                <div>✓ Initial status assigned: <strong>Pending Review</strong> in central scrutiny queue.</div>
              </div>
            </div>
          )}

          {/* Wizard Navigation Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            {currentStep > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={15} /> Previous Step
              </button>
            ) : (
              <span className="muted tiny">* Required fields</span>
            )}

            {currentStep < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} /> Submit FDR for Scrutiny
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="footer-note">
        Submissions enter the central AICTE verification queue with status "Pending". Bank verification requires authorized reviewer inspection.
      </p>
    </div>
  );
}
export default NewFdrPage;
