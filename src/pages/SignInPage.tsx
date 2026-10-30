import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Landmark,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowLeft,
  Info,
  UserCheck
} from 'lucide-react';
import { useStore } from '../context/Store';
import { DEMO_USERS, DEMO_DEFAULT_PASSWORD } from '../data/auth';
import type { DemoUser } from '../types';

export function SignInPage() {
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('priya.sharma@nvit.ac.in');
  const [password, setPassword] = useState(DEMO_DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Return path if redirected by ProtectedRoute
  const returnTo = (location.state as { from?: string })?.from || '/app/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your registered institutional email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication processing delay
    setTimeout(() => {
      const result = store.login(cleanEmail, password);
      setIsLoading(false);

      if (result.success) {
        navigate(returnTo, { replace: true });
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 180);
  };

  const handleQuickSelect = (user: DemoUser) => {
    const userPass = user.password || DEMO_DEFAULT_PASSWORD;
    setEmail(user.email);
    setPassword(userPass);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = store.login(user.email, userPass, user);
      setIsLoading(false);

      if (result.success) {
        navigate('/app/dashboard', { replace: true });
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 160);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-background)',
        color: 'var(--color-text)'
      }}
    >
      {/* Header bar with Back Link */}
      <header
        style={{
          padding: '0 clamp(20px, 4vw, 48px)',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)'
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-heading)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Overview</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Landmark size={14} />
          </div>
          <span style={{ fontWeight: 750, fontSize: '15px', color: 'var(--color-heading)' }}>
            FDR Guardian
          </span>
        </div>
      </header>

      {/* Main Content Form */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 20px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '32px 28px'
          }}
        >
          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}
            >
              <Landmark size={22} />
            </div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 750,
                color: 'var(--color-heading)',
                margin: '0 0 4px',
                letterSpacing: '-0.015em'
              }}
            >
              Sign In to FDR Guardian
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Institutional fixed deposit record & regulatory workflow access
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-alert-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger-text)',
                fontSize: 'var(--text-xs)',
                marginBottom: '16px',
                lineHeight: 1.45
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-danger)' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Primary Authentication Form */}
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label htmlFor="signin-email" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-heading)' }}>
                Institutional Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@institution.ac.in"
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '34px',
                    fontSize: 'var(--text-sm)',
                    borderColor: error ? 'var(--color-danger)' : undefined
                  }}
                />
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label htmlFor="signin-password" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, margin: 0, color: 'var(--color-heading)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '11px',
                    color: 'var(--color-heading)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '34px',
                    paddingRight: '36px',
                    fontSize: 'var(--text-sm)',
                    borderColor: error ? 'var(--color-danger)' : undefined
                  }}
                />
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 'var(--text-sm)',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isLoading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Visually Secondary Demo Account Access */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.06em'
                }}
              >
                Saved Profiles
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                One-click test profile
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEMO_USERS.map(u => {
                const isSelected = email.toLowerCase() === u.email.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-xs)',
                      border: `1px solid ${isSelected ? 'var(--color-dusty-blue)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-powder-blue)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--color-heading)' }}>
                        {u.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        · {u.title || u.role}
                      </span>
                    </div>

                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {u.role === 'Institution User' ? 'Institution Desk' : u.role === 'AICTE Reviewing Official' ? 'Scrutiny Cell' : u.role === 'Approving Authority' ? 'Sanctions' : 'Technical'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provisioning Notice */}
          <div
            style={{
              marginTop: '18px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.45,
              display: 'flex',
              gap: '6px'
            }}
          >
            <Info size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Privileged roles (Reviewer, Approver, Admin) are provisioned through internal administration.
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Dialog */}
      {forgotPasswordOpen && (
        <div className="dialog-backdrop" onClick={() => setForgotPasswordOpen(false)}>
          <div
            className="dialog"
            style={{ maxWidth: '420px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-powder-blue)',
                  color: 'var(--color-heading)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-heading)' }}>
                  Password Assistance
                </h3>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  Institutional Account Recovery
                </small>
              </div>
            </div>

            {forgotSent ? (
              <div>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-success-bg)',
                    color: 'var(--color-success-text)',
                    border: '1px solid var(--color-success-border)',
                    fontSize: 'var(--text-xs)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>
                    Recovery instructions dispatched to <strong>{email}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotSent(false);
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.5, margin: '0 0 14px' }}>
                  Enter your registered institutional email to receive secure password recovery instructions.
                </p>
                <div className="field" style={{ marginBottom: '16px' }}>
                  <label htmlFor="recovery-email" style={{ fontSize: '11px' }}>Registered Email</label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@institution.ac.in"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => setForgotPasswordOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => setForgotSent(true)}
                  >
                    Send Recovery Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)'
        }}
      >
        FDR Guardian · Institutional Fixed Deposit Receipt Lifecycle Management Platform
      </footer>
    </div>
  );
}

export default SignInPage;
