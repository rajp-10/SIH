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
  Info
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
    }, 200);
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
    }, 180);
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
          padding: '16px clamp(20px, 4vw, 48px)',
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
            gap: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Overview</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Landmark size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-heading)', letterSpacing: '-0.02em' }}>
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
          padding: '40px 20px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            padding: '36px 32px'
          }}
        >
          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <Landmark size={26} />
            </div>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--color-heading)',
                margin: '0 0 6px',
                letterSpacing: '-0.02em'
              }}
            >
              Welcome Back
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Sign in to access institutional FDR lifecycle records
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-alert-danger-bg)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger-text)',
                fontSize: 'var(--text-xs)',
                marginBottom: '20px',
                lineHeight: 1.45
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-danger)' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: '18px' }}>
              <label htmlFor="signin-email" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>
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
                    paddingLeft: '38px',
                    fontSize: 'var(--text-sm)',
                    borderColor: error ? 'var(--color-danger)' : undefined
                  }}
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="signin-password" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 500
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
                    paddingLeft: '38px',
                    paddingRight: '40px',
                    fontSize: 'var(--text-sm)',
                    borderColor: error ? 'var(--color-danger)' : undefined
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
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
                    right: '10px',
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 'var(--text-sm)',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Persona Quick-Fill */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.06em'
                }}
              >
                Saved Profiles
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Click to autofill & authenticate
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {DEMO_USERS.map(u => {
                const isSelected = email.toLowerCase() === u.email.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    disabled={isLoading}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-surface-subtle)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-heading)' }}>
                      {u.title || u.role}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text)', marginTop: '2px' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {u.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provisioning Notice */}
          <div
            style={{
              marginTop: '22px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              color: 'var(--color-text-subtle)',
              lineHeight: 1.45,
              display: 'flex',
              gap: '8px'
            }}
          >
            <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              Privileged roles (Reviewing Official, Approving Authority, System Administrator) are provisioned through internal administration. Public self-registration is disabled.
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Dialog */}
      {forgotPasswordOpen && (
        <div className="dialog-backdrop" onClick={() => setForgotPasswordOpen(false)}>
          <div
            className="dialog"
            style={{ maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-surface-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-heading)' }}>
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
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-success-bg)',
                    color: 'var(--color-success-text)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    Password reset instructions dispatched to <strong>{email}</strong>.
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
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Enter your registered institutional email to receive secure password recovery instructions.
                </p>
                <div className="field" style={{ marginBottom: '18px' }}>
                  <label htmlFor="recovery-email" style={{ fontSize: 'var(--text-xs)' }}>Registered Email</label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@institution.ac.in"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setForgotPasswordOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
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
          padding: '16px 32px',
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
