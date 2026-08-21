import React, { useState } from 'react';
import {
  SlidersHorizontal, Mail,
  TrendingDown, AlertTriangle, CheckCircle2, RotateCcw,
  Send, Check, Flame,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, sendTestEmailAlert } = useSettings();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

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
    } catch (e) {
      setTestEmailResult('Failed to dispatch test email.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Settings & Alert Triggers
            </h2>
            <span className="badge badge-success" style={{ gap: 4 }}>
              <SlidersHorizontal size={11} /> Threshold Controls
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Fine-tune anomaly trigger thresholds ("baking settings") and manage email digest updates for signed-in admins.
          </p>
        </div>

        {saveSuccess && (
          <div className="badge badge-success animate-fade-in" style={{ padding: '8px 14px', gap: 6, fontSize: 13 }}>
            <CheckCircle2 size={14} /> Preferences saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Section 1: Anomaly Trigger Thresholds ("Baking Settings") ── */}
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
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
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
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Anomaly Alert Triggers & Baking Rules
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                Set automatic triggers for when dashboards flag warnings and notifications
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
                    fontFamily: 'JetBrains Mono, monospace',
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
                Triggers an alert when user drop-off between any two onboarding stages exceeds this percentage.
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
                    fontFamily: 'JetBrains Mono, monospace',
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
                  style={{ width: 100, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
                />
                <span style={{ fontSize: 12, color: 'var(--dim)' }}>total bounce events per campaign</span>
              </div>
            </div>
          </div>

          {/* Trigger Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Real-time Event Triggers
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
                    Alert when recruiters/execs view user showcase rooms
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
                    Cache Fallback & Telemetry
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                    Alert when PostHog fallback cache is activated
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 2: Signed-in User Email Notifications & Digest ── */}
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
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
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
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Signed-in User Email Updates & Digest
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                  Direct analytical updates and triggered anomaly digests to your inbox
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
                Recipient Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
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
              </div>
              <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                Currently signed in as: <strong>{user?.email || 'maz@talentbridge.cv'}</strong> ({user?.role || 'admin'})
              </span>
            </div>

            {/* Email Frequency */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="settings-email-frequency" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Email Digest Schedule
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
              marginTop: 8,
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

        {/* ── Section 3: Save / Reset Footer ── */}
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
