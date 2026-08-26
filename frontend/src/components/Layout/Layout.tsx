import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {

  TrendingDown, Puzzle, RefreshCcw, Mail, Search, Sparkles,
  ChevronLeft, ChevronRight, Sun, Moon, LogOut,
  Menu, X, Bell, Settings,
  ChevronsUpDown, Share2, Target,
  ChevronDown, ChevronUp, BookOpen, HelpCircle, Bot,
} from 'lucide-react';
import tblogo from '../../assets/tblogo.svg';
import tbLogolight from '../../assets/tbLogolight.svg';
import tbicon from '../../assets/tbicon.svg';
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
  Share2,
  Target,
  BookOpen,
  HelpCircle,
  Bot,
};


interface NavSubItem {
  path: string;
  label: string;
  badge?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  badgeType?: 'sunset' | 'teal';
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Executive Analytics',
    items: [
      { path: '/dashboard/funnel', label: 'Funnel Conversion', icon: 'TrendingDown' },
      { path: '/dashboard/features', label: 'Feature Adoption', icon: 'Puzzle' },
      { path: '/dashboard/retention', label: 'Cohort Retention', icon: 'RefreshCcw' },
    ],
  },
  {
    title: 'Engagement & Media',
    items: [
      {
        path: '/dashboard/social-media',
        label: 'Social Media',
        icon: 'Share2',
        badge: 'Live',
        badgeType: 'sunset',
        subItems: [
          { path: '/dashboard/social-media', label: 'Overview' },
          { path: '/social-media/linkedin', label: 'LinkedIn Organic' },
          { path: '/social-media/reddit', label: 'Reddit Community' },
        ],
      },
      { path: '/dashboard/campaigns', label: 'Campaign ROI', icon: 'Target', badge: 'Multi', badgeType: 'teal' },
      {
        path: '/dashboard/email',
        label: 'Email Campaigns',
        icon: 'Mail',
        subItems: [
          { path: '/dashboard/email', label: 'Sequences' },
          { path: '/email/detailed', label: 'Timing & Heatmap' },
        ],
      },
      { path: '/dashboard/rooms', label: 'Room Insights', icon: 'Sparkles', badge: '3D', badgeType: 'sunset' },
    ],
  },


  {
    title: 'Directory & Admin',
    items: [
      { path: '/lookup', label: 'User Directory', icon: 'Search' },
      { path: '/settings', label: 'Settings & Alerts', icon: 'Settings' },
    ],
  },
  {
    title: 'Help & Learning',
    items: [
      {
        path: '/help/guide',
        label: 'Platform Guide',
        icon: 'BookOpen',
        badge: 'AI Bot',
        badgeType: 'teal',
      },
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
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mode') !== 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-mode') !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, []);

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
            background: 'rgba(11, 14, 20, 0.65)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
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
        {/* Logo Header */}
        <div
          style={{
            padding: collapsed ? '16px 0' : '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--line)',
            minHeight: 58,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {collapsed ? (
              <img
                src={tbicon}
                alt="TalentBridge"
                style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8 }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <img
                  src={isDark ? tblogo : tbLogolight}
                  alt="TalentBridge"
                  style={{ height: 23, width: 'auto' }}
                />
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--panel-2)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--line)',
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
            style={{ width: 30, height: 30, border: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Nav Sections */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '14px 10px' }}>
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              {!collapsed && (
                <div
                  style={{
                    padding: '4px 10px 8px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--dim)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'Sora, sans-serif',
                  }}
                >
                  {section.title}
                </div>
              )}
              {collapsed && sIdx > 0 && (
                <div style={{ height: 1, background: 'var(--line)', margin: '8px 4px 12px' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.items.map(link => {
                  const Icon = ICON_MAP[link.icon];
                  const hasSub = !collapsed && !!link.subItems?.length;
                  const isParentActive =
                    location.pathname === link.path ||
                    (hasSub && link.subItems?.some(s => location.pathname.startsWith(s.path)));

                  return (
                    <div key={link.path} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <NavLink
                        to={link.path}
                        onClick={onMobileClose}
                        className={({ isActive }) => `nav-link ${isActive || isParentActive ? 'active' : ''}`}
                        style={{
                          justifyContent: collapsed ? 'center' : 'space-between',
                          padding: collapsed ? '9px 0' : '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                        title={collapsed ? link.label : undefined}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {Icon && <Icon size={16} strokeWidth={1.8} style={{ opacity: 0.9 }} />}
                          {!collapsed && <span>{link.label}</span>}
                        </div>
                        {!collapsed && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {link.badge && (
                              <span
                                className={link.badgeType === 'sunset' ? 'badge badge-sunset' : 'badge badge-teal'}
                                style={{
                                  fontSize: 10,
                                  padding: '1px 6px',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {link.badge}
                              </span>
                            )}
                            {hasSub && (
                              <span style={{ color: 'var(--dim)' }}>
                                {isParentActive ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>

                      {/* Expandable Sub-items */}
                      {hasSub && isParentActive && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            marginLeft: 26,
                            paddingLeft: 8,
                            borderLeft: '1px solid var(--line)',
                            marginTop: 2,
                            marginBottom: 4,
                          }}
                        >
                          {link.subItems?.map(sub => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={onMobileClose}
                              className={({ isActive }) =>
                                `nav-sub-link ${isActive || location.pathname === sub.path ? 'active' : ''}`
                              }
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '5px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 12,
                                color: location.pathname === sub.path ? 'var(--accent)' : 'var(--text-2)',
                                fontWeight: location.pathname === sub.path ? 600 : 400,
                                textDecoration: 'none',
                              }}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span style={{ fontSize: 9.5, color: 'var(--dim)' }}>
                                  {sub.badge}
                                </span>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--panel-2)' }}>
          {/* Collapse Toggle */}
          <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', padding: '6px 10px' }}>
            <button
              onClick={onToggle}
              className="btn-icon hidden md:flex"
              style={{
                width: 24,
                height: 24,
                border: 'none',
                background: 'transparent',
                color: 'var(--dim)',
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* User Profile Card */}
          <div ref={userMenuRef} style={{ position: 'relative', padding: collapsed ? '6px 6px 12px' : '6px 10px 12px' }}>
            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 8,
                  right: 8,
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  boxShadow: 'var(--shadow-lg)',
                  padding: 8,
                  zIndex: 60,
                }}
                className="animate-slide-up"
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{getDisplayName(user?.email)}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                  <span className="badge badge-neutral" style={{ fontSize: 10, marginTop: 5, textTransform: 'uppercase' }}>
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
                  Settings &amp; Alerts
                </button>

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: 12, gap: 8, color: '#EF4444', marginTop: 4 }}
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
                borderRadius: 'var(--radius-sm)',
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
                    background: 'linear-gradient(135deg, #0D9488, #FA520F)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  }}
                >
                  {getInitials(user?.email)}
                </div>

                {!collapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDisplayName(user?.email)}
                    </p>
                    <p style={{ fontSize: 10.5, color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && (
                <ChevronsUpDown size={14} style={{ color: 'var(--dim)', flexShrink: 0 }} />
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
    document.documentElement.getAttribute('data-mode') !== 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-mode') !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, []);

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
    const currentIsDark = document.documentElement.getAttribute('data-mode') !== 'light';
    const next = currentIsDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem('theme-mode', next);
    setIsDark(!currentIsDark);
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
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 12,
        position: 'relative',
      }}
      className="px-3 sm:px-6"
    >
      {/* Subtle Mistral Accent Bar at top edge of header */}
      <div className="sunset-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />

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

        {/* Mobile Logo Mark */}
        <div className="flex items-center gap-2 md:hidden">
          <img src={tbicon} alt="TalentBridge" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13.5, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            TB<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </div>

        {/* Desktop Header Greeting & RBAC Role Badge */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>
            Hello, <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{user?.name || getDisplayName(user?.email)}</strong>
          </span>

          {/* Role Tier Badge */}
          {user?.role === 'Super Admin' || user?.email?.toLowerCase() === 'maz@talentbridge.cv' ? (
            <span className="badge badge-teal" style={{ fontSize: 10.5, padding: '2px 8px' }}>
              👑 Super Admin
            </span>
          ) : user?.role === 'Admin' ? (
            <span className="badge badge-neutral" style={{ fontSize: 10.5, padding: '2px 8px' }}>
              🛠️ Admin
            </span>
          ) : user?.role === 'Data Analyst' ? (
            <span className="badge" style={{ fontSize: 10.5, padding: '2px 8px', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.22)' }}>
              📊 Data Analyst
            </span>
          ) : (
            <span className="badge" style={{ fontSize: 10.5, padding: '2px 8px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.22)' }}>
              👁️ Read-Only
            </span>
          )}
        </div>
      </div>

      {/* Center / Right Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenSearch}
          className="btn-icon md:hidden"
          title="Search (⌘K)"
          id="mobile-search-btn"
        >
          <Search size={15} color="var(--accent)" />
        </button>

        {/* Desktop Sleek System-Wide Search Bar (Command + K Trigger) */}
        <div
          onClick={onOpenSearch}
          id="header-omnisearch-trigger"
          style={{
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'var(--panel-2)',
            borderRadius: 9999,
            border: '1px solid var(--line)',
            cursor: 'pointer',
            minWidth: 190,
            transition: 'all 0.18s ease',
          }}
          className="hidden md:flex hover:border-[var(--accent)] hover:shadow-sm transition-all"
          title="Search users, dashboards, actions, and telemetry (⌘K)"
        >
          <Search size={13.5} color="var(--accent)" />
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', flex: 1 }}>Search anything...</span>
          <kbd
            style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--dim)',
              background: 'var(--panel)',
              padding: '1px 5px',
              borderRadius: 4,
              border: '1px solid var(--line)',
              fontWeight: 600,
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
                background: 'linear-gradient(135deg, #FA520F, #EF4444)',
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
              background: 'linear-gradient(135deg, #0D9488, #FA520F)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--panel)',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
            title="Account menu"
            id="user-avatar-btn"
          >
            {getInitials(user?.email)}
          </button>

          {avatarDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 250,
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                zIndex: 60,
              }}
              className="animate-slide-up"
            >
              {/* User identity block */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0D9488, #FA520F)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(user?.email)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDisplayName(user?.email)}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>
                </div>
                {/* Role pill */}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#14B8A6', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user?.role || 'Administrator'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '6px 0' }}>
                <button
                  onClick={() => { setAvatarDropdownOpen(false); navigate('/settings'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', background: 'transparent', border: 'none',
                    color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="hover:bg-[var(--panel-2)] transition-colors"
                >
                  <Settings size={15} style={{ color: 'var(--dim)', flexShrink: 0 }} />
                  Preferences &amp; Settings
                </button>

                <button
                  onClick={toggleMode}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', background: 'transparent', border: 'none',
                    color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="hover:bg-[var(--panel-2)] transition-colors"
                >
                  {isDark
                    ? <Sun size={15} style={{ color: 'var(--dim)', flexShrink: 0 }} />
                    : <Moon size={15} style={{ color: 'var(--dim)', flexShrink: 0 }} />}
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
              </div>

              {/* Sign out */}
              <div style={{ borderTop: '1px solid var(--line)', padding: '6px 0' }}>
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', background: 'transparent', border: 'none',
                    color: '#EF4444', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="hover:bg-[var(--panel-2)] transition-colors"
                >
                  <LogOut size={15} style={{ color: '#EF4444', flexShrink: 0 }} />
                  Sign out of TalentBridge
                </button>
              </div>
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
              background: 'rgba(245, 158, 11, 0.08)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
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
            <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.16)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
              RBAC PROTECTED
            </span>
          </div>
        )}

        <main
          id="main-content"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
          className="p-3 sm:p-5 md:p-6 lg:p-7"
        >
          <div className="animate-fade-in w-full" style={{ maxWidth: 1280, margin: '0 auto' }}>
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
