import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Globe, Download, FileText, TrendingUp, Share2, Search, Zap, ArrowUpRight, Mail, Users,
  MessageCircle, Hash, Radio, ShoppingBag,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { WebsiteDashboardResponse } from '../../types';
import { formatNumber, formatDate } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { useRbac } from '../../utils/rbac';

const LinkedInSvg = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterSvg = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubSvg = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const YoutubeSvg = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill={color} />
  </svg>
);

// ── Channel color + icon helpers (shared with ChannelBreakdownDashboard) ─────
const CHANNEL_COLORS: Record<string, string> = {
  'LinkedIn': '#0A66C2', 'WhatsApp': '#25D366',
  'Direct Link': '#0D9488', 'Direct Traffic': '#0D9488',
  'Organic Search (Google)': '#4285F4', 'Organic Search (Bing)': '#00809D',
  'Organic Search (DuckDuckGo)': '#DE5833', 'Organic Search & Social': '#8B5CF6',
  'Twitter / X': '#1DA1F2', 'Facebook': '#1877F2', 'Instagram': '#E1306C',
  'Reddit': '#FF4500', 'Telegram': '#229ED9', 'Slack': '#4A154B',
  'GitHub': '#6366F1', 'YouTube': '#FF0000', 'TikTok': '#010101',
  'Product Hunt': '#DA552F', 'Email Campaigns': '#F59E0B',
  'Paid Ads': '#EC4899', 'Creator Referrals': '#10B981',
  'Google Ads (Paid)': '#4285F4', 'LinkedIn Ads (Paid)': '#0A66C2',
};
const DEFAULT_COLORS = ['#0D9488','#2DD4BF','#3B82F6','#8B5CF6','#F59E0B','#EC4899','#10B981','#FA520F','#6366F1'];

function ChannelIcon({ name, size = 14, color }: { name: string; size?: number; color?: string }) {
  const s = name.toLowerCase();
  const st = { flexShrink: 0 as const, color: color || 'currentColor' };
  if (s.includes('linkedin')) return <LinkedInSvg size={size} color={color} />;
  if (s.includes('twitter') || s === 'twitter / x') return <TwitterSvg size={size} color={color} />;
  if (s.includes('whatsapp')) return <MessageCircle size={size} style={st} />;
  if (s.includes('telegram')) return <Radio size={size} style={st} />;
  if (s.includes('github')) return <GithubSvg size={size} color={color} />;
  if (s.includes('reddit')) return <Hash size={size} style={st} />;
  if (s.includes('youtube')) return <YoutubeSvg size={size} color={color} />;
  if (s.includes('product hunt')) return <ShoppingBag size={size} style={st} />;
  if (s.includes('search')) return <Search size={size} style={st} />;
  if (s.includes('email')) return <Mail size={size} style={st} />;
  if (s.includes('paid') || s.includes('ads')) return <Zap size={size} style={st} />;
  if (s.includes('referral') || s.includes('creator')) return <Users size={size} style={st} />;
  if (s.includes('direct')) return <ArrowUpRight size={size} style={st} />;
  if (s.includes('social')) return <Share2 size={size} style={st} />;
  return <Globe size={size} style={st} />;
}
export const WebsiteAnalyticsDashboard: React.FC = () => {
  const rbac = useRbac();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });

  const { data, isLoading, error } = useQuery<WebsiteDashboardResponse>({
    queryKey: ['websiteDashboard', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getWebsiteDashboard(dateRange.preset) as Promise<WebsiteDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.topPages?.length) return;
    exportToCsv({
      filename: `talentbridge_website_top_pages_${dateRange.preset}`,
      columns: [
        { header: 'Page Path', accessor: row => row.path },
        { header: 'Views', accessor: row => row.views },
        { header: 'Unique Visitors', accessor: row => row.uniqueVisitors },
        { header: 'Share of Traffic (%)', accessor: row => `${row.percentage}%` },
      ],
      data: data.topPages,
    });
  };

  // Show the dashboard if PostHog is connected and has ANY data (persons or events)
  // Don't require $pageview events — channel/geo/device data from persons is still valuable
  const hasData = Boolean(
    data &&
    data.postHogConnected &&
    (
      (data.summary && data.summary.totalPageviews > 0) ||
      (data.trafficSources && data.trafficSources.length > 0) ||
      (data.acquisitionChannels && data.acquisitionChannels.length > 0) ||
      (data.geoTraffic && data.geoTraffic.length > 0) ||
      (data.devices && data.devices.length > 0)
    )
  );
  const hasPageviewData = Boolean(data && data.summary && data.summary.totalPageviews > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Website Analytics
            </h2>
            <span className="badge badge-teal" style={{ gap: 4 }}>
              <Globe size={11} /> Sitewide
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            How visitors find and move through the whole site — pageviews, top pages, traffic sources, and devices.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="website-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!data?.topPages?.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Top Pages to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
          </button>
        </div>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load website analytics.</div>}

      {data && !data.postHogConnected ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <Globe size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            PostHog Not Connected
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            Add a valid PostHog API key in Settings to pull live sitewide pageview, traffic, and device telemetry.
          </p>
        </div>
      ) : data && data.postHogConnected && !hasData ? (
        // Truly no data at all — show a simple notice
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <FileText size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Data Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            Connected to PostHog, but no events or person records have arrived yet. Confirm the client-side snippet is installed on talentbridge.cv.
          </p>
        </div>
      ) : data && hasData && (
        <>
          {/* Acquisition Channels — person-based, always available when PostHog is connected */}
          {((data as any).acquisitionChannels?.length > 0) && (
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <TrendingUp size={16} color="var(--accent)" />
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      Where Users Are Joining From
                    </h3>
                    <span className="badge badge-teal" style={{ fontSize: 10.5 }}>Live · Person-based</span>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
                    Acquisition channels across all {(data as any).acquisitionChannels.reduce((sum: number, c: any) => sum + Number(c.count || 0), 0)} tracked users — from UTM tags, referrer domains &amp; ad click IDs
                  </p>
                </div>
                <a
                  href="/dashboard/channels"
                  style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                >
                  Full breakdown →
                </a>
              </div>

              {/* Donut + bar list side by side */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Mini donut */}
                <div style={{ flexShrink: 0, width: 160, height: 160 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={(data as any).acquisitionChannels}
                        dataKey="count"
                        nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={40} outerRadius={70}
                        paddingAngle={2}
                      >
                        {(data as any).acquisitionChannels.map((ch: any, idx: number) => (
                          <Cell key={ch.name} fill={ch.color || CHANNEL_COLORS[ch.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]} stroke="var(--panel)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
                        formatter={(v: any, name: any) => [`${formatNumber(Number(v || 0))} users`, String(name || '')] as [string, string]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Channel list */}
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(data as any).acquisitionChannels.map((ch: any, idx: number) => {
                    const color = ch.color || CHANNEL_COLORS[ch.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
                    return (
                      <div key={ch.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5, alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <ChannelIcon name={ch.name} size={13} color={color} />
                            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{ch.name}</span>
                          </div>
                          <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                            {formatNumber(Number(ch.count))} ({ch.percentage}%)
                          </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div style={{ height: '100%', width: `${ch.percentage}%`, background: color, borderRadius: 9999, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* No pageview events notice (inline — still show person-based data) */}
          {!hasPageviewData && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-xs)',
              padding: '11px 16px',
              fontSize: 12.5,
              color: '#B45309',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <FileText size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong>No $pageview events yet</strong> — pageview count, trends and top-pages sections are unavailable.
                Channel, device, geo and browser data (sourced from PostHog person records) are still shown.
                Install the PostHog JS snippet with <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>capture_pageview: true</code> on talentbridge.cv to enable pageview tracking.
              </span>
            </div>
          )}

          {/* KPI Cards (pageview-dependent) */}
          {hasPageviewData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="stat-card">
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Total Pageviews</p>
                <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalPageviews)}</p>
              </div>

              <div className="stat-card">
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Unique Visitors</p>
                <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.uniqueVisitors)}</p>
              </div>

              <div className="stat-card">
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Sessions</p>
                <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalSessions)}</p>
              </div>

              <div className="stat-card">
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Avg Session Duration</p>
                <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.avgSessionDuration || '—'}</p>
              </div>

              <div className="stat-card">
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Bounce Rate</p>
                <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.bounceRate}%</p>
                <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Single-pageview visits</p>
              </div>
            </div>
          )}

          {/* Pageviews Over Time */}
          {data.pageviewsTrend.length > 0 && (
            <div className="card-mistral">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    Pageviews Over Time
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Sitewide daily pageviews and unique visitors</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#14B8A6' }} />
                    <span style={{ color: 'var(--text-2)' }}>Pageviews</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
                    <span style={{ color: 'var(--text-2)' }}>Unique Visitors</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.pageviewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="uniqueVisitorsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-2)', fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => formatDate(v)}
                  />
                  <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                    labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                    labelFormatter={(v) => formatDate(typeof v === 'string' ? v : undefined)}
                  />
                  <Area type="monotone" dataKey="pageviews" stroke="#14B8A6" strokeWidth={2.6} fillOpacity={1} fill="url(#pageviewsGrad)" name="Pageviews" />
                  <Area type="monotone" dataKey="uniqueVisitors" stroke="#FA520F" strokeWidth={2.6} fillOpacity={1} fill="url(#uniqueVisitorsGrad)" name="Unique Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Traffic Sources & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Traffic Sources
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>How visitors arrive on the site, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.trafficSources.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No referrer data yet.</p>}
                {data.trafficSources.map(s => (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                      <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {s.count} ({s.percentage}%)
                      </span>
                    </div>
                    <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${s.percentage}%`,
                          background: 'linear-gradient(90deg, #14B8A6, #FA520F)',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Device Breakdown
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Form-factors used by visitors, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.devices.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No device data yet.</p>}
                {data.devices.map(d => (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{d.name}</span>
                      <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {d.count} ({d.percentage}%)
                      </span>
                    </div>
                    <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${d.percentage}%`,
                          background: 'linear-gradient(90deg, #3B82F6, #14B8A6)',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Browsers & OS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Browsers
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top browsers used, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.browsers.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No browser data yet.</p>}
                {data.browsers.map(b => (
                  <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {b.name}
                      {b.topVersion && <span className="badge badge-neutral mono-metric" style={{ fontSize: 10, padding: '1px 6px' }}>v{b.topVersion}</span>}
                    </span>
                    <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{b.count} ({b.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Operating Systems
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top operating systems, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.operatingSystems.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No OS data yet.</p>}
                {data.operatingSystems.map(o => (
                  <div key={o.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {o.name}
                      {o.topVersion && <span className="badge badge-neutral mono-metric" style={{ fontSize: 10, padding: '1px 6px' }}>v{o.topVersion}</span>}
                    </span>
                    <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{o.count} ({o.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Click Actions — real $el_text from autocapture, e.g. surfaces UI copy typos */}
          {!!data.topActions?.length && (
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Top Click Actions
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>What visitors actually clicked, by the element's own label — real autocapture text, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.topActions.map(a => (
                  <div key={a.text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                    <div>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>"{a.text}"</span>
                      {a.urls.length > 0 && (
                        <span className="mono-metric" style={{ color: 'var(--dim)', fontSize: 11, marginLeft: 8 }}>{a.urls.join(', ')}</span>
                      )}
                    </div>
                    <span className="mono-metric badge badge-teal" style={{ fontSize: 11 }}>{a.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Pages Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="var(--accent)" />
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                  Top Pages
                </h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>Sitewide</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 260 }}>Page Path</th>
                    <th style={{ minWidth: 100 }}>Views</th>
                    <th style={{ minWidth: 120 }}>Unique Visitors</th>
                    <th style={{ minWidth: 120 }}>Share of Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map(page => (
                    <tr key={page.path}>
                      <td>
                        <span className="mono-metric" style={{ fontWeight: 600, color: 'var(--text)' }}>{page.path}</span>
                      </td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(page.views)}</td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(page.uniqueVisitors)}</td>
                      <td>
                        <span className="badge badge-teal mono-metric">{page.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geo Traffic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Geographic Traffic
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Where sitewide visitors are located, by country</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.geoTraffic.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No geo data yet.</p>}
                {data.geoTraffic.map(g => (
                  <div key={g.country}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{g.flag} {g.country}</span>
                      <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{g.views}</span>
                    </div>
                    <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${g.percentage}%`,
                          background: 'linear-gradient(90deg, #14B8A6, #3B82F6)',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City/region-level breakdown from $geoip_city_name + $geoip_subdivision_1_name —
                finer granularity than country alone, previously unused. */}
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Top Cities
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>City/region-level GeoIP breakdown, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(!data.topCities || data.topCities.length === 0) && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No city-level geo data yet.</p>}
                {data.topCities?.map(c => (
                  <div key={`${c.city}-${c.region}-${c.country}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                    <div>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{c.city}</span>
                      <span style={{ color: 'var(--dim)', fontSize: 11, marginLeft: 6 }}>{[c.region, c.country].filter(Boolean).join(', ')}</span>
                    </div>
                    <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{c.views} ({c.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
