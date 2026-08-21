import React, { useState } from 'react';
import {
  SlidersHorizontal, Mail, TrendingDown, AlertTriangle, CheckCircle2, RotateCcw,
  Send, Check, Flame, Server, Shield, Palette, Database, RefreshCw,
  Lock, Key, Activity,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

type TabKey = 'alerts' | 'email' | 'integrations' | 'security' | 'appearance';

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
  { id: 'integrations', label: 'Integrations & API', icon: Server, badge: 'PostHog', desc: 'Telemetry connections & cache TTLs' },
  { id: 'security', label: 'Team & Security', icon: Shield, desc: 'Admin accounts & auth session policies' },
  { id: 'appearance', label: 'Portal Appearance', icon: Palette, desc: 'Themes, formatting & visual display' },
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, sendTestEmailAlert } = useSettings();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('alerts');
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);
  const [cacheFlushSuccess, setCacheFlushSuccess] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
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

  const handleFlushCache = () => {
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
            Configure anomaly alert thresholds, email digest schedules, telemetry cache TTLs, and security policies.
          </p>
        </div>

        {saveSuccess && (
          <div className="badge badge-success animate-fade-in" style={{ padding: '8px 14px', gap: 6, fontSize: 13 }}>
            <CheckCircle2 size={14} /> Preferences saved successfully!
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
                padding: '9px 16px',
                borderRadius: 'var(--radius-xs)',
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? '#2DD4BF' : 'var(--text-2)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              className="hover:text-[var(--text)]"
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 99,
                    background: isActive ? 'rgba(45, 212, 191, 0.2)' : 'var(--panel-2)',
                    color: isActive ? '#2DD4BF' : 'var(--faint)',
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
                  value={formData.funnelDropoffThreshold}
                  onChange={e => setFormData({ ...formData, funnelDropoffThreshold: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
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
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
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
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.enableRetentionMilestones}
                    onChange={e => setFormData({ ...formData, enableRetentionMilestones: e.target.checked })}
                    style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      Retention Benchmarks
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                      Notify when weekly cohorts gain +3% WoW
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
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.enableSystemHealthAlerts}
                    onChange={e => setFormData({ ...formData, enableSystemHealthAlerts: e.target.checked })}
                    style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                      Telemetry Fallbacks
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
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
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
                disabled={isSendingTest}
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

        {/* TAB 3: Integrations, Telemetry & Caching */}
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
                  Telemetry, External Services & Cache Management
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Monitor external connectors, PostHog pipeline, Mailgun webhooks, and Redis TTLs
                </p>
              </div>
            </div>

            {/* Integration Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'PostHog Analytics', status: 'Connected', desc: 'Product funnel & event ingestion', ping: '12ms', icon: Activity, color: '#2DD4BF' },
                { name: 'Mailgun Webhooks', status: 'Connected', desc: 'Email delivers, opens & bounces', ping: '24ms', icon: Mail, color: '#3B82F6' },
                { name: 'Redis Cache Layer', status: 'Active (Fallback)', desc: 'Fast cache response & TTL store', ping: '1ms', icon: Database, color: '#F59E0B' },
                { name: 'PostgreSQL Database', status: 'Connected', desc: 'Admin users & persistent logs', ping: '4ms', icon: Server, color: '#10B981' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="stat-card" style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                      <Icon size={14} color={item.color} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>{item.status}</span>
                      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--faint)' }}>{item.ping}</span>
                    </div>
                  </div>
                );
              })}
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
                  style={{ fontSize: 12, padding: '6px 12px', gap: 6, border: '1px solid var(--line)' }}
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

        {/* TAB 4: Team, Permissions & Security */}
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
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Team Members & Access Control Policies
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Signed-in admin sessions, role assignments, and security authentication policies
                </p>
              </div>
            </div>

            {/* Active Admin Accounts Table */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                Authorized Administrator Accounts
              </h4>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Admin Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Session Expiration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Maz (Lead Admin)', email: 'maz@talentbridge.cv', role: 'Super Admin', expiry: '7 Days (Sliding)', status: 'Active' },
                      { name: 'System Admin', email: 'admin@talentbridge.cv', role: 'Admin', expiry: '7 Days (Sliding)', status: 'Active' },
                      { name: 'Test Operator', email: 'test@example.com', role: 'Viewer / Demo', expiry: '24 Hours', status: 'Active' },
                    ].map(admin => (
                      <tr key={admin.email}>
                        <td style={{ fontWeight: 600 }}>{admin.name}</td>
                        <td style={{ color: 'var(--text-2)' }}>{admin.email}</td>
                        <td><span className="badge badge-neutral" style={{ fontSize: 11 }}>{admin.role}</span></td>
                        <td style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>{admin.expiry}</td>
                        <td><span className="badge badge-success" style={{ fontSize: 11 }}>{admin.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session Security Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ padding: '16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Lock size={15} color="var(--accent2)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>JWT Token Security</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Stateless signed HTTP-only cookies with 7-day expiration, protected against CSRF and XSS attacks.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Key size={15} color="var(--accent2)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Bcrypt Password Hashing</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Industry-standard salt rounds (12) salted password hashing ensuring stored credential security.
                </p>
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
                    background: appearance.themeMode === 'dark' ? 'var(--ink)' : 'var(--panel-2)',
                    border: appearance.themeMode === 'dark' ? '2px solid #2DD4BF' : '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF', margin: 0 }}>Deep Dark Mode</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '4px 0 0 0' }}>High contrast dark theme (#070C0B)</p>
                  </div>
                  {appearance.themeMode === 'dark' && <CheckCircle2 size={18} color="#2DD4BF" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: appearance.themeMode === 'light' ? '#FFFFFF' : 'var(--panel-2)',
                    border: appearance.themeMode === 'light' ? '2px solid #2DD4BF' : '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#000000', margin: 0 }}>Clean Light Mode</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '4px 0 0 0' }}>Crisp slate light theme (#F4F7F6)</p>
                  </div>
                  {appearance.themeMode === 'light' && <CheckCircle2 size={18} color="#2DD4BF" />}
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
