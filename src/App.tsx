import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useStore } from './context/Store';
import { Shell } from './components/Shell';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { RepositoryPage } from './pages/RepositoryPage';
import { NewFdrPage } from './pages/NewFdrPage';
import { FdrDetailPage } from './pages/FdrDetailPage';
import { VerificationPage } from './pages/VerificationPage';
import { RenewalsPage } from './pages/RenewalsPage';
import { ReleasesPage } from './pages/ReleasesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditPage } from './pages/AuditPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const location = useLocation();

  if (!store.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="content" style={{ maxWidth: '600px', margin: '48px auto', textAlign: 'center' }}>
      <div className="panel" style={{ padding: '40px 24px' }}>
        <h1 style={{ color: 'var(--color-primary)', margin: '0 0 10px' }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
          The requested page or route does not exist in this demonstration prototype.
        </p>
        <Link to="/" className="btn btn-secondary" style={{ marginRight: '10px' }}>
          Overview
        </Link>
        <Link to="/app/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />

      {/* Protected App Workspace Routes */}
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <Shell>
              <DashboardPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/repository"
        element={
          <ProtectedRoute>
            <Shell>
              <RepositoryPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/fdr/new"
        element={
          <ProtectedRoute>
            <Shell>
              <NewFdrPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/fdr/:id"
        element={
          <ProtectedRoute>
            <Shell>
              <FdrDetailPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/verification"
        element={
          <ProtectedRoute>
            <Shell>
              <VerificationPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/renewals"
        element={
          <ProtectedRoute>
            <Shell>
              <RenewalsPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/releases"
        element={
          <ProtectedRoute>
            <Shell>
              <ReleasesPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/notifications"
        element={
          <ProtectedRoute>
            <Shell>
              <NotificationsPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/audit"
        element={
          <ProtectedRoute>
            <Shell>
              <AuditPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/reports"
        element={
          <ProtectedRoute>
            <Shell>
              <ReportsPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/users"
        element={
          <ProtectedRoute>
            <Shell>
              <UsersPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <Shell>
              <SettingsPage />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
