import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingDown, Puzzle, RefreshCcw, Mail, Search,
  ChevronLeft, ChevronRight, Sun, Moon, LogOut,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import type { LucideProps } from 'lucide-react';

// Icon map — keeps the sidebar config clean
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  TrendingDown,
  Puzzle,
  RefreshCcw,
  Mail,
  Search,
};

const NAV_LINKS = [
  { path: '/dashboard/funnel',    label: 'Funnel',      icon: 'TrendingDown' },
  { path: '/dashboard/features',  label: 'Features',    icon: 'Puzzle' },
  { path: '/dashboard/retention', label: 'Retention',   icon: 'RefreshCcw' },
  { path: '/dashboard/email',     label: 'Email',       icon: 'Mail' },
  { path: '/lookup',              label: 'User Lookup', icon: 'Search' },
];

// ── Sidebar ───────────────────────────────────────────────────

export const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({
  collapsed,
  onToggle,
}) => (
  <aside
    id="sidebar"
    style={{
      width: collapsed ? 64 : 240,
      minHeight: '100%',
      background: 'var(--panel)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1)',
      flexShrink: 0,
      overflow: 'hidden',
    }}
  >
    {/* Logo */}
    <div
      style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid var(--line)',
        minHeight: 57,
      }}
    >
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
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', marginBottom: 1 }}>
            TalentBridge
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap' }}>Analytics Portal</p>
        </div>
      )}
    </div>

    {/* Nav links */}
    <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV_LINKS.map(link => {
        const Icon = ICON_MAP[link.icon];
        return (
          <NavLink
            key={link.path}
            to={link.path}
            id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? link.label : undefined}
          >
            <Icon size={17} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {link.label}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>

    {/* Collapse toggle */}
    <button
      onClick={onToggle}
      className="btn-icon"
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
);

// ── Header ────────────────────────────────────────────────────

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
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

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <header
      id="app-header"
      style={{
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
        padding: '0 24px',
        height: 57,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <span style={{ color: 'var(--faint)', fontSize: 13 }}>{today}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Dark mode toggle */}
        <button
          className="btn-icon"
          onClick={toggleMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          id="dark-mode-toggle"
        >
          {isDark ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
        </button>

        {/* User pill */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px',
            background: 'var(--panel-2)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#2DD4BF', fontSize: 11, fontWeight: 700 }}>
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: 11 }}>{user?.role}</span>
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          className="btn btn-ghost"
          style={{ padding: '6px 12px', fontSize: 13, gap: 6 }}
          onClick={handleLogout}
        >
          <LogOut size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </header>
  );
};

// ── Layout shell ──────────────────────────────────────────────

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main
          id="main-content"
          style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}
        >
          <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
