import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingDown, Puzzle, RefreshCcw, Mail, Search, Sparkles,
  ChevronLeft, ChevronRight, Sun, Moon, LogOut,
  Menu, X, Bell, Settings,
  ChevronsUpDown, ShieldCheck,
} from 'lucide-react';
import tblogo from '../../assets/tblogo.svg';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { NotificationDrawer } from '../Notifications/NotificationDrawer';
import { CommandPalette } from '../Common/CommandPalette';
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

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main Navigation',
    items: [
      { path: '/dashboard/funnel', label: 'Funnel Conversion', icon: 'TrendingDown' },
      { path: '/dashboard/features', label: 'Feature Adoption', icon: 'Puzzle' },
      { path: '/dashboard/retention', label: 'Cohort Retention', icon: 'RefreshCcw' },
    ],
  },
  {
    title: 'Analytics & Media',
    items: [
      { path: '/dashboard/email', label: 'Email Campaigns', icon: 'Mail' },
      { path: '/dashboard/rooms', label: 'Room Insights', icon: 'Sparkles', badge: '3D' },
    ],
  },
  {
    title: 'Tools & Directory',
    items: [
      { path: '/lookup', label: 'User Directory', icon: 'Search' },
    ],
  },
  {
    title: 'System & Config',
    items: [
      { path: '/settings', label: 'Settings & Alerts', icon: 'Settings' },
    ],
  },
];

const getDisplayName = (email?: string) => {
  if (!email) return 'Admin User';
  const namePart = email.split('@')[0];
  if (namePart.toLowerCase() === 'maz') return 'Maz (Admin)';
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

const getInitials = (email?: string) => {
  if (!email) return 'AU';
  const namePart = email.split('@')[0];
  if (namePart.length >= 2) {
    return (namePart[0] + namePart[1]).toUpperCase();
  }
  return namePart[0].toUpperCase();
};

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
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    onMobileClose();
    await logout();
    navigate('/');
  };

  return (
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
          height: '100%',
        }}
        className={`
          fixed inset-y-0 left-0 md:static md:translate-x-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
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
            {/* TB Logo — full wordmark when expanded, cropped icon portion when collapsed */}
            {collapsed ? (
              <img
                src={tblogo}
                alt="TalentBridge"
                style={{ height: 26, width: 'auto', flexShrink: 0 }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={tblogo}
                  alt="TalentBridge"
                  style={{ height: 24, width: 'auto' }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-2)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    paddingLeft: 2,
                  }}
                >
                  Admin
                </span>
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

        {/* Scrollable Nav Sections with Subheadings */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 8px' }}>
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title} style={{ marginBottom: 16 }}>
              {!collapsed && (
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--faint)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              )}
              {collapsed && sIdx > 0 && (
                <div style={{ height: 1, background: 'var(--line)', margin: '8px 6px' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(link => {
                  const Icon = ICON_MAP[link.icon];
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={onMobileClose}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      style={{
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '10px 0' : '8px 12px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                      title={collapsed ? link.label : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {Icon && <Icon size={16} strokeWidth={1.8} />}
                        {!collapsed && <span>{link.label}</span>}
                      </div>
                      {!collapsed && link.badge && (
                        <span
                          className="badge"
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            background: 'rgba(45, 212, 191, 0.12)',
                            color: '#2DD4BF',
                            fontWeight: 700,
                          }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Collapse button & User Profile Card at Bottom Left */}
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--panel-2)' }}>
          {/* Collapse Toggle */}
          <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', padding: '6px 12px' }}>
            <button
              onClick={onToggle}
              className="btn-icon hidden md:flex"
              style={{
                width: 24,
                height: 24,
                border: 'none',
                background: 'transparent',
                color: 'var(--faint)',
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* User Profile Card at Bottom Left (with Popover Dropdown) */}
          <div ref={userMenuRef} style={{ position: 'relative', padding: collapsed ? '8px 6px 14px' : '8px 10px 14px' }}>
            {/* Popover popup */}
            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 8,
                  right: 8,
                  marginBottom: 8,
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-lg)',
                  padding: 6,
                  zIndex: 60,
                }}
                className="animate-slide-up"
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{getDisplayName(user?.email)}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                  <span className="badge badge-neutral" style={{ fontSize: 10, marginTop: 4, textTransform: 'uppercase' }}>
                    {user?.role || 'admin'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onMobileClose();
                    navigate('/settings');
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: 12, gap: 8 }}
                >
                  <Settings size={14} />
                  Settings & Alerts
                </button>

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: 12, gap: 8, color: '#EF4444' }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setUserMenuOpen(o => !o)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: 8,
                padding: collapsed ? '6px 0' : '6px 8px',
                background: userMenuOpen ? 'var(--panel)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="hover:bg-[var(--panel)] transition-colors"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0D1F1E, #2DD4BF)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {getInitials(user?.email)}
                </div>

                {!collapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDisplayName(user?.email)}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && (
                <ChevronsUpDown size={14} style={{ color: 'var(--faint)', flexShrink: 0 }} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// ── Header ────────────────────────────────────────────────────

export const Header: React.FC<{
  onMobileMenuClick: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
}> = ({ onMobileMenuClick, onOpenNotifications, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSettings();
  const navigate = useNavigate();
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mode') === 'dark'
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMode = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem('theme-mode', next);
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    setAvatarDropdownOpen(false);
    await logout();
    navigate('/');
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuClick}
          className="btn-icon md:hidden"
          title="Open menu"
          id="mobile-menu-btn"
        >
          <Menu size={16} />
        </button>

        {/* Header Greeting & RBAC Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>
            Hello, <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{user?.name || getDisplayName(user?.email)}</strong>
          </span>
          <span style={{ fontSize: 14 }}>👋</span>

          {/* Role Tier Badge */}
          {user?.role === 'Super Admin' || user?.email?.toLowerCase() === 'maz@talentbridge.cv' ? (
            <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 7px' }}>
              👑 Super Admin
            </span>
          ) : user?.role === 'Admin' ? (
            <span className="badge badge-neutral" style={{ fontSize: 10, padding: '2px 7px' }}>
              🛠️ Admin
            </span>
          ) : user?.role === 'Data Analyst' ? (
            <span className="badge" style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 700 }}>
              📊 Data Analyst
            </span>
          ) : (
            <span className="badge" style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 700 }}>
              👁️ Read-Only
            </span>
          )}
        </div>
      </div>

      {/* Center / Right Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Sleek System-Wide Search Bar (Command + K Trigger) */}
        <div
          onClick={onOpenSearch}
          id="header-omnisearch-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'var(--panel-2)',
            borderRadius: 99,
            border: '1px solid var(--line)',
            cursor: 'pointer',
            minWidth: 180,
            transition: 'all 0.15s ease',
          }}
          className="hover:border-[var(--accent)] hover:shadow-sm transition-all flex items-center"
          title="Search users, dashboards, actions, and telemetry (⌘K)"
        >
          <Search size={14} color="#2DD4BF" />
          <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>Search anything...</span>
          <kbd
            style={{
              fontSize: 10,
              fontFamily: 'Geist Mono, monospace',
              color: 'var(--dim)',
              background: 'var(--panel)',
              padding: '2px 5px',
              borderRadius: 4,
              border: '1px solid var(--line)',
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Notifications Bell with Dot Badge */}
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

        {/* Top-Right Avatar Dropdown */}
        <div ref={avatarDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setAvatarDropdownOpen(o => !o)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--panel)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
              cursor: 'pointer',
            }}
            title="Account & Profile Menu"
            id="user-avatar-btn"
          >
            {getInitials(user?.email)}
          </button>

          {avatarDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 220,
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-lg)',
                padding: 6,
                zIndex: 60,
              }}
              className="animate-slide-up"
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{getDisplayName(user?.email)}</p>
                <p style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <ShieldCheck size={12} color="#2DD4BF" />
                  <span style={{ fontSize: 10, color: '#2DD4BF', fontWeight: 700, textTransform: 'uppercase' }}>
                    {user?.role || 'Administrator'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setAvatarDropdownOpen(false);
                  navigate('/settings');
                }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 13, gap: 8 }}
              >
                <Settings size={14} />
                Settings & Anomaly Triggers
              </button>

              <button
                onClick={() => {
                  setAvatarDropdownOpen(false);
                  navigate('/lookup');
                }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 13, gap: 8 }}
              >
                <Search size={14} />
                User Directory
              </button>

              <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />

              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 13, gap: 8, color: '#EF4444' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ── Layout shell ──────────────────────────────────────────────

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Command + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isReadOnly = user?.role === 'Viewer' || user?.role === 'Data Analyst';

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
          onOpenSearch={() => setCommandPaletteOpen(true)}
        />

        {/* Read-Only Mode Banner */}
        {isReadOnly && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.09)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.22)',
              padding: '6px 20px',
              fontSize: 12,
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>
              👁️ <strong>Read-Only Mode:</strong> Browsing as <strong>{user?.name || user?.email}</strong> ({user?.role || 'Viewer'}). Administrative mutations, team provisioning, and API key editing are view-only.
            </span>
            <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
              RBAC PROTECTED
            </span>
          </div>
        )}

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

      {/* Global Command + K System-Wide Omnisearch Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};
