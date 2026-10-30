import React, { useState } from 'react';
import { Users, ShieldCheck, UserCheck, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStore } from '../context/Store';
import { can, rolePermissions } from '../utils/logic';
import { AccessDenied } from '../components/AccessDenied';
import type { Role } from '../types';

export function UsersPage() {
  const store = useStore();
  const isAdmin = can(store.role, 'canManageUsers');

  const [previewRole, setPreviewRole] = useState<Role>(store.role);

  const permissionsMatrix: Record<Role, { allowed: string[]; prohibited: string[] }> = {
    'Institution User': {
      allowed: [
        'Submit new Fixed Deposit Receipts (New FDR)',
        'View own institutional instruments (scoped to institutionId)',
        'Attach and replace supporting PDF documents & certificates',
        'Initiate renewal & replacement workflows',
        'Submit deposit release & refund applications',
        'Receive and mark maturity & discrepancy notifications'
      ],
      prohibited: [
        'Approve own release requests (Strictly prohibited)',
        'Access reviewing official scrutiny actions',
        'View other institutions\' confidential records',
        'Perform final regulatory verification'
      ]
    },
    'AICTE Reviewing Official': {
      allowed: [
        'View submitted instruments in scrutiny queue',
        'Examine document metadata and branch stamps',
        'Verify compliance checklist criteria',
        'Flag discrepancies with written justifications',
        'Return records to institutions for correction',
        'Recommend eligible release requests for financial sanction'
      ],
      prohibited: [
        'See or use New FDR action anywhere in system',
        'Submit new institutional FDRs',
        'Grant final release approval without Approving Authority sign-off'
      ]
    },
    'Approving Authority': {
      allowed: [
        'Review scrutinized release & refund applications',
        'Grant final statutory release approval with mandatory reason',
        'Reject non-compliant release requests with written reason',
        'Inspect cross-institutional deposit records and decision history'
      ],
      prohibited: [
        'See or use New FDR action anywhere in system',
        'Submit new institutional FDRs',
        'Approve release requests prior to completed reviewer scrutiny'
      ]
    },
    'System Administrator': {
      allowed: [
        'Manage demonstration users and simulated personas',
        'Configure system maturity reminder thresholds',
        'Inspect immutable system-wide regulatory audit logs',
        'Reset demo environment state and local cache'
      ],
      prohibited: [
        'Automatically receive financial release approval authority',
        'See or use New FDR action anywhere in system',
        'Bypass statutory scrutiny sign-offs'
      ]
    }
  };

  return (
    <div className="content">
      <div className="page-title">
        <div>
          <div className="eyebrow-sm">FDR Guardian / Administration</div>
          <h1>User Governance & Role Scope</h1>
          <p>
            {isAdmin
              ? 'Technical administration directory, user roles, and access control governance.'
              : 'Institutional profile, assigned security deposit scope, and role permissions.'}
          </p>
        </div>
      </div>

      {/* Active User Profile Summary Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Active Identity
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
            {store.currentUser.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {store.currentUser.email || 'Registered Demo Account'}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Assigned Role
          </span>
          <div style={{ marginTop: '4px' }}>
            <span className="status success" style={{ fontWeight: 600 }}>
              {store.role}
            </span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Authorized Scope
          </span>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
            {store.role === 'Institution User' ? `Institution: ${store.institutionId}` : 'Central Regulatory Jurisdiction'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {store.currentUser.department || 'All Authorized Records'}
          </div>
        </div>
      </div>

      <div className="alert" style={{ marginBottom: '24px' }}>
        <strong>Production Security Notice:</strong> Client-side authentication and role switching is a prototype-level safeguard. In production, roles are validated server-side by OAuth2/OpenID Connect tokens and cryptographically signed claims.
      </div>

      <div className="dashboard-grid">
        {/* User Directory */}
        <section className="panel">
          <div className="panel-head">
            <h2>{isAdmin ? 'Demonstration Identity Directory' : 'System Personas Overview'}</h2>
            <span className="muted tiny">{store.users.length} Personas</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User Persona</th>
                  <th>Assigned Role</th>
                  <th>Institutional Scope</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {store.users.map(u => {
                  const isCurrent = store.currentUser.id === u.id;
                  return (
                    <tr key={u.id} style={{ background: isCurrent ? 'var(--color-primary-subtle)' : undefined }}>
                      <td>
                        <strong>{u.name}</strong>
                        <div className="muted tiny">{u.department || u.id}</div>
                      </td>
                      <td>
                        <span
                          className={`status ${
                            u.role === 'Institution User'
                              ? 'info'
                              : u.role === 'AICTE Reviewing Official'
                              ? 'warning'
                              : u.role === 'Approving Authority'
                              ? 'accent'
                              : 'success'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                          {u.institutionId}
                        </span>
                      </td>
                      <td>
                        {isCurrent ? (
                          <span className="status success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={12} /> Active Persona
                          </span>
                        ) : isAdmin ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => {
                              store.setUser(u.id);
                            }}
                          >
                            Switch to Persona
                          </button>
                        ) : (
                          <span className="muted tiny">Read-only Scope</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Role Permissions Matrix */}
        <section className="panel">
          <div className="panel-head">
            <h2>Role Policy Boundaries</h2>
            <select
              value={previewRole}
              onChange={e => setPreviewRole(e.target.value as Role)}
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}
            >
              <option value="Institution User">Institution User</option>
              <option value="AICTE Reviewing Official">AICTE Reviewing Official</option>
              <option value="Approving Authority">Approving Authority</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Permitted Regulatory Actions
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {permissionsMatrix[previewRole].allowed.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Prohibited by Guardrail Policy
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {permissionsMatrix[previewRole].prohibited.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
export default UsersPage;
