import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie,
} from 'recharts';
import {
  Share2, Globe, Mail, Search, Zap, ArrowUpRight, TrendingUp,
  Linkedin, Twitter, MessageCircle, Hash, Github, Youtube, ShoppingBag,
  Radio, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { formatNumber } from '../../utils/formatters';

// ── Platform icon resolver ────────────────────────────────────────────────────
function ChannelIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const s = name.toLowerCase();
  const style = { flexShrink: 0, color: color || 'currentColor' };
  if (s.includes('linkedin')) return <Linkedin size={size} style={style} />;
  if (s.includes('twitter') || s.includes('x.com') || s === 'twitter / x') return <Twitter size={size} style={style} />;
  if (s.includes('whatsapp')) return <MessageCircle size={size} style={style} />;
  if (s.includes('telegram')) return <Radio size={size} style={style} />;
  if (s.includes('github')) return <Github size={size} style={style} />;
  if (s.includes('reddit')) return <Hash size={size} style={style} />;
  if (s.includes('youtube')) return <Youtube size={size} style={style} />;
  if (s.includes('product hunt')) return <ShoppingBag size={size} style={style} />;
  if (s.includes('search')) return <Search size={size} style={style} />;
  if (s.includes('email')) return <Mail size={size} style={style} />;
  if (s.includes('paid') || s.includes('ads')) return <Zap size={size} style={style} />;
  if (s.includes('referral') || s.includes('creator')) return <Users size={size} style={style} />;
  if (s.includes('direct')) return <ArrowUpRight size={size} style={style} />;
  return <Globe size={size} style={style} />;
}

// ── Group summary card ────────────────────────────────────────────────────────
function GroupCard({ label, icon, count, percentage, color, channels }: {
  label: string;
  icon: React.ReactNode;
  count: number;
  percentage: number;
  color: string;
  channels: { name: string; count: number; percentage: number; color: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '18px 20px',
        cursor: channels.length > 0 ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
      }}
      onClick={() => channels.length > 0 && setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            <p className="mono-metric" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
              {count === 0 ? '—' : formatNumber(count)}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color }}>{percentage}%</p>
          <p style={{ fontSize: 11, color: 'var(--dim)' }}>{channels.length} channel{channels.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Mini bar */}
      <div style={{ height: 6, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', marginBottom: channels.length > 0 ? 10 : 0 }}>
        <div style={{ height: '100%', width: `${Math.min(percentage, 100)}%`, background: color, borderRadius: 9999, transition: 'width 0.6s ease' }} />
      </div>

      {/* Expandable channel list */}
      {channels.length > 0 && (
        <>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
            onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? 'Hide' : 'Show'} breakdown
          </button>
          {open && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {channels.map(ch => (
                <div key={ch.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChannelIcon name={ch.name} size={13} color={ch.color} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</span>
                  <span className="mono-metric" style={{ fontSize: 11, color: 'var(--dim)', whiteSpace: 'nowrap' }}>{ch.count} · {ch.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Donut legend item ─────────────────────────────────────────────────────────
function DonutLegendItem({ name, count, percentage, color, total }: {
  name: string; count: number; percentage: number; color: string; total: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <ChannelIcon name={name} size={13} color={color} />
      <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500, flex: 1 }}>{name}</span>
      <span className="mono-metric" style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>{formatNumber(count)}</span>
      <span className="badge badge-teal mono-metric" style={{ fontSize: 10.5, padding: '2px 7px' }}>{percentage}%</span>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export const ChannelBreakdownDashboard: React.FC = () => {
  const [horizon, setHorizon] = useState('30d');
  const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['channelBreakdown', horizon],
    queryFn: () => dashboardApi.getChannels(horizon),
    staleTime: 1000 * 60 * 10,
  });

  const channels: { name: string; count: number; percentage: number; color: string }[] = data?.channels || [];
  const totalUsers: number = data?.totalUsers || 0;

  const sortedChannels = [...channels].sort((a, b) =>
    sortBy === 'alpha' ? a.name.localeCompare(b.name) : b.count - a.count
  );

  const topChannel = sortedChannels[0];

  const HORIZONS = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: 'lifetime', label: 'All Time' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Channel Breakdown
            </h2>
            <span className="badge badge-sunset" style={{ gap: 4 }}>
              <TrendingUp size={11} /> Acquisition
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Where users are joining from — sourced from PostHog person properties (UTM tags, referrer domains, signup source).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Horizon selector */}
          <div style={{ display: 'flex', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
            {HORIZONS.map(h => (
              <button
                key={h.value}
                id={`channel-horizon-${h.value}`}
                onClick={() => setHorizon(h.value)}
                style={{
                  padding: '6px 13px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: horizon === h.value ? 'var(--accent)' : 'transparent',
                  color: horizon === h.value ? '#fff' : 'var(--text-2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            title="Refresh channel data"
            className="btn btn-ghost"
            style={{ fontSize: 12, gap: 5, padding: '6px 12px' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, gap: 12, flexDirection: 'column' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p style={{ color: 'var(--dim)', fontSize: 13 }}>Loading channel data from PostHog…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !isLoading && (
        <div className="card-mistral" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <AlertCircle size={32} color="#EF4444" style={{ marginBottom: 12 }} />
          <p style={{ color: '#EF4444', fontSize: 14 }}>Failed to load channel data. Check PostHog connection in Settings.</p>
        </div>
      )}

      {/* ── No PostHog ── */}
      {!isLoading && !error && data && !data.postHogConnected && (
        <div className="card-mistral" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(20,184,166,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--accent)' }}>
            <Share2 size={26} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>PostHog Not Connected</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto 20px' }}>
            Add a valid PostHog API key in Settings to pull live acquisition channel data — which platforms are sending you users.
          </p>
          <p style={{ color: 'var(--dim)', fontSize: 12, maxWidth: 420, margin: '0 auto' }}>
            PostHog reads UTM parameters (<code style={{ fontFamily: 'JetBrains Mono, monospace' }}>utm_source</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>utm_medium</code>), ad-network click IDs (<code style={{ fontFamily: 'JetBrains Mono, monospace' }}>li_fat_id</code>, <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>fbclid</code>, etc.), and the referring domain automatically — no extra instrumentation needed.
          </p>
        </div>
      )}

      {/* ── Main content (PostHog connected) ── */}
      {!isLoading && !error && data && data.postHogConnected && (
        <>
          {/* ── Top KPI strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Total Tracked Users</p>
              <p className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(totalUsers)}</p>
            </div>
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Distinct Channels</p>
              <p className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{channels.length}</p>
            </div>
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Top Channel</p>
              {topChannel ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChannelIcon name={topChannel.name} size={20} color={topChannel.color} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{topChannel.name}</p>
                    <p className="mono-metric" style={{ fontSize: 11, color: 'var(--dim)' }}>{topChannel.percentage}% of signups</p>
                  </div>
                </div>
              ) : <p style={{ color: 'var(--dim)', fontSize: 13 }}>—</p>}
            </div>
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Last Synced</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
                {data.lastSynced ? new Date(data.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 2 }}>via PostHog Persons API</p>
            </div>
          </div>

          {/* ── Group Summary Cards ── */}
          {data.groups && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <GroupCard
                label={data.groups.social.label}
                icon={<Share2 size={18} />}
                count={data.groups.social.count}
                percentage={Math.round(data.groups.social.percentage)}
                color="#0A66C2"
                channels={data.groups.social.channels}
              />
              <GroupCard
                label={data.groups.search.label}
                icon={<Search size={18} />}
                count={data.groups.search.count}
                percentage={Math.round(data.groups.search.percentage)}
                color="#4285F4"
                channels={data.groups.search.channels}
              />
              <GroupCard
                label={data.groups.paid.label}
                icon={<Zap size={18} />}
                count={data.groups.paid.count}
                percentage={Math.round(data.groups.paid.percentage)}
                color="#EC4899"
                channels={data.groups.paid.channels}
              />
              <GroupCard
                label={data.groups.direct.label}
                icon={<ArrowUpRight size={18} />}
                count={data.groups.direct.count}
                percentage={Math.round(data.groups.direct.percentage)}
                color="#0D9488"
                channels={data.groups.direct.channels}
              />
            </div>
          )}

          {channels.length === 0 && (
            <div className="card-mistral" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--dim)', fontSize: 13.5 }}>
                No acquisition channel data available yet for this horizon. PostHog is connected but no users with referrer/UTM data have been recorded.
              </p>
            </div>
          )}

          {channels.length > 0 && (
            <>
              {/* ── Bar Chart + Donut side-by-side ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bar chart */}
                <div className="card-mistral" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                        Signups by Channel
                      </h3>
                      <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>User count per acquisition channel, descending</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setSortBy('count')}
                        style={{
                          fontSize: 11, padding: '4px 9px', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer',
                          background: sortBy === 'count' ? 'var(--accent)' : 'transparent',
                          color: sortBy === 'count' ? '#fff' : 'var(--dim)',
                        }}
                      >Count</button>
                      <button
                        onClick={() => setSortBy('alpha')}
                        style={{
                          fontSize: 11, padding: '4px 9px', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer',
                          background: sortBy === 'alpha' ? 'var(--accent)' : 'transparent',
                          color: sortBy === 'alpha' ? '#fff' : 'var(--dim)',
                        }}
                      >A–Z</button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedChannels} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} opacity={0.5} />
                      <XAxis type="number" tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 17) + '…' : v}
                      />
                      <Tooltip
                        contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                        labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                        formatter={(value: number, _: string, entry: any) => [
                          `${formatNumber(value)} users (${entry?.payload?.percentage ?? 0}%)`, 'Signups',
                        ]}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {sortedChannels.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut / pie chart + legend */}
                <div className="card-mistral" style={{ padding: '20px 22px' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    Share of Signups
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 14 }}>Percentage distribution across all channels</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Donut chart */}
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={channels}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {channels.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} stroke="var(--panel)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12 }}
                          formatter={(value: number, name: string) => [`${formatNumber(value)} users`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 240, overflowY: 'auto' }}>
                      {sortedChannels.map(ch => (
                        <DonutLegendItem
                          key={ch.name}
                          name={ch.name}
                          count={ch.count}
                          percentage={ch.percentage}
                          color={ch.color}
                          total={totalUsers}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Detailed channel table ── */}
              <div className="table-wrap">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Share2 size={16} color="var(--accent)" />
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      All Acquisition Channels
                    </h3>
                  </div>
                  <span className="badge badge-teal" style={{ fontSize: 11 }}>
                    {channels.length} channel{channels.length !== 1 ? 's' : ''} detected
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: 520 }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 40 }}>#</th>
                        <th style={{ minWidth: 200 }}>Channel</th>
                        <th style={{ minWidth: 120 }}>Signups</th>
                        <th style={{ minWidth: 140 }}>Share of Total</th>
                        <th style={{ minWidth: 180 }}>Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedChannels.map((ch, idx) => (
                        <tr key={ch.name}>
                          <td>
                            <span className="mono-metric" style={{ color: 'var(--dim)', fontSize: 12 }}>{idx + 1}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: `${ch.color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <ChannelIcon name={ch.name} size={15} color={ch.color} />
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{ch.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="mono-metric" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                              {formatNumber(ch.count)}
                            </span>
                          </td>
                          <td>
                            <span
                              className="badge mono-metric"
                              style={{ background: `${ch.color}20`, color: ch.color, border: `1px solid ${ch.color}40`, fontSize: 12 }}
                            >
                              {ch.percentage}%
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 10, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${ch.percentage}%`,
                                    background: ch.color,
                                    borderRadius: 9999,
                                    transition: 'width 0.6s ease',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── PostHog signals explanation ── */}
              <div className="card-mistral" style={{ padding: '18px 22px' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                  How channels are detected
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>1. UTM Parameters</p>
                    <p><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>?utm_source=linkedin</code> or <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>utm_medium=email</code> appended to your shared links — add these to every link you post on LinkedIn, WhatsApp, etc.</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>2. Ad-Network Click IDs</p>
                    <p>Automatically captured: <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>li_fat_id</code> (LinkedIn Ads), <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>fbclid</code> (Meta), <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>gclid</code> (Google) — no extra setup needed.</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>3. Referring Domain</p>
                    <p>PostHog reads <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>$initial_referring_domain</code> on every person — organic shares from LinkedIn, WhatsApp web, Reddit, etc. show up automatically even without UTMs.</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>4. Signup Source Property</p>
                    <p>If your app explicitly sets <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>signup_source</code> on <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>posthog.identify()</code> during registration, that takes priority over automatic signals.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
