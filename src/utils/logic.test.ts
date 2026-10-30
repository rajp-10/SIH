import { describe, it, expect } from 'vitest';
import {
  daysUntil,
  maturityLabel,
  validateInstrument,
  can,
  visibleInstruments,
  canTransitionLifecycle,
  canTransitionVerification,
  formatMoney,
  formatDate
} from './logic';
import { initialState, seedInstruments } from '../data/seed';
import { DEMO_USERS, validateDemoCredentials, findDemoUserByEmail, findDemoUserByRole } from '../data/auth';
import type { Role, Instrument, WorkflowRequest } from '../types';

describe('FDR Guardian — Core Logic & RBAC Test Suite', () => {
  describe('Centralized Demo Authentication for All Four Personas', () => {
    it('defines all four distinct demo personas with IDs, roles, emails, and passwords', () => {
      expect(DEMO_USERS).toHaveLength(4);

      const roles = DEMO_USERS.map(u => u.role);
      expect(roles).toContain('Institution User');
      expect(roles).toContain('AICTE Reviewing Official');
      expect(roles).toContain('Approving Authority');
      expect(roles).toContain('System Administrator');

      for (const u of DEMO_USERS) {
        expect(u.id).toBeTruthy();
        expect(u.name).toBeTruthy();
        expect(u.email).toContain('@');
        expect(u.password).toBeTruthy();
        expect(u.title).toBeTruthy();
      }
    });

    it('authenticates Demo Institution User successfully', () => {
      const res = validateDemoCredentials('priya.sharma@nvit.ac.in', 'SecurityDeposit@2026');
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('Institution User');
      expect(res.user?.institutionId).toBe('inst-1');
    });

    it('authenticates Review Officer successfully', () => {
      const res = validateDemoCredentials('rk.verma@aicte.gov.in', 'SecurityDeposit@2026');
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('AICTE Reviewing Official');
    });

    it('authenticates Approving Authority successfully', () => {
      const res = validateDemoCredentials('sc.nair@aicte.gov.in', 'SecurityDeposit@2026');
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('Approving Authority');
    });

    it('authenticates System Administrator successfully', () => {
      const res = validateDemoCredentials('aditi.sen@admin.fdrguardian.gov.in', 'SecurityDeposit@2026');
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('System Administrator');
    });

    it('handles case-insensitive email matching and trimming', () => {
      const res = validateDemoCredentials('  PRIYA.SHARMA@NVIT.AC.IN  ', 'SecurityDeposit@2026');
      expect(res.error).toBeUndefined();
      expect(res.user?.name).toBe('Dr. Priya Sharma');
    });

    it('returns specific error for unrecognized email', () => {
      const res = validateDemoCredentials('unknown@domain.com', 'SecurityDeposit@2026');
      expect(res.user).toBeUndefined();
      expect(res.error).toContain('Demo account not found');
    });

    it('returns specific error for invalid password', () => {
      const res = validateDemoCredentials('priya.sharma@nvit.ac.in', 'WrongPassword123');
      expect(res.user).toBeUndefined();
      expect(res.error).toContain('Invalid password');
    });

    it('returns required field errors when inputs are blank', () => {
      expect(validateDemoCredentials('', 'pass').error).toContain('Please enter your registered institutional email');
      expect(validateDemoCredentials('priya.sharma@nvit.ac.in', '').error).toContain('Please enter your account password');
    });
  });
  describe('Maturity & Date Calculation Rules', () => {
    it('calculates maturity day boundaries without time-of-day drift', () => {
      expect(daysUntil('2026-10-30', new Date('2026-10-29T23:00:00'))).toBe(1);
      expect(daysUntil('2026-10-29', new Date('2026-10-29T12:00:00'))).toBe(0);
      expect(daysUntil('2026-10-28', new Date('2026-10-29T00:00:00'))).toBe(-1);
    });

    it('labels approaching maturity according to configurable threshold rules', () => {
      const mockInstrument = {
        ...seedInstruments[0],
        maturityDate: '2026-11-05'
      };
      const result = maturityLabel(mockInstrument, [90, 60, 30, 7], new Date('2026-10-29T12:00:00'));
      expect(result.days).toBe(7);
      expect(result.tone).toBe('danger');
      expect(result.label).toBe('Due in 7d');
    });

    it('labels matured instruments requiring follow-up', () => {
      const mockInstrument = {
        ...seedInstruments[0],
        maturityDate: '2026-10-15'
      };
      const result = maturityLabel(mockInstrument, [90, 30, 7], new Date('2026-10-29T00:00:00'));
      expect(result.days).toBe(-14);
      expect(result.tone).toBe('danger');
      expect(result.label).toBe('Matured 14d ago');
    });

    it('labels instruments comfortably on schedule', () => {
      const mockInstrument = {
        ...seedInstruments[0],
        maturityDate: '2027-05-01'
      };
      const result = maturityLabel(mockInstrument, [90, 60, 30, 7], new Date('2026-10-29T00:00:00'));
      expect(result.days).toBeGreaterThan(90);
      expect(result.tone).toBe('success');
      expect(result.label).toBe('On schedule');
    });
  });

  describe('Validation & Field Integrity Rules', () => {
    it('catches missing required fields, non-positive amount, and reversed date order', () => {
      const errors = validateInstrument(
        {
          institution: '',
          fdrNumber: '',
          bank: '',
          amount: 0,
          issueDate: '2026-10-30',
          maturityDate: '2026-10-20'
        },
        seedInstruments
      );

      expect(errors).toMatchObject({
        institution: 'Institution is required',
        fdrNumber: 'FDR number is required',
        bank: 'Bank name is required',
        amount: 'Enter an amount greater than zero',
        maturityDate: 'Maturity date must be after issue date'
      });
    });

    it('detects duplicate FDR number conflicts across existing records', () => {
      const existingFdr = seedInstruments[0].fdrNumber;
      const errors = validateInstrument(
        {
          institution: 'Test College',
          fdrNumber: existingFdr,
          bank: 'Test Bank',
          amount: 500000,
          issueDate: '2026-01-01',
          maturityDate: '2027-01-01'
        },
        seedInstruments
      );

      expect(errors.fdrNumber).toBe('This FDR number already exists');
    });

    it('allows identical FDR number when updating the existing record itself', () => {
      const existing = seedInstruments[0];
      const errors = validateInstrument(
        {
          institution: existing.institution,
          fdrNumber: existing.fdrNumber,
          bank: existing.bank,
          amount: existing.amount,
          issueDate: existing.issueDate,
          maturityDate: existing.maturityDate
        },
        seedInstruments,
        existing.id // currentId
      );

      expect(errors.fdrNumber).toBeUndefined();
    });
  });

  describe('Role-Based Access Control (RBAC) & Separation of Duties', () => {
    it('CRITICAL: Only Institution User has canCreateFdr permission', () => {
      expect(can('Institution User', 'canCreateFdr')).toBe(true);
      expect(can('AICTE Reviewing Official', 'canCreateFdr')).toBe(false);
      expect(can('Approving Authority', 'canCreateFdr')).toBe(false);
      expect(can('System Administrator', 'canCreateFdr')).toBe(false);
    });

    it('CRITICAL: Only AICTE Reviewing Official can scrutinize and flag discrepancies', () => {
      expect(can('AICTE Reviewing Official', 'canReviewFdr')).toBe(true);
      expect(can('AICTE Reviewing Official', 'canFlagDiscrepancy')).toBe(true);
      expect(can('Institution User', 'canReviewFdr')).toBe(false);
      expect(can('Approving Authority', 'canReviewFdr')).toBe(false);
      expect(can('System Administrator', 'canReviewFdr')).toBe(false);
    });

    it('CRITICAL: Only Approving Authority can approve release and refund requests', () => {
      expect(can('Approving Authority', 'canApproveRelease')).toBe(true);
      expect(can('Approving Authority', 'release:decide')).toBe(true);
      expect(can('Institution User', 'canApproveRelease')).toBe(false);
      expect(can('AICTE Reviewing Official', 'canApproveRelease')).toBe(false);
      expect(can('System Administrator', 'canApproveRelease')).toBe(false);
    });

    it('CRITICAL: Only Institution User can initiate renewals and releases', () => {
      expect(can('Institution User', 'canRequestRenewal')).toBe(true);
      expect(can('Institution User', 'canRequestRelease')).toBe(true);
      expect(can('AICTE Reviewing Official', 'canRequestRenewal')).toBe(false);
      expect(can('Approving Authority', 'canRequestRenewal')).toBe(false);
      expect(can('System Administrator', 'canRequestRenewal')).toBe(false);
    });

    it('CRITICAL: Only System Administrator can manage users and configure settings', () => {
      expect(can('System Administrator', 'canManageUsers')).toBe(true);
      expect(can('System Administrator', 'canConfigureSettings')).toBe(true);
      expect(can('Institution User', 'canManageUsers')).toBe(false);
      expect(can('AICTE Reviewing Official', 'canManageUsers')).toBe(false);
      expect(can('Approving Authority', 'canManageUsers')).toBe(false);
    });

    it('Restricts Institution User to records within their assigned institutional scope', () => {
      const state = {
        ...initialState,
        role: 'Institution User' as Role,
        institutionId: 'inst-1'
      };

      const visible = visibleInstruments(state);
      expect(visible.length).toBeGreaterThan(0);
      expect(visible.every(i => i.institutionId === 'inst-1')).toBe(true);
    });

    it('Grants reviewing officials and admins system-wide scope view', () => {
      const reviewerState = {
        ...initialState,
        role: 'AICTE Reviewing Official' as Role
      };
      const adminState = {
        ...initialState,
        role: 'System Administrator' as Role
      };

      expect(visibleInstruments(reviewerState).length).toBe(initialState.instruments.length);
      expect(visibleInstruments(adminState).length).toBe(initialState.instruments.length);
    });
  });

  describe('FDR Lifecycle & Regulatory State Transitions', () => {
    it('validates permitted lifecycle transitions', () => {
      expect(canTransitionLifecycle('Submitted', 'Under Review')).toBe(true);
      expect(canTransitionLifecycle('Under Review', 'Active')).toBe(true);
      expect(canTransitionLifecycle('Active', 'Near Maturity')).toBe(true);
      expect(canTransitionLifecycle('Active', 'Release Requested')).toBe(true);
      expect(canTransitionLifecycle('Release Requested', 'Under Approval')).toBe(true);
      expect(canTransitionLifecycle('Under Approval', 'Released')).toBe(true);
    });

    it('rejects illegal or out-of-order lifecycle transitions', () => {
      expect(canTransitionLifecycle('Released', 'Draft')).toBe(false);
      expect(canTransitionLifecycle('Archived', 'Active')).toBe(false);
    });

    it('validates permitted verification transitions', () => {
      expect(canTransitionVerification('Pending', 'Under Review')).toBe(true);
      expect(canTransitionVerification('Under Review', 'Verified by Authorized Reviewer')).toBe(true);
      expect(canTransitionVerification('Under Review', 'Discrepancy Found')).toBe(true);
      expect(canTransitionVerification('Discrepancy Found', 'Correction Required')).toBe(true);
    });
  });

  describe('Financial Formatting Helpers', () => {
    it('formats currency in Indian Rupees format', () => {
      const formatted = formatMoney(1500000);
      expect(formatted).toContain('15,00,000');
    });

    it('formats dates consistently', () => {
      const formatted = formatDate('2026-10-30');
      expect(formatted).toContain('30');
      expect(formatted).toContain('2026');
    });
  });
});
