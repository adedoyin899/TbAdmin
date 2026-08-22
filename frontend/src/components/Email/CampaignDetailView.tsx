import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, ExternalLink, CheckCircle2, Eye,
  User, Search, TrendingUp, Filter, Download, ChevronRight,
} from 'lucide-react';
import type { EmailCampaign } from '../../types';
import { formatNumber, formatDate, formatDateTime } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';

export const CampaignDetailView: React.FC<{
  campaign: EmailCampaign;
  onBack: () => void;
}> = ({ campaign, onBack }) => {
  const navigate = useNavigate();
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
          style={{ width: 'fit-content', gap: 6, padding: '7px 14px', fontSize: 13 }}
          id="campaign-back-btn"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to All Campaigns
        </button>
      </div>

      {/* Campaign Hero Card */}
      <div className="card-mistral" style={{ padding: '26px' }}>
        <div className="sunset-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {campaign.campaignName}
              </h2>
              <span className="badge badge-success" style={{ gap: 4 }}>
                <CheckCircle2 size={11} /> Delivered via Mailgun
              </span>
              <span className="badge badge-neutral mono-metric" style={{ fontSize: 11 }}>
                ID: {campaign.campaignId}
              </span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>Subject:</strong> <em>&quot;{campaign.subjectLine || 'Welcome to TalentBridge'}&quot;</em>
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>
              <strong>Audience:</strong> {campaign.targetAudience || 'All Registered Creators'} • <strong>Trigger:</strong> {campaign.triggerType || 'Automated Journey'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>
              Sent on {formatDate(campaign.sentDate)}
            </span>
          </div>
        </div>

        {/* 6 Performance Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Total Sent</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(campaign.sentCount)}</p>
            <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>{campaign.deliveredCount || campaign.sentCount} delivered</p>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Open Rate</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6' }}>{campaign.openPercentage}%</p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{formatNumber(campaign.openCount)} opens</p>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Click Rate</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{campaign.clickPercentage}%</p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{formatNumber(campaign.clickCount)} clicks</p>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>CTOR</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{campaign.ctor || 40.5}%</p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Click-to-open</p>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Bounces</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: campaign.bounceCount > 0 ? 'var(--error)' : 'var(--text)' }}>{campaign.bounceCount}</p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{((campaign.bounceCount / campaign.sentCount) * 100).toFixed(1)}% rate</p>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Unsubscribes</p>
            <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{campaign.unsubscribeCount}</p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Opt-outs</p>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs (Mistral Style) ────────────────── */}
      <div className="pill-group no-scrollbar touch-scroll" style={{ alignSelf: 'flex-start', overflowX: 'auto', maxWidth: '100%', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pill-tab ${activeTab === 'performance' ? 'active' : ''}`}
        >
          <TrendingUp size={14} />
          <span>Hourly Engagement &amp; Links</span>
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className={`pill-tab ${activeTab === 'recipients' ? 'active' : ''}`}
        >
          <User size={14} />
          <span>Recipient Logs</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {campaign.recipients?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className={`pill-tab ${activeTab === 'template' ? 'active' : ''}`}
        >
          <Eye size={14} />
          <span>Template Preview</span>
        </button>
      </div>

      {/* ── Tab 1: Performance & Link Clicks ─────────────────── */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hourly opens vs clicks chart */}
          {campaign.hourlyEngagement && (
            <div className="card-mistral">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Hourly Engagement Trajectory
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginTop: 2 }}>Opens and click interactions after email delivery</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3B82F6' }} />
                    <span style={{ color: 'var(--text-2)' }}>Opens</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
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
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-2)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                    labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                  />
                  <Area type="monotone" dataKey="opens" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#emailOpenGrad)" name="Opens" />
                  <Area type="monotone" dataKey="clicks" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#emailClickGrad)" name="Clicks" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Links & CTA Performance */}
          <div className="card-mistral" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Links &amp; CTA Performance Breakdown
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginTop: 2 }}>Buttons and hyperlinks clicked by recipients</p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                {campaign.links?.length || 0} trackable links
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campaign.links?.map((link, idx) => (
                <div key={idx} style={{ padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13.5, marginBottom: 2 }}>{link.label}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {link.url} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="mono-metric" style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{link.clicks} clicks</p>
                      <span className="mono-metric" style={{ fontSize: 11, color: 'var(--dim)' }}>{link.percentage}% of total</span>
                    </div>
                  </div>

                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${link.percentage}%`,
                        background: 'linear-gradient(90deg, #14B8A6, #FA520F)',
                        borderRadius: 9999,
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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

              <button
                onClick={() => {
                  if (!filteredRecipients.length) return;
                  exportToCsv({
                    filename: `${campaign.campaignName.toLowerCase().replace(/\s+/g, '_')}_recipients`,
                    columns: [
                      { header: 'Name', accessor: r => r.name },
                      { header: 'Email', accessor: r => r.email },
                      { header: 'Status', accessor: r => r.status },
                      { header: 'Sent At', accessor: r => r.sentAt },
                      { header: 'Opened At', accessor: r => r.openedAt || '' },
                      { header: 'Clicked At', accessor: r => r.clickedAt || '' },
                      { header: 'Client / Device', accessor: r => r.client || '' },
                    ],
                    data: filteredRecipients,
                  });
                }}
                disabled={!filteredRecipients.length}
                className="btn btn-ghost"
                style={{
                  fontSize: 13,
                  gap: 6,
                }}
                title="Export Filtered Recipients to CSV"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 180 }}>Recipient</th>
                    <th style={{ minWidth: 100 }}>Status</th>
                    <th style={{ minWidth: 110 }}>Sent At</th>
                    <th style={{ minWidth: 110 }}>Opened At</th>
                    <th style={{ minWidth: 110 }}>Clicked At</th>
                    <th style={{ minWidth: 140 }}>Email Client / Device</th>
                    <th style={{ textAlign: 'right', minWidth: 110 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                        No recipient records match your query.
                      </td>
                    </tr>
                  ) : (
                    (filteredRecipients || []).map(r => (
                      <tr
                        key={r.recipientId}
                        onClick={() => navigate('/lookup')}
                        className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                        title={`Click to inspect ${r.name}'s profile in directory`}
                      >
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{r.name}</p>
                            <p className="mono-metric" style={{ fontSize: 11, color: 'var(--text-2)' }}>{r.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            r.status === 'clicked'
                              ? 'badge-teal'
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
                          {r.openedAt ? formatDateTime(r.openedAt) : <span style={{ color: 'var(--dim)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {r.clickedAt ? (
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>✓ {formatDateTime(r.clickedAt)}</span>
                          ) : (
                            <span style={{ color: 'var(--dim)' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {r.client} ({r.device})
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11.5, gap: 4, display: 'inline-flex' }}>
                            Profile <ChevronRight size={11} />
                          </span>
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
        <div className="card-mistral" style={{ padding: '28px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 18 }}>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>From:</strong> TalentBridge Team &lt;notifications@talentbridge.io&gt;
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 4 }}>
              <strong>Subject:</strong> {campaign.subjectLine || campaign.campaignName}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--dim)' }}>
              <strong>Preheader:</strong> Your interactive 3D portfolio room is waiting.
            </p>
          </div>

          {/* Email Body HTML */}
          <div
            style={{
              padding: '32px 28px',
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E5E5E5',
              color: '#1F1F1F',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            }}
            dangerouslySetInnerHTML={{
              __html: campaign.previewHtml || '<p style="color: #64748B;">Email template preview loading...</p>',
            }}
          />

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--dim)' }}>
              TalentBridge Inc. • 100 King Street, London • Unsubscribe preferences
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
