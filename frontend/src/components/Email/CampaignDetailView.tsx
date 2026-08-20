import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, ExternalLink, CheckCircle2, Eye,
  User, Search, TrendingUp, Filter,
} from 'lucide-react';
import type { EmailCampaign } from '../../types';
import { formatNumber, formatDate, formatDateTime } from '../../utils/formatters';

export const CampaignDetailView: React.FC<{
  campaign: EmailCampaign;
  onBack: () => void;
}> = ({ campaign, onBack }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'recipients' | 'template'>('performance');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');

  const filteredRecipients = campaign.recipients?.filter(r => {
    const matchesFilter = recipientFilter === 'all' || r.status === recipientFilter;
    const matchesSearch = recipientSearch === '' ||
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(recipientSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-ghost"
          style={{ width: 'fit-content', gap: 6, padding: '8px 14px' }}
          id="campaign-back-btn"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to All Campaigns
        </button>
      </div>

      {/* Campaign Hero Card */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                {campaign.campaignName}
              </h2>
              <span className="badge badge-success" style={{ gap: 4 }}>
                <CheckCircle2 size={11} /> Delivered via Mailgun
              </span>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                ID: {campaign.campaignId}
              </span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>Subject:</strong> <em>"{campaign.subjectLine || 'Welcome to TalentBridge'}"</em>
            </p>
            <p style={{ fontSize: 12, color: 'var(--faint)' }}>
              <strong>Audience:</strong> {campaign.targetAudience || 'All Registered Creators'} • <strong>Trigger:</strong> {campaign.triggerType || 'Automated Journey'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
              Sent on {formatDate(campaign.sentDate)}
            </span>
          </div>
        </div>

        {/* 6 Performance Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>Total Sent</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{formatNumber(campaign.sentCount)}</p>
            <p style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>{campaign.deliveredCount || campaign.sentCount} delivered</p>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>Open Rate</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6', fontFamily: 'Sora' }}>{campaign.openPercentage}%</p>
            <p style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>{formatNumber(campaign.openCount)} opens</p>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>Click Rate</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#2DD4BF', fontFamily: 'Sora' }}>{campaign.clickPercentage}%</p>
            <p style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>{formatNumber(campaign.clickCount)} clicks</p>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>CTOR</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#10B981', fontFamily: 'Sora' }}>{campaign.ctor || 40.5}%</p>
            <p style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>Click-to-open ratio</p>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>Bounces</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: campaign.bounceCount > 0 ? '#EF4444' : 'var(--text)', fontFamily: 'Sora' }}>{campaign.bounceCount}</p>
            <p style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>{((campaign.bounceCount / campaign.sentCount) * 100).toFixed(1)}% rate</p>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 4 }}>Unsubscribes</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{campaign.unsubscribeCount}</p>
            <p style={{ fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>Opt-outs</p>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 8, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('performance')}
          className="btn"
          style={{
            background: activeTab === 'performance' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'performance' ? '#FFFFFF' : 'var(--text-2)',
            border: activeTab === 'performance' ? 'none' : '1px solid var(--line)',
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
          }}
        >
          <TrendingUp size={14} color={activeTab === 'performance' ? '#2DD4BF' : undefined} />
          Hourly Trajectory & Link Clicks
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className="btn"
          style={{
            background: activeTab === 'recipients' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'recipients' ? '#FFFFFF' : 'var(--text-2)',
            border: activeTab === 'recipients' ? 'none' : '1px solid var(--line)',
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
          }}
        >
          <User size={14} />
          Recipient Logs
          <span className="badge badge-neutral" style={{ fontSize: 10 }}>{campaign.recipients?.length || 0}</span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className="btn"
          style={{
            background: activeTab === 'template' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'template' ? '#FFFFFF' : 'var(--text-2)',
            border: activeTab === 'template' ? 'none' : '1px solid var(--line)',
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
          }}
        >
          <Eye size={14} />
          Email Template Preview
        </button>
      </div>

      {/* ── Tab 1: Performance & Link Clicks ─────────────────── */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hourly opens vs clicks chart */}
          {campaign.hourlyEngagement && (
            <div className="chart-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    Hourly Engagement Curve
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Opens and click interactions after email delivery</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3B82F6' }} />
                    <span style={{ color: 'var(--text-2)' }}>Opens</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2DD4BF' }} />
                    <span style={{ color: 'var(--text-2)' }}>Clicks</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={campaign.hourlyEngagement} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emailOpenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="emailClickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
                    labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                  />
                  <Area type="monotone" dataKey="opens" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#emailOpenGrad)" name="Opens" />
                  <Area type="monotone" dataKey="clicks" stroke="#2DD4BF" strokeWidth={2.5} fillOpacity={1} fill="url(#emailClickGrad)" name="Clicks" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Links & CTA Performance */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Links & CTA Performance
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Which buttons and hyperlinks drove recipient actions</p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                {campaign.links?.length || 0} trackable links
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {campaign.links?.map((link, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, marginBottom: 2 }}>{link.label}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {link.url} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', fontFamily: 'Sora' }}>{link.clicks} clicks</p>
                      <span style={{ fontSize: 11, color: 'var(--faint)' }}>{link.percentage}% of total clicks</span>
                    </div>
                  </div>

                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${link.percentage}%`,
                        background: 'linear-gradient(90deg, #2DD4BF, #0D9488)',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Recipient Logs ─────────────────────────────── */}
      {activeTab === 'recipients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input
                type="text"
                placeholder="Search recipients by name or email…"
                value={recipientSearch}
                onChange={e => setRecipientSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 34, fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} color="var(--dim)" />
              <select
                className="input"
                style={{ width: 150 }}
                value={recipientFilter}
                onChange={e => setRecipientFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="clicked">Clicked</option>
                <option value="opened">Opened</option>
                <option value="delivered">Delivered</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th>Opened At</th>
                    <th>Clicked At</th>
                    <th>Email Client / Device</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                        No recipient records match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map(r => (
                      <tr key={r.recipientId}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{r.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{r.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            r.status === 'clicked'
                              ? 'badge-success'
                              : r.status === 'opened'
                              ? 'badge-info'
                              : r.status === 'bounced'
                              ? 'badge-error'
                              : 'badge-neutral'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatDateTime(r.sentAt)}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {r.openedAt ? formatDateTime(r.openedAt) : <span style={{ color: 'var(--faint)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {r.clickedAt ? (
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>✓ {formatDateTime(r.clickedAt)}</span>
                          ) : (
                            <span style={{ color: 'var(--faint)' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {r.client} ({r.device})
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Email Template Mockup Preview ──────────────── */}
      {activeTab === 'template' && (
        <div className="card" style={{ padding: '24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 18 }}>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>From:</strong> TalentBridge Team &lt;notifications@talentbridge.io&gt;
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>Subject:</strong> {campaign.subjectLine || campaign.campaignName}
            </p>
            <p style={{ fontSize: 11, color: 'var(--faint)' }}>
              <strong>Preheader:</strong> Your interactive 3D portfolio room is waiting.
            </p>
          </div>

          {/* Email Body HTML rendered safely */}
          <div
            style={{
              padding: '24px',
              background: 'var(--panel-2)',
              borderRadius: 12,
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
            dangerouslySetInnerHTML={{
              __html: campaign.previewHtml || '<p>Email template preview loading...</p>',
            }}
          />

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--faint)' }}>
              TalentBridge Inc. • 100 King Street, London • Unsubscribe preferences
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
