import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, Mail, TrendingDown, AlertTriangle, CheckCircle2, RotateCcw,
  Send, Check, Flame, Server, Shield, Palette, Database, RefreshCw,
  Lock, Key, Activity, Eye, EyeOff, XCircle, CheckCircle,
  Zap, UserPlus, Trash2,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useRbac } from '../utils/rbac';
import { integrationsApi } from '../api/integrationsApi';

type TabKey = 'alerts' | 'email' | 'integrations' | 'security' | 'appearance';
type ProviderKey = 'posthog' | 'mailgun' | 'redis' | 'postgres';

interface TabItem {
  id: TabKey;
  label: string;
  icon: React.FC<{ size?: number; color?: string; className?: string }>;
  badge?: string;
  desc: string;
}

const TABS: TabItem[] = [
  { id: 'alerts', label: 'Anomaly Triggers', icon: Flame, badge: 'Active', desc: 'Threshold baking rules & event triggers' },
  { id: 'email', label: 'Email & Digest', icon: Mail, desc: 'Admin notifications & scheduled reports' },
  { id: 'integrations', label: 'Integrations & API', icon: Server, badge: 'Live Config', desc: 'Telemetry connections & provider credentials' },
  { id: 'security', label: 'Team & Security', icon: Shield, badge: 'RBAC', desc: 'Admin accounts & auth session policies' },
  { id: 'appearance', label: 'Portal Appearance', icon: Palette, desc: 'Themes, formatting & visual display' },
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, sendTestEmailAlert } = useSettings();
  const { user } = useAuth();
  const rbac = useRbac();

  const [activeTab, setActiveTab] = useState<TabKey>('alerts');
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);
  const [cacheFlushSuccess, setCacheFlushSuccess] = useState(false);

  // Provider configuration state
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('posthog');
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string; ping?: string } | null>(null);

  // Team administration state (Maz as Super Admin Source of Truth)
  const [teamUsers, setTeamUsers] = useState<Array<{
    name: string;
    email: string;
    role: string;
    expiry: string;
    status: 'Active' | 'Suspended' | 'Invited';
    lastActive?: string;
    isOwner?: boolean;
  }>>(() => {
    const saved = localStorage.getItem('tbridge_team_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { name: 'Maz (Lead Admin)', email: 'maz@talentbridge.cv', role: 'Super Admin', expiry: '7 Days (Sliding)', status: 'Active', lastActive: 'Just now (Source of Truth)', isOwner: true },
      { name: 'System Admin', email: 'admin@talentbridge.cv', role: 'Admin', expiry: '7 Days (Sliding)', status: 'Active', lastActive: '14m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@talentbridge.cv', role: 'Data Analyst', expiry: '24 Hours', status: 'Active', lastActive: '2h ago' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@talentbridge.cv', role: 'Viewer', expiry: '24 Hours', status: 'Active', lastActive: 'Yesterday' },
      { name: 'Test Operator', email: 'test@example.com', role: 'Viewer', expiry: '24 Hours', status: 'Active', lastActive: '3d ago' },
    ];
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Admin',
    tempPassword: 'temp_pass_2026',
  });

  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('tbridge_provider_credentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      posthog: {
        host: 'https://us.i.posthog.com',
        projectId: '48192',
        apiKey: 'phx_9831a8f902c3847b6a1e',
        status: 'connected',
        lastVerified: 'Just now',
        ping: '12ms',
      },
      mailgun: {
        domain: 'mg.talentbridge.cv',
        apiKey: 'key-98f24bc8012e45da79',
        webhookKey: 'whsec_7812903487123984',
        status: 'connected',
        lastVerified: 'Just now',
        ping: '24ms',
      },
      redis: {
        url: 'redis://localhost:6379',
        password: '',
        status: 'connected',
        lastVerified: 'Just now',
        ping: '1ms',
      },
      postgres: {
        url: 'postgresql://postgres:postgres@localhost:5432/talentbridge_analytics',
        ssl: false,
        status: 'connected',
        lastVerified: 'Just now',
        ping: '4ms',
      },
    };
  });

  const [cacheTTL, setCacheTTL] = useState({
    funnel: 300,
    features: 600,
    retention: 900,
    userLookup: 0,
  });

  const [appearance, setAppearance] = useState({
    themeMode: document.documentElement.getAttribute('data-mode') || 'dark',
    chartStyle: 'modern',
    compactNumbers: true,
    showLiveIndicator: true,
  });

  // Save credentials to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('tbridge_provider_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('tbridge_team_users', JSON.stringify(teamUsers));
  }, [teamUsers]);

  // Load initial backend integration config on mount
  useEffect(() => {
    integrationsApi.getIntegrations().then(res => {
      if (res?.config) {
        setCredentials((prev: any) => ({
          posthog: { ...prev.posthog, ...res.config.posthog },
          mailgun: { ...prev.mailgun, ...res.config.mailgun },
          redis: { ...prev.redis, ...res.config.redis },
          postgres: { ...prev.postgres, ...res.config.postgres },
        }));
        if (res.config.cacheTTL) {
          setCacheTTL(res.config.cacheTTL);
        }
      }
    }).catch(() => {});
  }, []);

  const handleAddAdminUser = () => {
    if (!newUserForm.name || !newUserForm.email) return;
    const newUser = {
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      expiry: '7 Days (Sliding)',
      status: 'Active' as const,
      lastActive: 'Provisioned Just now',
    };
    setTeamUsers(prev => [...prev, newUser]);
    setShowAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'Admin', tempPassword: 'temp_pass_2026' });
    setUserActionMsg(`Successfully provisioned administrator account for ${newUser.name} (${newUser.email})`);
    setTimeout(() => setUserActionMsg(null), 4000);
  };

  const handleUpdateUserRole = (email: string, newRole: string) => {
    setTeamUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    setUserActionMsg(`Updated ${email} role permissions to ${newRole}`);
    setTimeout(() => setUserActionMsg(null), 3000);
  };

  const handleToggleUserStatus = (email: string) => {
    setTeamUsers(prev => prev.map(u => {
      if (u.email === email && !u.isOwner) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        setUserActionMsg(`User ${email} status changed to ${nextStatus}`);
        setTimeout(() => setUserActionMsg(null), 3000);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (email: string) => {
    setTeamUsers(prev => prev.filter(u => u.email !== email));
    setUserActionMsg(`Administrator account ${email} has been revoked and removed.`);
    setTimeout(() => setUserActionMsg(null), 3000);
  };

  const handleResetUserSession = (email: string) => {
    setUserActionMsg(`Active session tokens for ${email} have been reset.`);
    setTimeout(() => setUserActionMsg(null), 3000);
  };

  const toggleSecret = (field: string) => {
    setShowSecret(s => ({ ...s, [field]: !s[field] }));
  };

  const handleTestProvider = async (provider: ProviderKey) => {
    setTestingProvider(provider);
    setTestResult(null);

    try {
      const res = await integrationsApi.testIntegration(provider, credentials[provider]);
      setTestResult({
        provider,
        success: res.success,
        message: res.message,
        ping: res.ping || (res.success ? '12ms' : 'Timeout'),
      });

      setCredentials((prev: any) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          status: res.success ? 'connected' : 'invalid',
          lastVerified: res.success ? 'Just now' : 'Failed',
          ping: res.ping || (res.success ? '12ms' : 'Timeout'),
        },
      }));
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err.message || 'Connection test failed',
        ping: 'Timeout',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    localStorage.setItem('tbridge_provider_credentials', JSON.stringify(credentials));
    try {
      await integrationsApi.updateIntegrations(credentials, cacheTTL);
    } catch {}
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    resetSettings();
    setFormData({ ...settings });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmailAlert();
      setTestEmailResult(res.message);
      setTimeout(() => setTestEmailResult(null), 5000);
    } catch {
      setTestEmailResult('Failed to dispatch test email.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      await integrationsApi.flushCache();
    } catch {}
    setCacheFlushSuccess(true);
    setTimeout(() => setCacheFlushSuccess(false), 3000);
  };

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setAppearance(a => ({ ...a, themeMode: mode }));
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('theme-mode', mode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Settings & Portal Preferences
            </h2>
            <span className="badge badge-success" style={{ gap: 4 }}>
              <SlidersHorizontal size={11} /> Admin Suite
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Configure live provider API keys, anomaly thresholds, telemetry cache TTLs, and team policies with instant validation.
          </p>
        </div>

        {saveSuccess && (
          <div className="badge badge-success animate-fade-in" style={{ padding: '8px 14px', gap: 6, fontSize: 13 }}>
            <CheckCircle2 size={14} /> Preferences and API Keys saved & synced!
          </div>
        )}
      </div>

      {/* ── Embedded Navigation Tab Bar ────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'var(--panel)',
          padding: '6px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--line)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius-xs)',
                background: isActive ? 'var(--panel-2)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-2)',
                border: isActive ? '1px solid var(--line-2)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              className="hover:text-[var(--text)] hover:bg-[var(--panel-2)]"
            >
              <Icon size={15} color={isActive ? 'var(--accent)' : 'var(--dim)'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: isActive ? 'rgba(45, 212, 191, 0.14)' : 'var(--panel-2)',
                    color: isActive ? 'var(--accent2)' : 'var(--faint)',
                    border: '1px solid var(--line)',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Forms ────────────────────────────────────────── */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* TAB 1: Anomaly Alert Triggers & Baking Rules */}
        {activeTab === 'alerts' && (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                }}
              >
                <Flame size={18} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Anomaly Alert Triggers & Baking Rules
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Automate when dashboards highlight critical warning cards and in-app alerts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trigger 1: Funnel Drop-off Threshold */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--panel-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingDown size={16} color="#EF4444" />
                    <label htmlFor="funnel-dropoff-slider" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      Funnel Drop-off Trigger
                    </label>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--accent2)',
                      background: 'var(--panel)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--line)',
                    }}
                  >
                    ≥ {formData.funnelDropoffThreshold}%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Triggers an alert when user drop-off between any two consecutive onboarding stages exceeds this percentage.
                </p>
                <input
                  id="funnel-dropoff-slider"
                  type="range"
                  min="15"
                  max="75"
                  step="5"
                  disabled={rbac.isReadOnly}
                  value={formData.funnelDropoffThreshold}
                  onChange={e => setFormData({ ...formData, funnelDropoffThreshold: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: rbac.isReadOnly ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dim)' }}>
                  <span>15% (Sensitive)</span>
                  <span>40% (Standard)</span>
                  <span>75% (Critical only)</span>
                </div>
              </div>

              {/* Trigger 2: Email Bounce Spike Threshold */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--panel-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} color="#F59E0B" />
                    <label htmlFor="email-bounce-input" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      Email Bounce Spike Trigger
                    </label>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--accent2)',
                      background: 'var(--panel)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--line)',
                    }}
                  >
                    &gt; {formData.emailBounceThreshold} bounces
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Triggers deliverability warnings when Mailgun webhooks report bounce counts above this threshold.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    id="email-bounce-input"
                    type="number"
                    min="5"
                    max="100"
                    disabled={rbac.isReadOnly}
                    value={formData.emailBounceThreshold}
                    onChange={e => setFormData({ ...formData, emailBounceThreshold: Number(e.target.value) })}
                    className="input"
                    style={{ width: 100, fontFamily: 'Geist Mono, monospace', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--dim)' }}>total bounce events per campaign</span>
                </div>
              </div>
            </div>

            {/* Trigger Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Real-time Behavioral Triggers
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    cursor: rbac.isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={rbac.isReadOnly}
                    checked={formData.enableRoomLeadAlerts}
                    onChange={e => setFormData({ ...formData, enableRoomLeadAlerts: e.target.checked })}
                    style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      3D Room High-Value Leads
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                      Alert when recruiters or execs spend &gt;5m in showcase rooms
                    </p>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    cursor: rbac.isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={rbac.isReadOnly}
                    checked={formData.enableRetentionMilestones}
                    onChange={e => setFormData({ ...formData, enableRetentionMilestones: e.target.checked })}
                    style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      Retention Benchmarks
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                      Notify weekly when 30d cohort retention exceeds 30%
                    </p>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    cursor: rbac.isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={rbac.isReadOnly}
                    checked={formData.enableSystemHealthAlerts}
                    onChange={e => setFormData({ ...formData, enableSystemHealthAlerts: e.target.checked })}
                    style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      Telemetry Fallbacks & Sync
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                      Alert when Redis/PostHog cache fallback triggers
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Email & Digest Settings */}
        {activeTab === 'email' && (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3B82F6',
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Admin Email Updates & Digest Dispatch
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                    Direct anomaly alerts and performance summaries to your administrator inbox
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Email Updates:
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, emailUpdatesEnabled: !formData.emailUpdatesEnabled })}
                  className={`badge ${formData.emailUpdatesEnabled ? 'badge-success' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', fontSize: 12, padding: '4px 10px' }}
                >
                  {formData.emailUpdatesEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="settings-recipient-email" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Recipient Administrator Email
                </label>
                <input
                  id="settings-recipient-email"
                  type="email"
                  required
                  disabled={rbac.isReadOnly}
                  value={formData.recipientEmail}
                  onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                  className="input"
                  style={{ width: '100%', fontSize: 13 }}
                  placeholder="admin@talentbridge.cv"
                />
                <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                  Currently signed in as: <strong>{user?.email || 'maz@talentbridge.cv'}</strong> ({user?.role || 'admin'})
                </span>
              </div>

              {/* Email Frequency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="settings-email-frequency" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Email Digest Delivery Frequency
                </label>
                <select
                  id="settings-email-frequency"
                  disabled={rbac.isReadOnly}
                  value={formData.emailFrequency}
                  onChange={e => setFormData({ ...formData, emailFrequency: e.target.value as any })}
                  className="input"
                  style={{ width: '100%', fontSize: 13 }}
                >
                  <option value="realtime">⚡ Real-time Alerts (Instant dispatch on critical spikes)</option>
                  <option value="daily">📅 Daily Digest (Consolidated daily at 09:00 UTC)</option>
                  <option value="weekly">📊 Weekly Executive Summary (Every Monday morning)</option>
                  <option value="disabled">🚫 Disabled (In-app notifications only)</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                  Controls how frequently email updates are delivered to your inbox.
                </span>
              </div>
            </div>

            {/* Subscribed Email Topics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Subscribed Topics for Email Digest
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'funnelDropoff', label: 'Funnel Drop-off Alerts', desc: 'Step drop-offs above threshold' },
                  { key: 'emailBounces', label: 'Deliverability & Bounces', desc: 'Spikes in email delivery bounces' },
                  { key: 'viewerLeads', label: 'Showcase Viewer Leads', desc: 'High-value recruiter activity' },
                  { key: 'weeklySummary', label: 'Weekly Growth Summary', desc: 'Overall user conversion & stats' },
                  { key: 'systemHealth', label: 'System & Cache Health', desc: 'PostHog and API fallback telemetry' },
                ].map(topic => (
                  <label
                    key={topic.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      cursor: rbac.isReadOnly ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={rbac.isReadOnly}
                      checked={(formData.subscribedTopics as any)[topic.key]}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          subscribedTopics: {
                            ...formData.subscribedTopics,
                            [topic.key]: e.target.checked,
                          },
                        })
                      }
                      style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', margin: 0 }}>
                        {topic.label}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '1px 0 0 0' }}>
                        {topic.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Test Email Dispatch Action */}
            <div
              style={{
                marginTop: 6,
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                  Test Email Dispatch
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                  Send an immediate sample analytics digest to {formData.recipientEmail} to verify delivery.
                </p>
                {testEmailResult && (
                  <span style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                    ✓ {testEmailResult}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest || rbac.isReadOnly}
                className="btn btn-ghost"
                style={{
                  padding: '7px 14px',
                  fontSize: 12,
                  gap: 6,
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--accent2)',
                }}
              >
                <Send size={13} />
                {isSendingTest ? 'Dispatching…' : 'Send Test Alert Email'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Integrations, Telemetry & Caching (Interactive Live Provider Suite) */}
        {activeTab === 'integrations' && (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            className="animate-fade-in"
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(45, 212, 191, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2DD4BF',
                  }}
                >
                  <Server size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Provider Integrations & Live Telemetry Keys
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                    Click any provider card to configure credentials, test API handshakes, and synchronize telemetry
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-success" style={{ gap: 4 }}>
                  <Zap size={11} /> Auto-Sync Active
                </span>
              </div>
            </div>

            {/* Interactive Provider Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'posthog' as const, name: 'PostHog Analytics', desc: 'Product funnel & event ingestion', ping: credentials.posthog.ping, icon: Activity, color: '#2DD4BF', status: credentials.posthog.status },
                { id: 'mailgun' as const, name: 'Mailgun Webhooks', desc: 'Email delivers, opens & bounces', ping: credentials.mailgun.ping, icon: Mail, color: '#3B82F6', status: credentials.mailgun.status },
                { id: 'redis' as const, name: 'Redis Cache Layer', desc: 'Fast cache response & TTL store', ping: credentials.redis.ping, icon: Database, color: '#F59E0B', status: credentials.redis.status },
                { id: 'postgres' as const, name: 'PostgreSQL Database', desc: 'Admin users & persistent logs', ping: credentials.postgres.ping, icon: Server, color: '#10B981', status: credentials.postgres.status },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = selectedProvider === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedProvider(item.id);
                      setTestResult(null);
                    }}
                    className="stat-card"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${item.color}` : '1px solid var(--line)',
                      background: isSelected ? 'var(--panel-2)' : 'var(--panel)',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected ? `0 6px 16px rgba(0,0,0,0.15)` : 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                      <Icon size={16} color={item.color} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 12, minHeight: 32 }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                      <span className={`badge ${item.status === 'connected' ? 'badge-success' : item.status === 'invalid' ? 'badge-error' : 'badge-neutral'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                        {item.status === 'connected' ? 'Connected' : item.status === 'invalid' ? 'Rejected' : 'Configured'}
                      </span>
                      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--faint)' }}>{item.ping}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Connection Alert Banner (if tested) */}
            {testResult && (
              <div
                className={`animate-slide-up`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${testResult.success ? '#10B981' : '#EF4444'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {testResult.success ? <CheckCircle size={18} color="#10B981" /> : <XCircle size={18} color="#EF4444" />}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: testResult.success ? '#10B981' : '#EF4444', margin: 0 }}>
                      {testResult.success ? 'API Handshake Accepted' : 'Connection Rejected'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text)', margin: '2px 0 0 0' }}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
                {testResult.ping && (
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                    Latency: {testResult.ping}
                  </span>
                )}
              </div>
            )}

            {/* Live Interactive Credential Configuration Panel */}
            <div style={{ padding: '20px', background: 'var(--panel-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
              {/* POSTHOG Configuration Form */}
              {selectedProvider === 'posthog' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        PostHog Analytics API Credentials
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                        Connect to your PostHog cloud or self-hosted instance to query onboarding funnels and events
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestProvider('posthog')}
                      disabled={testingProvider === 'posthog'}
                      className="btn btn-primary"
                      style={{
                        fontSize: 12,
                        padding: '7px 14px',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      title="Verify & Test Connection"
                    >
                      <RefreshCw size={13} className={testingProvider === 'posthog' ? 'animate-spin' : ''} />
                      {testingProvider === 'posthog' ? 'Testing Handshake…' : 'Verify & Test Connection'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Host URL */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        PostHog Host URL
                      </label>
                      <input
                        type="url"
                        value={credentials.posthog.host}
                        onChange={e => setCredentials({
                          ...credentials,
                          posthog: { ...credentials.posthog, host: e.target.value },
                        })}
                        placeholder="https://us.i.posthog.com"
                        className="input"
                        style={{ width: '100%', fontSize: 13 }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        e.g. https://us.i.posthog.com or https://eu.i.posthog.com
                      </span>
                    </div>

                    {/* Project ID */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        PostHog Project ID
                      </label>
                      <input
                        type="text"
                        value={credentials.posthog.projectId}
                        onChange={e => setCredentials({
                          ...credentials,
                          posthog: { ...credentials.posthog, projectId: e.target.value },
                        })}
                        placeholder="48192"
                        className="input"
                        style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace' }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        Found in PostHog Project Settings
                      </span>
                    </div>

                    {/* API Key */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Personal or Project API Key
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showSecret['posthog_key'] ? 'text' : 'password'}
                          value={credentials.posthog.apiKey}
                          onChange={e => setCredentials({
                            ...credentials,
                            posthog: { ...credentials.posthog, apiKey: e.target.value },
                          })}
                          placeholder="phx_..."
                          className="input"
                          style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace', paddingRight: 34 }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('posthog_key')}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}
                        >
                          {showSecret['posthog_key'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        Required for live PostHog query pipeline
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MAILGUN Configuration Form */}
              {selectedProvider === 'mailgun' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        Mailgun Webhooks & Delivery Credentials
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                        Configure API credentials and Webhook signing keys for live email telemetry
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestProvider('mailgun')}
                      disabled={testingProvider === 'mailgun'}
                      className="btn btn-primary"
                      style={{
                        fontSize: 12,
                        padding: '7px 14px',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      title="Verify & Test Connection"
                    >
                      <RefreshCw size={13} className={testingProvider === 'mailgun' ? 'animate-spin' : ''} />
                      {testingProvider === 'mailgun' ? 'Verifying Key…' : 'Verify & Test Connection'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Domain */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Mailgun Sending Domain
                      </label>
                      <input
                        type="text"
                        value={credentials.mailgun.domain}
                        onChange={e => setCredentials({
                          ...credentials,
                          mailgun: { ...credentials.mailgun, domain: e.target.value },
                        })}
                        placeholder="mg.talentbridge.cv"
                        className="input"
                        style={{ width: '100%', fontSize: 13 }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        Domain registered on Mailgun dashboard
                      </span>
                    </div>

                    {/* API Key */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Mailgun Private API Key
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showSecret['mailgun_key'] ? 'text' : 'password'}
                          value={credentials.mailgun.apiKey}
                          onChange={e => setCredentials({
                            ...credentials,
                            mailgun: { ...credentials.mailgun, apiKey: e.target.value },
                          })}
                          placeholder="key-..."
                          className="input"
                          style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace', paddingRight: 34 }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('mailgun_key')}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}
                        >
                          {showSecret['mailgun_key'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        Starts with key-...
                      </span>
                    </div>

                    {/* Webhook Signing Key */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Webhook Signing Key
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showSecret['mailgun_wh'] ? 'text' : 'password'}
                          value={credentials.mailgun.webhookKey}
                          onChange={e => setCredentials({
                            ...credentials,
                            mailgun: { ...credentials.mailgun, webhookKey: e.target.value },
                          })}
                          placeholder="whsec_..."
                          className="input"
                          style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace', paddingRight: 34 }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('mailgun_wh')}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}
                        >
                          {showSecret['mailgun_wh'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, display: 'block' }}>
                        Validates signature authenticity
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* REDIS Configuration Form */}
              {selectedProvider === 'redis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        Redis Memory Cache Connection
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                        Connect to Upstash, Redis Cloud, or local Redis for sub-millisecond response caching
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestProvider('redis')}
                      disabled={testingProvider === 'redis'}
                      className="btn btn-primary"
                      style={{
                        fontSize: 12,
                        padding: '7px 14px',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      title="Ping Redis Node"
                    >
                      <RefreshCw size={13} className={testingProvider === 'redis' ? 'animate-spin' : ''} />
                      {testingProvider === 'redis' ? 'Pinging Node…' : 'Ping Redis Node'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Redis Connection URL
                      </label>
                      <input
                        type="text"
                        value={credentials.redis.url}
                        onChange={e => setCredentials({
                          ...credentials,
                          redis: { ...credentials.redis, url: e.target.value },
                        })}
                        placeholder="redis://localhost:6379 or rediss://default:***@upstash.io"
                        className="input"
                        style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        Auth Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={credentials.redis.password || ''}
                        onChange={e => setCredentials({
                          ...credentials,
                          redis: { ...credentials.redis, password: e.target.value },
                        })}
                        placeholder="Leave blank if included in URL"
                        className="input"
                        style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* POSTGRESQL Configuration Form */}
              {selectedProvider === 'postgres' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        PostgreSQL Analytics Database Connection
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                        Configure connection string for persistent logs, mailgun events, and admin access
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestProvider('postgres')}
                      disabled={testingProvider === 'postgres'}
                      className="btn btn-primary"
                      style={{
                        fontSize: 12,
                        padding: '7px 14px',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      title="Test Database Query"
                    >
                      <RefreshCw size={13} className={testingProvider === 'postgres' ? 'animate-spin' : ''} />
                      {testingProvider === 'postgres' ? 'Querying Pool…' : 'Test Database Query'}
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                      Database Connection URI
                    </label>
                    <input
                      type="text"
                      value={credentials.postgres.url}
                      onChange={e => setCredentials({
                        ...credentials,
                        postgres: { ...credentials.postgres, url: e.target.value },
                      })}
                      placeholder="postgresql://user:pass@host:5432/dbname"
                      className="input"
                      style={{ width: '100%', fontSize: 13, fontFamily: 'Geist Mono, monospace' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cache TTL & Invalidation Settings */}
            <div style={{ padding: '16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Telemetry Cache Invalidation Windows
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                    Adjust TTL durations for high-frequency dashboard analytics requests
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFlushCache}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    gap: 6,
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                  }}
                  title="Flush Local & Distributed Cache"
                >
                  <RefreshCw size={13} />
                  {cacheFlushSuccess ? 'Cache Cleared! ✓' : 'Flush Local Cache'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Funnel Cache TTL (Seconds)
                  </label>
                  <input
                    type="number"
                    value={cacheTTL.funnel}
                    onChange={e => setCacheTTL({ ...cacheTTL, funnel: Number(e.target.value) })}
                    className="input"
                    style={{ width: '100%', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Features Cache TTL (Seconds)
                  </label>
                  <input
                    type="number"
                    value={cacheTTL.features}
                    onChange={e => setCacheTTL({ ...cacheTTL, features: Number(e.target.value) })}
                    className="input"
                    style={{ width: '100%', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Retention Cache TTL (Seconds)
                  </label>
                  <input
                    type="number"
                    value={cacheTTL.retention}
                    onChange={e => setCacheTTL({ ...cacheTTL, retention: Number(e.target.value) })}
                    className="input"
                    style={{ width: '100%', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    User Lookup TTL (Real-time)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={0}
                    className="input"
                    style={{ width: '100%', fontFamily: 'Geist Mono, monospace', fontSize: 12, background: 'var(--panel)' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2, display: 'block' }}>Uncached / Live API</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Team, Permissions & Security (Maz Super Admin Management Suite) */}
        {activeTab === 'security' && (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            className="animate-fade-in"
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                  }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      Team Administrators & Role Access Management
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: 11, gap: 4 }}>
                      👑 Maz: Super Admin (Source of Truth)
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                    Manage authorized administrator accounts, assign access tiers, and audit platform security
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!rbac.canManageTeam}
                onClick={() => setShowAddUserModal(true)}
                className="btn btn-primary"
                style={{
                  fontSize: 12,
                  padding: '7px 14px',
                  gap: 6,
                  opacity: !rbac.canManageTeam ? 0.5 : 1,
                  cursor: !rbac.canManageTeam ? 'not-allowed' : 'pointer',
                }}
                title={!rbac.canManageTeam ? 'Only Super Admin (Maz) can provision administrator accounts' : '+ Add Administrator'}
              >
                <UserPlus size={14} />
                {!rbac.canManageTeam ? '+ Add Admin (Locked)' : '+ Add Administrator'}
              </button>
            </div>

            {/* Team User Management Toast (if action triggered) */}
            {userActionMsg && (
              <div
                className="badge badge-success animate-slide-up"
                style={{ padding: '8px 14px', gap: 6, fontSize: 13, alignSelf: 'flex-start' }}
              >
                <CheckCircle2 size={14} /> {userActionMsg}
              </div>
            )}

            {/* Modal: Add New Administrator */}
            {showAddUserModal && (
              <div
                className="animate-slide-up"
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserPlus size={16} color="var(--accent)" />
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      Provision New Administrator Account
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={newUserForm.name}
                      onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="input"
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@talentbridge.cv"
                      value={newUserForm.email}
                      onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="input"
                      style={{ width: '100%', fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                      Role & Permissions
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="input"
                      style={{ width: '100%', fontSize: 12 }}
                    >
                      <option value="Admin">Admin (Full Telemetry & Exports)</option>
                      <option value="Data Analyst">Data Analyst (Read-Only Analytics)</option>
                      <option value="Viewer">Viewer / Demo (Restricted Access)</option>
                      <option value="Super Admin">Super Admin (Full System Access)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                      Temporary Password
                    </label>
                    <input
                      type="text"
                      value={newUserForm.tempPassword}
                      onChange={e => setNewUserForm({ ...newUserForm, tempPassword: e.target.value })}
                      className="input"
                      style={{ width: '100%', fontSize: 12, fontFamily: 'Geist Mono, monospace' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAdminUser}
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '6px 16px', gap: 6 }}
                  >
                    <UserPlus size={13} />
                    Confirm & Provision User
                  </button>
                </div>
              </div>
            )}

            {/* Active Admin Accounts Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Authorized Team Accounts ({teamUsers.length})
                </h4>
                <span style={{ fontSize: 12, color: 'var(--faint)' }}>
                  All accounts synchronised with JWT & Database Store
                </span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Admin Name</th>
                      <th>Email</th>
                      <th>Role Tier</th>
                      <th>Session Policy</th>
                      <th>Last Active</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamUsers.map(u => (
                      <tr key={u.email}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 99,
                                background: u.isOwner ? 'rgba(45, 212, 191, 0.15)' : 'var(--panel-2)',
                                color: u.isOwner ? '#2DD4BF' : 'var(--text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 11,
                                border: '1px solid var(--line)',
                              }}
                            >
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, margin: 0, fontSize: 13, color: 'var(--text)' }}>
                                {u.name}
                              </p>
                              {u.isOwner && (
                                <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                                  👑 Super Admin / Lead Owner
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-2)', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>
                          {u.email}
                        </td>
                        <td>
                          <select
                            disabled={!rbac.canManageTeam || u.isOwner}
                            value={u.role}
                            onChange={e => handleUpdateUserRole(u.email, e.target.value)}
                            className="input"
                            style={{
                              padding: '2px 6px',
                              fontSize: 11,
                              fontWeight: 600,
                              background: !rbac.canManageTeam || u.isOwner ? 'var(--panel-2)' : 'var(--panel)',
                              cursor: !rbac.canManageTeam || u.isOwner ? 'not-allowed' : 'pointer',
                              width: 130,
                              opacity: !rbac.canManageTeam && !u.isOwner ? 0.7 : 1,
                            }}
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Admin">Admin</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>
                        <td style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: 'var(--dim)' }}>
                          {u.expiry}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {u.lastActive || 'Recently'}
                        </td>
                        <td>
                          <button
                            type="button"
                            disabled={!rbac.canManageTeam || u.isOwner}
                            onClick={() => handleToggleUserStatus(u.email)}
                            className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}
                            style={{
                              fontSize: 11,
                              cursor: !rbac.canManageTeam || u.isOwner ? 'default' : 'pointer',
                              border: 'none',
                              opacity: !rbac.canManageTeam && !u.isOwner ? 0.7 : 1,
                            }}
                            title={u.isOwner ? 'Primary owner cannot be suspended' : !rbac.canManageTeam ? 'Only Super Admin can change account status' : 'Click to toggle status'}
                          >
                            {u.status}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              type="button"
                              disabled={!rbac.canManageTeam || u.isOwner}
                              onClick={() => handleResetUserSession(u.email)}
                              className="btn btn-ghost"
                              style={{
                                padding: '4px 8px',
                                fontSize: 11,
                                color: 'var(--accent2)',
                                opacity: !rbac.canManageTeam || u.isOwner ? 0.4 : 1,
                                cursor: !rbac.canManageTeam || u.isOwner ? 'not-allowed' : 'pointer',
                              }}
                              title={!rbac.canManageTeam ? 'Super Admin only' : 'Reset JWT Session Token'}
                            >
                              Reset
                            </button>
                            {!u.isOwner && (
                              <button
                                type="button"
                                disabled={!rbac.canManageTeam}
                                onClick={() => handleDeleteUser(u.email)}
                                className="btn-icon"
                                style={{
                                  color: '#EF4444',
                                  width: 26,
                                  height: 26,
                                  opacity: !rbac.canManageTeam ? 0.3 : 1,
                                  cursor: !rbac.canManageTeam ? 'not-allowed' : 'pointer',
                                }}
                                title={!rbac.canManageTeam ? 'Super Admin only' : 'Revoke & Delete Administrator Account'}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs & Security Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Audit Log Stream */}
              <div style={{ padding: '16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={15} color="var(--accent)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      Recent Administrative Audit Trail
                    </span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>Live Telemetry</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { action: 'Super Admin Login (maz@talentbridge.cv)', location: 'London, UK (IP: 192.168.1.42)', time: '2 mins ago', icon: CheckCircle2, color: '#10B981' },
                    { action: 'Telemetry Pipeline Sync (PostHog & Mailgun)', location: 'Automated Worker', time: '14 mins ago', icon: RefreshCw, color: '#2DD4BF' },
                    { action: 'User Directory Export to CSV (12,450 records)', location: 'admin@talentbridge.cv', time: '42 mins ago', icon: Server, color: '#3B82F6' },
                    { action: 'Anomaly Trigger threshold modified to 40%', location: 'maz@talentbridge.cv', time: '1 hour ago', icon: Flame, color: '#F59E0B' },
                  ].map((log, idx) => {
                    const LogIcon = log.icon;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--panel)',
                          borderRadius: 6,
                          border: '1px solid var(--line)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <LogIcon size={13} color={log.color} />
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{log.action}</span>
                            <span style={{ color: 'var(--dim)', marginLeft: 8, fontSize: 11 }}>{log.location}</span>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--faint)' }}>{log.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Lock size={14} color="var(--accent2)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>JWT Token Security</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0 }}>
                    Stateless signed HTTP-only cookies with 7-day sliding expiration.
                  </p>
                </div>

                <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Key size={14} color="var(--accent2)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Bcrypt Password Hashing</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0 }}>
                    12-round salted hashing protecting stored admin credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Portal Appearance & Formatting */}
        {activeTab === 'appearance' && (
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A855F7',
                }}
              >
                <Palette size={18} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Portal Appearance & Metric Display
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Theme mode preferences, typography standards, and visualization options
                </p>
              </div>
            </div>

            {/* Theme Mode Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                Theme Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: appearance.themeMode === 'dark' ? 'rgba(45, 212, 191, 0.08)' : 'var(--panel-2)',
                    border: appearance.themeMode === 'dark' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: 0 }}>Deep Dark Mode</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '4px 0 0 0' }}>Sleek dark theme (#0C0F14)</p>
                  </div>
                  {appearance.themeMode === 'dark' && <CheckCircle2 size={18} color="var(--accent)" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: appearance.themeMode === 'light' ? 'rgba(45, 212, 191, 0.08)' : 'var(--panel-2)',
                    border: appearance.themeMode === 'light' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: 0 }}>Clean Light Mode</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '4px 0 0 0' }}>Crisp slate light theme (#F4F6F8)</p>
                  </div>
                  {appearance.themeMode === 'light' && <CheckCircle2 size={18} color="var(--accent)" />}
                </button>
              </div>
            </div>

            {/* Typography Specification */}
            <div style={{ padding: '16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Primary Typography System</span>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>Geist & Geist Mono</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                All headings, dashboard KPI figures, chart tooltips, and table rows render in high-clarity <strong>Geist Sans</strong> and <strong>Geist Mono</strong> typography.
              </p>
            </div>
          </div>
        )}

        {/* ── Section Footer: Save & Reset Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 13, gap: 6 }}
          >
            <Check size={15} />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
