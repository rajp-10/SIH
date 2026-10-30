/**
 * 21st.dev Component: Action Search Bar / Command Palette
 * @author @kokonutui (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/action-search-bar
 * @adapted For FDR Guardian RBAC, instant keyboard indexing, and role-safe navigation
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
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
  ArrowRight,
  Landmark,
  X,
  Sparkles,
  Command
} from 'lucide-react';
import { useStore } from '../../context/Store';
import { can, visibleInstruments } from '../../utils/logic';
import type { Role } from '../../types';

export interface ActionSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActionSearchBar({ isOpen, onClose }: ActionSearchBarProps) {
  const store = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items based on current role permissions
  const items = useMemo(() => {
    const actions: Array<{
      id: string;
      title: string;
      subtitle?: string;
      category: 'Navigation' | 'Records' | 'Role Switcher' | 'Quick Actions';
      icon: React.ReactNode;
      onSelect: () => void;
      badge?: string;
    }> = [];

    // 1. Navigation items (filtered by permissions)
    actions.push({
      id: 'nav-dash',
      title: 'Dashboard',
      subtitle: 'Overview of FDR portfolio and pending actions',
      category: 'Navigation',
      icon: <LayoutDashboard size={16} />,
      onSelect: () => navigate('/app/dashboard')
    });

    actions.push({
      id: 'nav-repo',
      title: 'FDR Repository',
      subtitle: 'Browse, filter, and inspect security deposit instruments',
      category: 'Navigation',
      icon: <Wallet size={16} />,
      onSelect: () => navigate('/app/repository')
    });

    // CRITICAL RBAC: Only Institution User gets New FDR action
    if (can(store.role, 'canCreateFdr')) {
      actions.push({
        id: 'action-new-fdr',
        title: 'New FDR Submission',
        subtitle: 'Submit a new Fixed Deposit Receipt record (Institution only)',
        category: 'Quick Actions',
        icon: <FilePlus2 size={16} color="var(--color-accent)" />,
        badge: 'Institution Only',
        onSelect: () => navigate('/app/fdr/new')
      });
    }

    if (can(store.role, 'canReviewFdr')) {
      actions.push({
        id: 'nav-verify',
        title: 'Verification Queue',
        subtitle: 'Scrutinize submitted instruments and document metadata',
        category: 'Navigation',
        icon: <ShieldCheck size={16} />,
        onSelect: () => navigate('/app/verification')
      });
    }

    actions.push({
      id: 'nav-renew',
      title: 'Renewals & Replacement',
      subtitle: 'Process maturing FDR renewals and linked replacements',
      category: 'Navigation',
      icon: <RefreshCw size={16} />,
      onSelect: () => navigate('/app/renewals')
    });

    actions.push({
      id: 'nav-release',
      title: 'Release Requests',
      subtitle: 'Review and approve lien discharge and deposit release',
      category: 'Navigation',
      icon: <ArrowDownToLine size={16} />,
      onSelect: () => navigate('/app/releases')
    });

    actions.push({
      id: 'nav-notif',
      title: 'Notifications',
      subtitle: 'Maturity reminders, scrutiny notes, and workflow updates',
      category: 'Navigation',
      icon: <Bell size={16} />,
      onSelect: () => navigate('/app/notifications')
    });

    if (can(store.role, 'canViewAuditLog')) {
      actions.push({
        id: 'nav-audit',
        title: 'Audit Trail',
        subtitle: 'Inspect immutable demonstration event records',
        category: 'Navigation',
        icon: <History size={16} />,
        onSelect: () => navigate('/app/audit')
      });
    }

    actions.push({
      id: 'nav-reports',
      title: 'Reports & Export',
      subtitle: 'Export visible instrument dataset to CSV and view analytics',
      category: 'Navigation',
      icon: <BarChart3 size={16} />,
      onSelect: () => navigate('/app/reports')
    });

    if (can(store.role, 'canManageUsers')) {
      actions.push({
        id: 'nav-users',
        title: 'Users & Roles',
        subtitle: 'Switch demo identity and examine permission matrices',
        category: 'Navigation',
        icon: <Users size={16} />,
        onSelect: () => navigate('/app/users')
      });
    }

    if (can(store.role, 'canConfigureSettings')) {
      actions.push({
        id: 'nav-settings',
        title: 'System Settings',
        subtitle: 'Configure maturity reminder thresholds and reset data',
        category: 'Navigation',
        icon: <Settings size={16} />,
        onSelect: () => navigate('/app/settings')
      });
    }

    // 2. Visible FDR Instruments (Direct jump)
    const instruments = visibleInstruments(store);
    instruments.forEach(inst => {
      actions.push({
        id: `inst-${inst.id}`,
        title: `${inst.id} · ${inst.fdrNumber}`,
        subtitle: `${inst.institution} — ${inst.bank} (₹${inst.amount.toLocaleString('en-IN')})`,
        category: 'Records',
        icon: <Landmark size={16} color="var(--color-primary)" />,
        badge: inst.verification,
        onSelect: () => navigate(`/app/fdr/${inst.id}`)
      });
    });

    // 3. Demo Role Switchers
    const allRoles: Role[] = [
      'Institution User',
      'AICTE Reviewing Official',
      'Approving Authority',
      'System Administrator'
    ];
    allRoles.forEach(r => {
      if (r !== store.role) {
        actions.push({
          id: `role-${r}`,
          title: `Switch to ${r}`,
          subtitle: `Simulate demonstration persona as ${r}`,
          category: 'Role Switcher',
          icon: <Sparkles size={16} color="var(--color-accent)" />,
          onSelect: () => {
            store.setRole(r);
            navigate('/app/dashboard');
          }
        });
      }
    });

    // Filter by query
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [store.role, store.instruments, query, navigate, store]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].onSelect();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 1000, padding: '16px' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Action Search and Command Palette"
        style={{
          width: 'min(640px, 94vw)',
          maxWidth: '640px',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: 'var(--color-surface)'
          }}
        >
          <Search size={18} color="var(--color-primary)" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Type a command, jump to an FDR, or switch roles..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              border: 'none',
              padding: 0,
              fontSize: 'var(--text-base)',
              width: '100%',
              outline: 'none',
              background: 'transparent'
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                background: 'var(--color-secondary)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {items.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>No matching commands or FDR records</p>
              <span style={{ fontSize: 'var(--text-xs)' }}>Try searching by bank, institution, or FDR number</span>
            </div>
          ) : (
            items.map((item, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-active={isActive}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isActive ? 'var(--color-secondary)' : 'transparent',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--color-surface)' : 'var(--color-surface-subtle)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--color-text)' }}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--color-primary-subtle)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <div style={{ opacity: isActive ? 1 : 0, transition: 'opacity 150ms' }}>
                    <ArrowRight size={15} color="var(--color-primary)" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'var(--color-surface-subtle)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to dismiss</span>
          </div>
          <div>
            Current Role: <strong style={{ color: 'var(--color-primary)' }}>{store.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ActionSearchBar;
