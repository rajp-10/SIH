import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark,
  LayoutDashboard,
  Wallet,
  FilePlus2,
  ShieldCheck,
  RefreshCw,
  ArrowDownToLine,
  Bell,
  History,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  ArrowLeft,
  ChevronDown,
  UserCheck,
  LogOut,
  Building2,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { useStore } from '../context/Store';
import { can, visibleInstruments } from '../utils/logic';
import type { Role } from '../types';
import { ActionSearchBar } from './21st/ActionSearchBar';
import { NotificationStack } from './21st/NotificationStack';

const ROLES: Role[] = [
  'Institution User',
  'AICTE Reviewing Official',
  'Approving Authority',
  'System Administrator'
];

interface NavItemDef {
  label: string;
  path: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  permission?: string;
  badge?: number | string;
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}

export function Shell({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = store.notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    store.logout();
    navigate('/signin');
  };

  // Build role-specific navigation hierarchy
  const getNavGroups = (role: Role): NavGroupDef[] => {
    switch (role) {
      case 'Institution User':
        return [
          {
            label: 'Institutional Desk',
            items: [
              { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
              { label: 'My FDRs', path: '/app/repository', icon: Wallet },
              { label: 'Submit New FDR', path: '/app/fdr/new', icon: FilePlus2, permission: 'canCreateFdr' }
            ]
          },
          {
            label: 'Requests & Lifecycle',
            items: [
              { label: 'Release Requests', path: '/app/releases', icon: ArrowDownToLine },
              { label: 'Renewals & Replacement', path: '/app/renewals', icon: RefreshCw },
              { label: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined }
            ]
          },
          {
            label: 'Institutional Profile',
            items: [
              { label: 'Profile & Access Scope', path: '/app/users', icon: Users }
            ]
          }
        ];

      case 'AICTE Reviewing Official':
        return [
          {
            label: 'Scrutiny Cell',
            items: [
              { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
              { label: 'FDR Intelligence', path: '/app/intelligence', icon: BrainCircuit, permission: 'canViewIntelligence' },
              { label: 'Scrutiny Queue', path: '/app/verification', icon: ShieldCheck, permission: 'canReviewFdr' },
              { label: 'FDR Records Registry', path: '/app/repository', icon: Wallet }
            ]
          },
          {
            label: 'Workflow Monitoring',
            items: [
              { label: 'Workflow Requests', path: '/app/releases', icon: ArrowDownToLine },
              { label: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined }
            ]
          },
          {
            label: 'Compliance & Audit',
            items: [
              { label: 'Audit Trail', path: '/app/audit', icon: History, permission: 'canViewAuditLog' },
              { label: 'Reports & Export', path: '/app/reports', icon: BarChart3 }
            ]
          }
        ];

      case 'Approving Authority':
        return [
          {
            label: 'Sanctions Directorate',
            items: [
              { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
              { label: 'FDR Intelligence', path: '/app/intelligence', icon: BrainCircuit, permission: 'canViewIntelligence' },
              { label: 'Release Requests', path: '/app/releases', icon: ArrowDownToLine, permission: 'canApproveRelease' },
              { label: 'FDR Records Registry', path: '/app/repository', icon: Wallet }
            ]
          },
          {
            label: 'Oversight & History',
            items: [
              { label: 'Audit Trail', path: '/app/audit', icon: History, permission: 'canViewAuditLog' },
              { label: 'Reports & Export', path: '/app/reports', icon: BarChart3 },
              { label: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined }
            ]
          }
        ];

      case 'System Administrator':
      default:
        return [
          {
            label: 'Administration',
            items: [
              { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
              { label: 'User Management', path: '/app/users', icon: Users, permission: 'canManageUsers' },
              { label: 'System Settings', path: '/app/settings', icon: Settings, permission: 'canConfigureSettings' }
            ]
          },
          {
            label: 'System Governance',
            items: [
              { label: 'Audit Logs', path: '/app/audit', icon: History, permission: 'canViewAuditLog' },
              { label: 'System Reports', path: '/app/reports', icon: BarChart3 },
              { label: 'FDR Repository (Read)', path: '/app/repository', icon: Wallet }
            ]
          }
        ];
    }
  };

  const navGroups = getNavGroups(store.role);

  // Helper to determine if an item is permitted
  const isNavPermitted = (item: NavItemDef) => {
    if (!item.permission) return true;
    return can(store.role, item.permission);
  };

  const currentTitle = navGroups
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname)?.label || 'FDR Guardian';

  return (
    <div className="workspace">
      {/* 21st.dev Command Palette */}
      <ActionSearchBar
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Sidebar Navigation — Restrained Light Institutional Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand" onClick={() => navigate('/app/dashboard')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">
            <Landmark size={18} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 750, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--color-heading)' }}>FDR Guardian</span>
            <small style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Lifecycle Platform</small>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navGroups.map(group => {
            const permittedItems = group.items.filter(isNavPermitted);
            if (!permittedItems.length) return null;

            return (
              <div key={group.label} style={{ marginBottom: '16px' }}>
                <div className="side-label">{group.label}</div>
                {permittedItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            background: 'var(--color-powder-blue)',
                            color: 'var(--color-heading)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-dusty-blue)'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer User Info & Sign Out */}
        <div className="side-bottom" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          <div style={{ padding: '0 8px 10px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-heading)' }}>{store.currentUser.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{store.role}</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {store.role === 'Institution User' ? `Scope: ${store.institutionId}` : 'Scope: Central AICTE Oversight'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              type="button"
              className="side-link"
              style={{ background: 'transparent', border: 0, width: '100%', color: 'var(--color-text-muted)', fontSize: '12px' }}
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={14} /> Return to Overview
            </button>
            <button
              type="button"
              className="side-link"
              style={{ background: 'transparent', border: 0, width: '100%', color: 'var(--color-danger)', fontSize: '12px', fontWeight: 600 }}
              onClick={handleLogout}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Area */}
      <main className="main-area">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-secondary mobile-menu"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <div className="eyebrow-sm">FDR Guardian / Workspace</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-heading)' }}>
                {currentTitle}
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick Command Search Trigger Button */}
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setCommandPaletteOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              aria-label="Open Command Palette"
            >
              <Search size={14} />
              <span className="tiny" style={{ display: 'none', md: 'inline' } as any}>Search actions</span>
              <kbd
                style={{
                  fontSize: '10px',
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-primary)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 600
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* CRITICAL RBAC REQUIREMENT:
                Header New FDR button appears ONLY for Institution User */}
            {can(store.role, 'canCreateFdr') && (
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => navigate('/app/fdr/new')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>New FDR</span>
              </button>
            )}

            {/* Notification Bell with Dropdown Popover */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label={`Notifications, ${unreadCount} unread`}
                style={{ position: 'relative' }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--color-accent)',
                      color: 'var(--color-on-accent)',
                      fontSize: '10px',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: 'min(380px, 90vw)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    padding: '14px',
                    maxHeight: '440px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Notifications</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => store.markAllRead()}
                        style={{ background: 'none', border: 'none', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}
                      >
                        Mark all read
                      </button>
                      <Link
                        to="/app/notifications"
                        onClick={() => setNotificationOpen(false)}
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                  <NotificationStack
                    notifications={store.notifications.slice(0, 5)}
                    onMarkRead={id => store.markRead(id)}
                  />
                </div>
              )}
            </div>

            {/* Persona Scope Badge & Demo Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                aria-label="Switch active demonstration persona"
                className="role-select"
                value={store.role}
                onChange={e => {
                  store.setRole(e.target.value as Role);
                }}
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Header Logout Button */}
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleLogout}
              title="Sign out of demonstration session"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              <span className="tiny" style={{ display: 'none', md: 'inline' } as any}>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        {children}
      </main>
    </div>
  );
}

export default Shell;
