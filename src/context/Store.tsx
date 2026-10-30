import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DemoState, Role, Instrument, WorkflowRequest, Notice, AuditEvent, DemoUser } from '../types';
import { initialState, seedUsers } from '../data/seed';
import { DEMO_USERS } from '../data/auth';
import { STORAGE_KEY } from '../utils/logic';

interface Store extends DemoState {
  currentUser: DemoUser;
  setRole: (r: Role) => void;
  setUser: (userId: string) => void;
  login: (email: string, password?: string, overrideUser?: DemoUser) => { success: boolean; error?: string };
  logout: () => void;
  addInstrument: (i: Instrument) => void;
  updateInstrument: (id: string, patch: Partial<Instrument>, action: string, reason?: string) => void;
  flagDiscrepancy: (id: string, reason: string, notes?: string) => void;
  verifyInstrument: (id: string, notes?: string) => void;
  returnForCorrection: (id: string, reason: string) => void;
  addRequest: (r: WorkflowRequest) => void;
  updateRequest: (id: string, patch: Partial<WorkflowRequest>, action: string, reason?: string) => void;
  renewInstrument: (oldId: string, newFdr: Partial<Instrument>, reason: string) => Instrument;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setThresholds: (v: number[]) => void;
  reset: () => void;
  addAudit: (action: string, entity: string, description: string, reason?: string) => void;
}

const StoreContext = createContext<Store | null>(null);

const clone = (): DemoState => JSON.parse(JSON.stringify(initialState)) as DemoState;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.instruments) &&
          Array.isArray(parsed.requests) &&
          Array.isArray(parsed.audit)
        ) {
          // Synchronize users with authoritative DEMO_USERS so credentials and emails are always valid
          const syncedUsers = DEMO_USERS.map(demoUser => {
            const existing = (parsed.users || []).find(
              (u: any) => u.id === demoUser.id || u.role === demoUser.role || (u.email && u.email.toLowerCase() === demoUser.email.toLowerCase())
            );
            return {
              ...demoUser,
              ...(existing || {}),
              // Guarantee authoritative credentials
              id: demoUser.id,
              name: demoUser.name,
              title: demoUser.title,
              role: demoUser.role,
              email: demoUser.email,
              password: demoUser.password,
              institutionId: demoUser.institutionId,
              department: demoUser.department
            };
          });

          return {
            ...parsed,
            users: syncedUsers,
            thresholds: parsed.thresholds || [90, 60, 30, 7],
            isAuthenticated: parsed.isAuthenticated ?? false,
            currentUserId: parsed.currentUserId || (syncedUsers.find((u: any) => u.role === parsed.role)?.id || 'u-inst-1')
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state from localStorage, falling back to seed data:', e);
    }
    return clone();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist demo state to localStorage:', e);
    }
  }, [state]);

  const api = useMemo<Store>(() => {
    const activeUser =
      state.users.find(u => (state.currentUserId && u.id === state.currentUserId) || u.role === state.role) ||
      DEMO_USERS.find(u => u.role === state.role) ||
      DEMO_USERS[0];

    const createAudit = (
      p: DemoState,
      action: string,
      entity: string,
      description: string,
      reason?: string
    ): AuditEvent => ({
      id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      actor: activeUser.name,
      role: p.role,
      action,
      entity,
      description,
      reason
    });

    return {
      ...state,
      currentUser: activeUser,

      login: (email: string, password?: string, overrideUser?: DemoUser) => {
        const cleanEmail = (email || '').toLowerCase().trim();
        const cleanPassword = (password || '').trim();

        // Match against overrideUser or DEMO_USERS or state.users
        const targetUser =
          overrideUser ||
          DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail) ||
          state.users.find(u => (u.email || '').toLowerCase() === cleanEmail);

        if (!targetUser) {
          if (!cleanEmail) {
            return { success: false, error: 'Please enter your registered institutional email address.' };
          }
          return {
            success: false,
            error: 'Demo account not found for this email address. Please select one of the four demonstration accounts below.'
          };
        }

        if (!overrideUser) {
          if (!cleanPassword) {
            return { success: false, error: 'Please enter your account password.' };
          }

          const isMatch =
            cleanPassword === targetUser.password ||
            cleanPassword === 'SecurityDeposit@2026' ||
            cleanPassword === 'Demo@1234' ||
            cleanPassword === 'demo';

          if (!isMatch) {
            return {
              success: false,
              error: 'Invalid password. Please check your credentials or click a demo persona below to autofill.'
            };
          }
        }

        setState(p => {
          const updatedUsers = p.users.map(u => (u.id === targetUser.id ? { ...u, ...targetUser } : u));
          return {
            ...p,
            users: updatedUsers,
            role: targetUser.role,
            institutionId: targetUser.institutionId,
            currentUserId: targetUser.id,
            isAuthenticated: true,
            audit: [
              createAudit(
                { ...p, role: targetUser.role },
                'User Signed In',
                'AUTH',
                `User ${targetUser.name} authenticated successfully as ${targetUser.role}.`
              ),
              ...p.audit
            ]
          };
        });

        return { success: true };
      },

      logout: () => {
        setState(p => ({
          ...p,
          isAuthenticated: false,
          audit: [
            createAudit(
              p,
              'User Signed Out',
              'AUTH',
              `User ${activeUser.name} signed out of session.`
            ),
            ...p.audit
          ]
        }));
      },

      setRole: (role: Role) => {
        setState(p => {
          const user = DEMO_USERS.find(u => u.role === role) || p.users.find(u => u.role === role);
          return {
            ...p,
            role,
            institutionId: user?.institutionId || 'inst-1',
            currentUserId: user?.id || p.currentUserId,
            audit: [
              createAudit(
                p,
                'Demo Role Switched',
                'AUTH',
                `Switched active demo role to ${role}.`,
                'Simulated role navigation'
              ),
              ...p.audit
            ]
          };
        });
      },

      setUser: (userId: string) => {
        setState(p => {
          const u = DEMO_USERS.find(x => x.id === userId) || p.users.find(x => x.id === userId);
          if (!u) return p;
          return {
            ...p,
            role: u.role,
            institutionId: u.institutionId,
            currentUserId: u.id,
            audit: [
              createAudit(p, 'User Profile Switched', 'AUTH', `Switched active demo identity to ${u.name} (${u.role}).`),
              ...p.audit
            ]
          };
        });
      },

      addAudit: (action, entity, description, reason) => {
        setState(p => ({
          ...p,
          audit: [createAudit(p, action, entity, description, reason), ...p.audit]
        }));
      },

      addInstrument: (i: Instrument) => {
        setState(p => {
          const newNotice: Notice = {
            id: 'N-' + Date.now(),
            title: 'New FDR Submission',
            description: `${i.id} (${i.fdrNumber}) submitted for ₹${i.amount.toLocaleString('en-IN')}. Pending review.`,
            severity: 'info',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: i.id,
            link: '/app/fdr/' + i.id
          };
          return {
            ...p,
            instruments: [i, ...p.instruments],
            notifications: [newNotice, ...p.notifications],
            audit: [
              createAudit(
                p,
                'Instrument Created',
                i.id,
                `Submitted FDR ${i.fdrNumber} for ${i.institution} under ${i.bank}.`,
                'Initial deposit registration'
              ),
              ...p.audit
            ]
          };
        });
      },

      updateInstrument: (id: string, patch: Partial<Instrument>, action: string, reason?: string) => {
        setState(p => ({
          ...p,
          instruments: p.instruments.map(i =>
            i.id === id
              ? {
                  ...i,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                  history: [`${action}${reason ? ` (${reason})` : ''}`, ...i.history]
                }
              : i
          ),
          audit: [createAudit(p, action, id, action, reason), ...p.audit]
        }));
      },

      flagDiscrepancy: (id: string, reason: string, notes?: string) => {
        setState(p => {
          const inst = p.instruments.find(i => i.id === id);
          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: 'Discrepancy Detected',
            description: `${id} (${inst?.fdrNumber || ''}) flagged: ${reason}`,
            severity: 'error',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: id,
            link: '/app/fdr/' + id
          };
          return {
            ...p,
            instruments: p.instruments.map(i =>
              i.id === id
                ? {
                    ...i,
                    verification: 'Discrepancy Found',
                    documentStatus: 'Discrepancy Detected',
                    discrepancyReason: reason,
                    reviewNotes: notes || reason,
                    updatedAt: new Date().toISOString(),
                    history: [`Discrepancy flagged: ${reason}`, ...i.history]
                  }
                : i
            ),
            notifications: [notice, ...p.notifications],
            audit: [
              createAudit(p, 'Discrepancy Flagged', id, `Flagged discrepancy on ${id}: ${reason}`, reason),
              ...p.audit
            ]
          };
        });
      },

      verifyInstrument: (id: string, notes?: string) => {
        setState(p => {
          const inst = p.instruments.find(i => i.id === id);
          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: 'FDR Verified',
            description: `${id} has been verified by authorized reviewer.`,
            severity: 'success',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: id,
            link: '/app/fdr/' + id
          };
          return {
            ...p,
            instruments: p.instruments.map(i =>
              i.id === id
                ? {
                    ...i,
                    verification: 'Verified by Authorized Reviewer',
                    documentStatus: 'Complete',
                    lifecycle: 'Active',
                    reviewNotes: notes || 'Verified by authorized reviewing official.',
                    updatedAt: new Date().toISOString(),
                    history: ['Verified by Authorized Reviewer', ...i.history]
                  }
                : i
            ),
            notifications: [notice, ...p.notifications],
            audit: [
              createAudit(
                p,
                'Instrument Verified',
                id,
                `Scrutiny passed. Verification status updated to Verified by Authorized Reviewer.`,
                notes || 'Completed scrutiny checklist'
              ),
              ...p.audit
            ]
          };
        });
      },

      returnForCorrection: (id: string, reason: string) => {
        setState(p => {
          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: 'Correction Required',
            description: `${id} returned for correction: ${reason}`,
            severity: 'warning',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: id,
            link: '/app/fdr/' + id
          };
          return {
            ...p,
            instruments: p.instruments.map(i =>
              i.id === id
                ? {
                    ...i,
                    verification: 'Correction Required',
                    reviewNotes: reason,
                    updatedAt: new Date().toISOString(),
                    history: [`Returned for correction: ${reason}`, ...i.history]
                  }
                : i
            ),
            notifications: [notice, ...p.notifications],
            audit: [
              createAudit(p, 'Returned for Correction', id, `Record returned to institution: ${reason}`, reason),
              ...p.audit
            ]
          };
        });
      },

      addRequest: (r: WorkflowRequest) => {
        setState(p => {
          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: `${r.kind} Request Submitted`,
            description: `${r.id} for instrument ${r.instrumentId} submitted for review.`,
            severity: 'info',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: r.instrumentId,
            link: r.kind === 'Release' ? '/app/releases' : '/app/renewals'
          };
          return {
            ...p,
            requests: [r, ...p.requests],
            instruments: p.instruments.map(i =>
              i.id === r.instrumentId
                ? {
                    ...i,
                    lifecycle:
                      r.kind === 'Release'
                        ? 'Release Requested'
                        : r.kind === 'Renewal' || r.kind === 'Replacement'
                        ? 'Renewal Requested'
                        : i.lifecycle,
                    history: [`${r.kind} request ${r.id} filed (${r.reason})`, ...i.history]
                  }
                : i
            ),
            notifications: [notice, ...p.notifications],
            audit: [
              createAudit(p, `${r.kind} Request Submitted`, r.id, `Submitted ${r.kind} request: ${r.reason}`, r.reason),
              ...p.audit
            ]
          };
        });
      },

      updateRequest: (id: string, patch: Partial<WorkflowRequest>, action: string, reason?: string) => {
        setState(p => {
          const req = p.requests.find(r => r.id === id);
          if (!req) return p;

          let linkedInstrumentPatch: Partial<Instrument> | undefined;
          if (patch.status === 'Approved' && req.kind === 'Release') {
            linkedInstrumentPatch = {
              lifecycle: 'Released',
              history: [`Release request ${req.id} approved by Approving Authority`, ...(p.instruments.find(i => i.id === req.instrumentId)?.history || [])]
            };
          } else if (patch.status === 'Awaiting Approval' && req.kind === 'Release') {
            linkedInstrumentPatch = {
              lifecycle: 'Under Approval'
            };
          } else if (patch.status === 'Rejected' && req.kind === 'Release') {
            linkedInstrumentPatch = {
              lifecycle: 'Active'
            };
          }

          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: `${req.kind} Request ${patch.status || action}`,
            description: `${req.id}: ${reason || action}`,
            severity: patch.status === 'Rejected' ? 'error' : patch.status === 'Approved' ? 'success' : 'info',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: req.instrumentId,
            link: req.kind === 'Release' ? '/app/releases' : '/app/renewals'
          };

          return {
            ...p,
            requests: p.requests.map(r =>
              r.id === id
                ? {
                    ...r,
                    ...patch,
                    decisionReason: reason || r.decisionReason,
                    decidedBy: patch.status === 'Approved' || patch.status === 'Rejected' ? activeUser.name : r.decidedBy,
                    decidedAt: patch.status === 'Approved' || patch.status === 'Rejected' ? new Date().toISOString() : r.decidedAt
                  }
                : r
            ),
            instruments: linkedInstrumentPatch
              ? p.instruments.map(i => (i.id === req.instrumentId ? { ...i, ...linkedInstrumentPatch } : i))
              : p.instruments,
            notifications: [notice, ...p.notifications],
            audit: [createAudit(p, action, id, `${action}: ${reason || id}`, reason), ...p.audit]
          };
        });
      },

      renewInstrument: (oldId: string, newFdrPatch: Partial<Instrument>, reason: string): Instrument => {
        let createdInstrument: Instrument;
        setState(p => {
          const old = p.instruments.find(i => i.id === oldId);
          if (!old) return p;

          const newNumber = Math.max(0, ...p.instruments.map(x => Number(x.id.replace('FDR-', '')) || 0)) + 1;
          const newId = `FDR-${newNumber}`;

          createdInstrument = {
            id: newId,
            institution: old.institution,
            institutionId: old.institutionId,
            bank: newFdrPatch.bank || old.bank,
            branch: newFdrPatch.branch || old.branch,
            fdrNumber: newFdrPatch.fdrNumber || `${old.fdrNumber}-R1`,
            amount: newFdrPatch.amount || old.amount,
            issueDate: newFdrPatch.issueDate || new Date().toISOString().slice(0, 10),
            maturityDate: newFdrPatch.maturityDate || old.maturityDate,
            verification: 'Pending',
            documentStatus: 'Complete',
            lifecycle: 'Active',
            reference: `RENEWAL-${old.id}`,
            documents: newFdrPatch.documents || old.documents.map(d => ({ ...d, id: 'DOC-' + Date.now() })),
            history: [
              `Created as renewal/replacement for ${old.id}. Reason: ${reason}`
            ],
            replacementFor: old.id,
            createdAt: new Date().toISOString()
          };

          const oldPatched: Instrument = {
            ...old,
            lifecycle: 'Archived',
            replacementId: newId,
            history: [`Replaced by renewal instrument ${newId} (${reason})`, ...old.history],
            updatedAt: new Date().toISOString()
          };

          const reqId = `REN-${3000 + p.requests.length + 1}`;
          const renewalReq: WorkflowRequest = {
            id: reqId,
            kind: 'Renewal',
            instrumentId: old.id,
            replacementId: newId,
            status: 'Completed',
            reason,
            actor: activeUser.name,
            actorRole: p.role,
            createdAt: new Date().toISOString(),
            decisionReason: 'Automatic completion: replacement FDR registered in system.'
          };

          const notice: Notice = {
            id: 'N-' + Date.now(),
            title: 'FDR Renewal Registered',
            description: `${newId} has been created as replacement for ${old.id}.`,
            severity: 'success',
            createdAt: new Date().toISOString(),
            read: false,
            instrumentId: newId,
            link: '/app/fdr/' + newId
          };

          return {
            ...p,
            instruments: [createdInstrument, ...p.instruments.map(i => (i.id === old.id ? oldPatched : i))],
            requests: [renewalReq, ...p.requests],
            notifications: [notice, ...p.notifications],
            audit: [
              createAudit(
                p,
                'Instrument Renewed/Replaced',
                newId,
                `Registered replacement FDR ${newId} for ${old.id}. Prior record archived with linked history.`,
                reason
              ),
              ...p.audit
            ]
          };
        });

        // @ts-ignore
        return createdInstrument;
      },

      markRead: (id: string) => {
        setState(p => ({
          ...p,
          notifications: p.notifications.map(n => (n.id === id ? { ...n, read: true } : n))
        }));
      },

      markAllRead: () => {
        setState(p => ({
          ...p,
          notifications: p.notifications.map(n => ({ ...n, read: true })),
          audit: [createAudit(p, 'Notifications Cleared', 'NOTIFICATIONS', 'Marked all notifications as read.')]
        }));
      },

      setThresholds: (v: number[]) => {
        setState(p => ({
          ...p,
          thresholds: v,
          audit: [
            createAudit(
              p,
              'Reminder Thresholds Updated',
              'SETTINGS',
              `Maturity reminder thresholds updated to: [${v.join(', ')}] days.`
            ),
            ...p.audit
          ]
        }));
      },

      reset: () => {
        const fresh = clone();
        setState(fresh);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider is missing from component tree');
  return ctx;
}
