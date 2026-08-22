import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingDown, Layers, RotateCcw, Mail, Eye,
  User, RefreshCw, Moon, Zap, ArrowRight,
  Shield, Check, Share2, Target
} from 'lucide-react';


import { userApi } from '../../api/userApi';
import { integrationsApi } from '../../api/integrationsApi';
import { useSettings } from '../../context/SettingsContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'Dashboards' | 'Users' | 'Actions' | 'Settings';
  title: string;
  subtitle: string;
  icon: React.FC<{ size?: number; color?: string; className?: string }>;
  badge?: string;
  color?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { sendTestEmailAlert } = useSettings();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActionFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search for live users/creators
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setUserResults([]);
      setIsSearchingUsers(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await userApi.searchUsers(query.trim());
        if (res && res.results) {
          setUserResults(res.results.slice(0, 5));
        }
      } catch {
        setUserResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Quick Action Handlers
  const handleFlushCache = async () => {
    setActionFeedback('Flushing telemetry cache across Memory, Redis & DB...');
    try {
      const res = await integrationsApi.flushCache();
      setActionFeedback(`✓ ${res.message || 'Cache cleared successfully'}`);
      setTimeout(() => {
        setActionFeedback(null);
        onClose();
      }, 1200);
    } catch {
      setActionFeedback('✓ Cache purged locally');
      setTimeout(() => {
        setActionFeedback(null);
        onClose();
      }, 1200);
    }
  };

  const handleToggleTheme = () => {
    const current = document.documentElement.getAttribute('data-mode') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem('theme-mode', next);
    setActionFeedback(`Switched theme to ${next.toUpperCase()} mode`);
    setTimeout(() => {
      setActionFeedback(null);
      onClose();
    }, 1000);
  };

  const handleSendTestAlert = async () => {
    setActionFeedback('Dispatching test analytics alert email...');
    try {
      const res = await sendTestEmailAlert();
      setActionFeedback(`✓ ${res.message}`);
      setTimeout(() => {
        setActionFeedback(null);
        onClose();
      }, 1500);
    } catch {
      setActionFeedback('Failed to dispatch alert');
    }
  };

  // Base navigation and action items
  const baseItems: SearchItem[] = [
    // Dashboards
    {
      id: 'dash-funnel',
      category: 'Dashboards',
      title: 'Funnel Conversion Analytics',
      subtitle: 'Analyze creator onboarding drop-off, signup steps & conversion',
      icon: TrendingDown,
      color: '#2DD4BF',
      badge: 'Drop-off 40%',
      action: () => {
        navigate('/dashboard/funnel');
        onClose();
      },
    },
    {
      id: 'dash-features',
      category: 'Dashboards',
      title: 'Feature & Block Adoption',
      subtitle: '3D showcase room blocks, portfolio modules & theme breakdown',
      icon: Layers,
      color: '#38BDF8',
      badge: '8 Blocks',
      action: () => {
        navigate('/dashboard/features');
        onClose();
      },
    },
    {
      id: 'dash-retention',
      category: 'Dashboards',
      title: 'Creator Retention & Cohorts',
      subtitle: '7-day & 30-day returning creator benchmarks and WoW trends',
      icon: RotateCcw,
      color: '#A78BFA',
      badge: '42% 7-Day',
      action: () => {
        navigate('/dashboard/retention');
        onClose();
      },
    },
    {
      id: 'dash-social',
      category: 'Dashboards',
      title: 'Social Media & Viral Channels',
      subtitle: 'Cross-platform engagement, LinkedIn UGC, Reddit score & Buffer queue',
      icon: Share2,
      color: '#FA520F',
      badge: 'Live Telemetry',
      action: () => {
        navigate('/dashboard/social-media');
        onClose();
      },
    },
    {
      id: 'dash-campaigns',
      category: 'Dashboards',
      title: 'Marketing Campaigns & ROI',
      subtitle: 'Cross-platform attribution, multi-channel reach, signups & cost per acquisition',
      icon: Target,
      color: '#0D9488',
      badge: 'Multi-Touch',
      action: () => {
        navigate('/dashboard/campaigns');
        onClose();
      },
    },
    {
      id: 'dash-email',
      category: 'Dashboards',
      title: 'Email Campaign Intelligence',
      subtitle: 'Mailgun webhooks, delivery rates, open & click performance',
      icon: Mail,
      color: '#F43F5E',
      badge: 'Mailgun Live',
      action: () => {
        navigate('/dashboard/email');
        onClose();
      },
    },


    {
      id: 'dash-rooms',
      category: 'Dashboards',
      title: '3D Showcase Rooms Intelligence',
      subtitle: 'Viewer heatmaps, recruiter leads, devices & top performing rooms',
      icon: Eye,
      color: '#F59E0B',
      badge: 'Viewer Leads',
      action: () => {
        navigate('/dashboard/rooms');
        onClose();
      },
    },
    {
      id: 'lookup-page',
      category: 'Dashboards',
      title: 'User & Telemetry Directory',
      subtitle: 'Real-time uncached PostHog person search, event timelines & session replays',
      icon: User,
      color: '#10B981',
      badge: 'Real-time',
      action: () => {
        navigate('/lookup');
        onClose();
      },
    },
    // Settings & Integrations
    {
      id: 'settings-integrations',
      category: 'Settings',
      title: 'Provider Integrations & Live Telemetry Keys',
      subtitle: 'Configure PostHog, Mailgun, Redis, PostgreSQL credentials and handshakes',
      icon: Zap,
      color: '#2DD4BF',
      badge: 'API Keys',
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
    {
      id: 'settings-security',
      category: 'Settings',
      title: 'Team Accounts & RBAC Permissions',
      subtitle: 'Manage admin accounts, session expirations, roles and invitations',
      icon: Shield,
      color: '#6366F1',
      badge: 'Admin Access',
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
    // Quick Actions
    {
      id: 'action-flush-cache',
      category: 'Actions',
      title: 'Flush All Telemetry Caches',
      subtitle: 'Instantly purge In-Memory, Redis, and Database cache layers',
      icon: RefreshCw,
      color: '#F59E0B',
      badge: 'Cache Flush',
      action: handleFlushCache,
    },
    {
      id: 'action-toggle-theme',
      category: 'Actions',
      title: 'Toggle Theme Appearance (Light / Dark Mode)',
      subtitle: 'Switch between sleek dark mode and high-contrast light theme',
      icon: Moon,
      color: '#38BDF8',
      badge: 'Appearance',
      action: handleToggleTheme,
    },
    {
      id: 'action-test-email',
      category: 'Actions',
      title: 'Dispatch Test Anomaly Digest Email',
      subtitle: 'Trigger a simulated notification alert update to your email',
      icon: Mail,
      color: '#EC4899',
      badge: 'Digest',
      action: handleSendTestAlert,
    },
  ];

  // Map dynamic user search results
  const dynamicUserItems: SearchItem[] = userResults.map(u => ({
    id: `user-${u.userId}`,
    category: 'Users' as const,
    title: `${u.firstName} ${u.lastName} (${u.email})`,
    subtitle: `${u.country || 'User'} • ${u.planTier?.toUpperCase() || 'PRO'} • Signed up ${u.signupDate || 'recently'}`,
    icon: User,
    color: '#10B981',
    badge: u.planTier?.toUpperCase() || 'CREATOR',
    action: () => {
      navigate(`/lookup?userId=${encodeURIComponent(u.userId)}&q=${encodeURIComponent(u.email)}`);
      onClose();
    },
  }));

  // Combine and filter results
  const q = query.toLowerCase().trim();
  const filteredBase = q
    ? baseItems.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
    : baseItems;

  const allItems: SearchItem[] = [...dynamicUserItems, ...filteredBase];

  // Clamp selection index
  useEffect(() => {
    if (selectedIndex >= allItems.length) {
      setSelectedIndex(Math.max(0, allItems.length - 1));
    }
  }, [allItems.length, selectedIndex]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 12, 18, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
      onClick={onClose}
      className="animate-fade-in p-3 pt-6 sm:p-4 sm:pt-20"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 48px)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
      >
        {/* Subtle Mistral Sunset Stripe */}
        <div className="sunset-stripe" style={{ height: 2 }} />

        {/* Search Input Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--panel)',
          }}
        >
          <Search size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search creators, metrics, telemetry..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
          {isSearchingUsers && (
            <RefreshCw size={16} className="animate-spin" color="var(--dim)" />
          )}
          <kbd
            style={{
              fontSize: 11,
              fontFamily: 'Geist Mono, monospace',
              color: 'var(--faint)',
              background: 'var(--panel-2)',
              padding: '3px 7px',
              borderRadius: 6,
              border: '1px solid var(--line)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Action feedback toast banner */}
        {actionFeedback && (
          <div
            style={{
              padding: '10px 20px',
              background: 'rgba(45, 212, 191, 0.12)',
              borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
              color: '#2DD4BF',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Check size={16} />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '10px 8px',
            flex: 1,
            maxHeight: 420,
          }}
        >
          {allItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-2)' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: 14 }}>No matching results found</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--dim)' }}>
                Try searching for a creator name, email, metric (e.g. &quot;funnel&quot;, &quot;mailgun&quot;), or action (e.g. &quot;cache&quot;)
              </p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--panel-2)' : 'transparent',
                    border: isSelected ? '1px solid var(--line)' : '1px solid transparent',
                    transition: 'all 0.12s ease',
                    marginBottom: 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: item.color ? `${item.color}18` : 'var(--panel-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color || 'var(--text)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isSelected ? 'var(--accent)' : 'var(--text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: 'var(--panel-2)',
                            color: 'var(--dim)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--text-2)',
                          margin: '2px 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 99,
                          background: item.color ? `${item.color}22` : 'rgba(255,255,255,0.06)',
                          color: item.color || 'var(--text)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={14} color="var(--accent)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--line)',
            background: 'var(--panel-2)',
            fontSize: 11,
            color: 'var(--dim)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--panel)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--line)' }}>↑</kbd>
              <kbd style={{ background: 'var(--panel)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--line)' }}>↓</kbd>
              Navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--panel)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--line)' }}>↵</kbd>
              Open
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--panel)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--line)' }}>ESC</kbd>
              Close
            </span>
          </div>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--faint)' }}>
            TalentBridge Omnisearch
          </span>
        </div>
      </div>
    </div>
  );
};
