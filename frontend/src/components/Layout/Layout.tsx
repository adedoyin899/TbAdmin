import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_LINKS } from '../../config/constants';

export const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  return (
    <aside
      id="sidebar"
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100%',
        background: 'var(--panel)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.16,1,0.3,1)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--line)',
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
          <span style={{ color: '#2DD4BF', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>TB</span>
        </div>
        {!collapsed && (
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap' }}>
            Analytics
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? link.label : undefined}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{link.icon}</span>
            {!collapsed && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="btn-icon"
        style={{ margin: '12px auto', border: 'none', background: 'transparent' }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed
            ? <path d="M9 18l6-6-6-6" />
            : <path d="M15 18l-6-6 6-6" />}
        </svg>
      </button>
    </aside>
  );
};

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

  return (
    <header
      id="app-header"
      style={{
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--faint)', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Dark mode toggle */}
        <button className="mode-toggle" onClick={toggleMode} title="Toggle dark mode" id="dark-mode-toggle">
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* User info */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
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

        <button
          id="logout-btn"
          className="btn btn-ghost"
          style={{ padding: '6px 12px', fontSize: 13 }}
          onClick={handleLogout}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
};

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
