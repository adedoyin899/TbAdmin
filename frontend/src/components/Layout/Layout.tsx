import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingDown, Puzzle, RefreshCcw, Mail, Search, Sparkles,
  ChevronLeft, ChevronRight, Sun, Moon, LogOut,
  BarChart2, Menu, X, Bell, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { NotificationDrawer } from '../Notifications/NotificationDrawer';
import type { LucideProps } from 'lucide-react';

// Icon map — keeps the sidebar config clean
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  TrendingDown,
  Puzzle,
  RefreshCcw,
  Mail,
  Search,
  Sparkles,
  Settings,
};

const NAV_LINKS = [
  { path: '/dashboard/funnel',    label: 'Funnel',        icon: 'TrendingDown' },
  { path: '/dashboard/features',  label: 'Features',      icon: 'Puzzle' },
  { path: '/dashboard/retention', label: 'Retention',     icon: 'RefreshCcw' },
  { path: '/dashboard/email',     label: 'Email',         icon: 'Mail' },
  { path: '/dashboard/rooms',     label: 'Room Insights', icon: 'Sparkles' },
  { path: '/lookup',              label: 'User Directory',icon: 'Search' },
  { path: '/settings',            label: 'Settings',      icon: 'Settings' },
];

// ── Sidebar ───────────────────────────────────────────────────

export const Sidebar: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => (
  <>
    {/* Mobile Backdrop */}
    {mobileOpen && (
      <div
        onClick={onMobileClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          backdropFilter: 'blur(2px)',
        }}
        className="md:hidden animate-fade-in"
      />
    )}

    <aside
      id="sidebar"
      style={{
        background: 'var(--panel)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s ease',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 50,
      }}
      className={`
        fixed inset-y-0 left-0 md:static md:translate-x-0
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--line)',
          minHeight: 57,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart2 size={16} color="#2DD4BF" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <p style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.2 }}>
                TalentBridge
              </p>
              <p style={{ fontSize: 10, color: 'var(--accent2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Admin Portal
              </p>
            </div>
          )}
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onMobileClose}
          className="btn-icon md:hidden"
          style={{ width: 28, height: 28, border: 'none' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav Section Label */}
      {!collapsed && (
        <div style={{ padding: '14px 16px 6px', fontSize: 10, fontWeight: 700, color: 'var(--faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Dashboards & Tools
        </div>
      )}

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_LINKS.map(link => {
          const Icon = ICON_MAP[link.icon];
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '9px 12px',
                borderRadius: 'var(--radius-xs)',
              }}
              title={collapsed ? link.label : undefined}
            >
              {Icon && <Icon size={16} strokeWidth={1.8} />}
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="btn-icon hidden md:flex"
        style={{
          margin: '12px auto',
          border: 'none',
          background: 'var(--panel-2)',
          color: 'var(--dim)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </aside>
  </>
);

// ── Header ────────────────────────────────────────────────────

export const Header: React.FC<{
  onMobileMenuClick: () => void;
  onOpenNotifications: () => void;
}> = ({ onMobileMenuClick, onOpenNotifications }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSettings();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mode') === 'dark'
  );

  const toggleMode = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem('theme-mode', next);
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDisplayName = (email?: string) => {
    if (!email) return 'Admin';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  return (
    <header
      id="app-header"
      style={{
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
        height: 57,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 12,
      }}
      className="px-3 sm:px-6"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuClick}
          className="btn-icon md:hidden"
          title="Open menu"
          id="mobile-menu-btn"
        >
          <Menu size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>
            Welcome, <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{getDisplayName(user?.email)}</strong>
          </span>
          <span className="hidden md:inline" style={{ color: 'var(--faint)', fontSize: 12 }}>
            • Admin Portal
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications Bell */}
        <button
          className="btn-icon"
          onClick={onOpenNotifications}
          title="View Notifications & Alert Triggers"
          style={{ position: 'relative' }}
          id="notification-bell-btn"
        >
          <Bell size={16} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 99,
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--panel)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          className="btn-icon"
          onClick={toggleMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          id="dark-mode-toggle"
        >
          {isDark ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
        </button>

        {/* Settings button */}
        <button
          className="btn-icon"
          onClick={() => navigate('/settings')}
          title="Settings & Anomaly Triggers"
          id="header-settings-btn"
        >
          <Settings size={15} strokeWidth={1.8} />
        </button>

        {/* User pill */}
        <div
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px',
            background: 'var(--panel-2)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--line)',
            cursor: 'pointer',
          }}
          title="Account Settings"
        >
          <div
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#2DD4BF', fontSize: 10, fontWeight: 700 }}>
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
            {user?.email}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 6px' }}>{user?.role}</span>
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          className="btn btn-ghost"
          style={{ padding: '6px 10px', fontSize: 12, gap: 5 }}
          onClick={handleLogout}
        >
          <LogOut size={13} strokeWidth={1.8} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

// ── Layout shell ──────────────────────────────────────────────

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header
          onMobileMenuClick={() => setMobileOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        <main
          id="main-content"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
          className="p-3 sm:p-5 md:p-6 lg:p-7"
        >
          <div className="animate-fade-in w-full" style={{ maxWidth: 1240, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      {/* In-App Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};
