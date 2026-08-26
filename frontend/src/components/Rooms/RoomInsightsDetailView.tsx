import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Edit3, Search, Download, ExternalLink, Sparkles,
  Image as ImageIcon, MessageSquare, Share2, Globe,
  ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { RoomInsight } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TIME_SLOTS = [
  '9 - 11 AM', '11 - 1 PM', '2 - 4 PM', '4 - 6 PM',
  '6 - 8 PM', '8 - 10 PM', '10 - 12 AM',
] as const;

// Heatmap colors based on intensity
const HEATMAP_BG: Record<number, string> = {
  1: 'rgba(20, 184, 166, 0.45)',
  2: 'rgba(20, 184, 166, 0.75)',
  3: 'rgba(13, 148, 136, 0.9)',
  4: '#0F766E',
};

export const RoomInsightsDetailView: React.FC<{
  room: RoomInsight;
  onEdit?: () => void;
}> = ({ room, onEdit }) => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [viewerSearch, setViewerSearch] = useState('');
  const [viewerFilter, setViewerFilter] = useState<'all' | 'returning' | 'new' | 'high_value'>('all');
  const [locationMetric, setLocationMetric] = useState<'unique' | 'clicks' | 'views' | 'engagement' | 'ctr'>('unique');
  const [page, setPage] = useState(1);

  // Normalize summary metrics with safe fallbacks
  const anyRoom = (room || {}) as any;
  const totalViews = room?.totalViews || anyRoom?.summary?.totalViews || { count: 0, change: 0 };
  const uniqueViews = room?.uniqueViews || anyRoom?.summary?.uniqueViews || { count: 0, change: 0 };
  const avgTimeSpent = room?.avgTimeSpent || anyRoom?.summary?.avgTimeSpent || { value: '—', change: '—' };
  const engagementQuality = room?.engagementQuality || anyRoom?.summary?.engagementQuality || { percentage: 0, change: 0 };

  // Normalize viewers
  const rawViewers = room?.viewers || anyRoom?.recentLeads || [];
  const viewers = rawViewers.map((v: any) => ({
    id: v.id || `v_${Math.random()}`,
    name: v.name || 'Anonymous Viewer',
    role: v.role || 'Visitor',
    company: v.company || 'Enterprise',
    location: v.location || 'Unknown',
    timeSpent: v.timeSpent || '1m',
    views: v.views || 1,
    status: v.status || 'new',
    lastVisit: v.lastVisit || 'Recently',
    avatarBg: v.avatarBg || 'var(--panel-2)',
  }));

  const filteredViewers = viewers.filter((v: any) => {
    const matchesSearch =
      (v.name || '').toLowerCase().includes(viewerSearch.toLowerCase()) ||
      (v.role || '').toLowerCase().includes(viewerSearch.toLowerCase()) ||
      (v.company || '').toLowerCase().includes(viewerSearch.toLowerCase()) ||
      (v.location || '').toLowerCase().includes(viewerSearch.toLowerCase());
    const matchesStatus =
      viewerFilter === 'all' || v.status === viewerFilter;
    return matchesSearch && matchesStatus;
  });

  const viewsTrend = (room?.viewsTrend || []).map((v: any) => ({
    month: v.month,
    totalViews: v.totalViews ?? ((v.desktop || 0) + (v.mobile || 0) + (v.tablet || 0)),
    uniqueViews: v.uniqueViews ?? (v.desktop || 0),
  }));

  const trafficSources = room?.trafficSources || [];
  const devices = room?.devices || [];
  const heatmap = room?.heatmap || [];
  const geoTraffic = room?.geoTraffic || [];
  const recommendations = room?.recommendations || anyRoom?.smartRecommendations?.map((r: any) => ({
    id: r.id || `rec_${Math.random()}`,
    title: r.title || 'Optimization Suggestion',
    description: r.description || '',
    priority: r.priority || (r.impact === 'high' ? 'Urgent' : 'Medium'),
    actionText: r.actionText || 'Optimize Now',
    iconType: r.iconType || 'sparkles',
  })) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="card-mistral" style={{
        padding: '22px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Insights for <span style={{ color: 'var(--accent)' }}>{room?.roomName || 'Showcase Room'}</span>
            </h2>
            {room?.isPublished ? (
              <span className="badge badge-success" style={{ gap: 4 }}>
                <CheckCircle2 size={11} /> Published
              </span>
            ) : (
              <span className="badge badge-neutral">Draft</span>
            )}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Detailed creator analytics, dwell-time metrics, recruiter visits, and engagement heatmaps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix={`room-${room?.roomId || 'default'}-date`}
          />
          {room?.publishedUrl && (
            <a
              href={room.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ gap: 6, fontSize: 13 }}
            >
              <ExternalLink size={14} />
              Open Live Room
            </a>
          )}
          <button
            onClick={onEdit}
            className="btn btn-ghost"
            style={{ gap: 6, fontSize: 13 }}
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
      </div>

      {/* ── 4 Top KPI Metric Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total views */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Total views</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{totalViews?.change ?? 0}%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(totalViews?.count ?? 0)}
          </p>
        </div>

        {/* Unique views */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Unique views</span>
            <span className={`badge ${(uniqueViews?.change ?? 0) >= 0 ? 'badge-teal' : 'badge-error'}`} style={{ gap: 2, fontSize: 11 }}>
              {(uniqueViews?.change ?? 0) >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {(uniqueViews?.change ?? 0) >= 0 ? `+${uniqueViews?.change ?? 0}%` : `${uniqueViews?.change ?? 0}%`}
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(uniqueViews?.count ?? 0)}
          </p>
        </div>

        {/* Avg Time Spent */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Avg Time Spent</span>
            <span className="badge badge-neutral mono-metric" style={{ fontSize: 11 }}>
              {avgTimeSpent?.change ?? '—'}
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {avgTimeSpent?.value ?? '—'}
          </p>
        </div>

        {/* Engagement Quality */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Engagement Quality</span>
            <span className="badge badge-sunset" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{engagementQuality?.change ?? 0}%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {engagementQuality?.percentage ?? 0}%
          </p>
        </div>
      </div>

      {/* ── Views Trend Area Chart ────────────────────────────── */}
      <div className="card-mistral">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Views Trajectory
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Historical growth and audience expansion over time</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
              <span style={{ color: 'var(--text-2)' }}>Unique Views</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={viewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="totalViewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="uniqueViewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
              labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
            />
            <Area type="monotone" dataKey="totalViews" stroke="#FA520F" strokeWidth={2.5} fillOpacity={1} fill="url(#totalViewsGrad)" name="Total Views" />
            <Area type="monotone" dataKey="uniqueViews" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#uniqueViewsGrad)" name="Unique Views" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Traffic Source & Devices ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic source */}
        <div className="card-mistral" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Traffic Sources
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>How people discover this showcase room</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {trafficSources.map((s: any) => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                  <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{s.count}</span>
                </div>
                <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      background: 'linear-gradient(90deg, #14B8A6, #FA520F)',
                      borderRadius: 9999,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="card-mistral" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Viewer Devices
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Form-factors and browsers used to render room</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {devices.map((d: any) => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{d.name}</span>
                  <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{d.count}</span>
                </div>
                <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${d.percentage}%`,
                      background: 'linear-gradient(90deg, #3B82F6, #14B8A6)',
                      borderRadius: 9999,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Who's Viewing (Viewer Intelligence Table) ─────────── */}
      <div className="table-wrap">
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Viewer Intelligence
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Recruiter and visitor session logs</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input
                type="text"
                placeholder="Search viewers…"
                value={viewerSearch}
                onChange={e => setViewerSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 32, fontSize: 13, height: 34, width: '100%' }}
              />
            </div>

            {/* Filter pills */}
            <div className="pill-group no-scrollbar touch-scroll" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {[
                { key: 'all', label: 'All', count: viewers.length },
                { key: 'returning', label: 'Returning' },
                { key: 'new', label: 'New' },
                { key: 'high_value', label: 'High Value' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setViewerFilter(tab.key as typeof viewerFilter)}
                  className={`pill-tab ${viewerFilter === tab.key ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 9999, background: viewerFilter === tab.key ? 'var(--panel-2)' : 'var(--line)', fontWeight: 700 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Download */}
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, gap: 5 }}>
              <Download size={13} />
              Download
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 780 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Viewer</th>
                <th style={{ minWidth: 160 }}>Role / Company</th>
                <th style={{ minWidth: 120 }}>Location</th>
                <th style={{ minWidth: 100 }}>Time Spent</th>
                <th style={{ minWidth: 80 }}>Views</th>
                <th style={{ minWidth: 110 }}>Status</th>
                <th style={{ minWidth: 110 }}>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filteredViewers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                    No viewers found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredViewers.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: v.avatarBg || 'var(--panel-2)',
                          color: 'var(--accent)',
                          border: '1px solid var(--line)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, fontFamily: 'Sora',
                        }}>
                          {(v.name || 'Viewer')
                            .split(' ')
                            .map((n: string) => n[0] || '')
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{v.role}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{v.company}</p>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{v.location}</td>
                    <td className="mono-metric" style={{ fontSize: 13 }}>{v.timeSpent}</td>
                    <td className="mono-metric" style={{ fontSize: 13 }}>{v.views}</td>
                    <td>
                      <span className={`badge ${
                        v.status === 'high_value'
                          ? 'badge-sunset'
                          : v.status === 'new'
                          ? 'badge-teal'
                          : 'badge-neutral'
                      }`}>
                        {v.status === 'high_value' ? 'high value' : v.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--dim)', fontSize: 12 }}>{v.lastVisit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: 'var(--text-2)',
        }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <span className="mono-metric" style={{ fontWeight: 700, color: 'var(--text)' }}>{page}</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
            onClick={() => setPage(p => p + 1)}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Engagement Heatmap ─────────────────────────────────── */}
      <div className="card-mistral" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Dwell Time Heatmap
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Peak viewing hours across the week for this showcase room</p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ color: 'var(--dim)' }}>Low</span>
            {[1, 2, 3, 4].map(lvl => (
              <div key={lvl} style={{ width: 14, height: 14, borderRadius: 3, background: HEATMAP_BG[lvl] }} />
            ))}
            <span style={{ color: 'var(--dim)' }}>High</span>
          </div>
        </div>

        {/* Matrix */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {/* Header row: Days */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
              <div />
              {DAYS.map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--text-2)', padding: '4px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Rows: Time Slots */}
            {TIME_SLOTS.map(slot => (
              <div key={slot} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dim)', display: 'flex', alignItems: 'center' }}>
                  {slot}
                </div>
                {DAYS.map(day => {
                  const cell = (heatmap || []).find((h: any) => h.day === day && h.timeSlot === slot);
                  const intensity = cell ? cell.intensity : 1;
                  const val = cell ? (cell.views > 1000 ? `${(cell.views / 1000).toFixed(1)}k` : `${cell.views}`) : '100';

                  return (
                    <div
                      key={day + slot}
                      style={{
                        height: 38,
                        borderRadius: 8,
                        background: HEATMAP_BG[intensity],
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11.5,
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                      }}
                      title={`${day} ${slot}: ${cell ? cell.views : 100} views`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Traffic by Location ───────────────────────────────── */}
      <div className="card-mistral" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Geographic Traffic
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Where viewers and hiring teams are accessing your room</p>
          </div>

          {/* Metric tabs */}
          <div className="segmented-control no-scrollbar touch-scroll" style={{ overflowX: 'auto', maxWidth: '100%', whiteSpace: 'nowrap' }}>
            {[
              { key: 'unique', label: 'By unique views' },
              { key: 'clicks', label: 'By clicks' },
              { key: 'views', label: 'By views' },
              { key: 'engagement', label: 'By engagement' },
              { key: 'ctr', label: 'By Clickthrough rate' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setLocationMetric(tab.key as typeof locationMetric)}
                className={`segmented-item ${locationMetric === tab.key ? 'active' : ''}`}
                style={{ fontSize: 11.5, padding: '4px 10px', flexShrink: 0 }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-center">
          {/* Stylized world graphic container */}
          <div style={{
            height: 220,
            background: 'var(--panel-2)',
            borderRadius: 14,
            border: '1px dashed var(--line)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 20,
          }}>
            <Globe size={48} color="var(--accent)" strokeWidth={1.5} style={{ opacity: 0.85 }} />
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', textAlign: 'center' }}>
              Global geographic distribution active across <strong style={{ color: 'var(--accent)' }}>6 countries</strong>
            </p>
          </div>

          {/* Top countries list */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, fontFamily: 'Sora, sans-serif' }}>
              Top 6 Countries
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {geoTraffic.map((g: any) => (
                <div key={g.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{g.flag}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.country}</span>
                    </div>
                    <span className="mono-metric" style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {g.views > 1000 ? `${(g.views / 1000).toFixed(1)}k` : g.views}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${g.percentage}%`,
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
      </div>

      {/* ── Smart Recommendations ─────────────────────────────── */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Smart Optimization Suggestions
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Personalized tips to boost showcase dwell time &amp; recruiter conversion</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {recommendations.map((rec: any) => (
            <div
              key={rec.id}
              className="card-mistral"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                borderLeft: `4px solid ${
                  rec.priority === 'Urgent'
                    ? '#EF4444'
                    : rec.priority === 'Medium'
                    ? 'var(--sunset)'
                    : '#3B82F6'
                }`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {rec.title}
                  </h4>
                  <span className={`badge ${
                    rec.priority === 'Urgent'
                      ? 'badge-error'
                      : rec.priority === 'Medium'
                      ? 'badge-sunset'
                      : 'badge-info'
                  }`} style={{ fontSize: 10 }}>
                    {rec.priority}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {rec.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent)', fontSize: 12 }}>
                  {rec.iconType === 'sparkles' && <Sparkles size={13} />}
                  {rec.iconType === 'image' && <ImageIcon size={13} />}
                  {rec.iconType === 'message' && <MessageSquare size={13} />}
                  {rec.iconType === 'share' && <Share2 size={13} />}
                  <span style={{ fontWeight: 600 }}>Action item</span>
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 12, gap: 4, color: 'var(--text)' }}
                >
                  {rec.actionText} <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
