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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TIME_SLOTS = [
  '9 - 11 AM', '11 - 1 PM', '2 - 4 PM', '4 - 6 PM',
  '6 - 8 PM', '8 - 10 PM', '10 - 12 AM',
] as const;

// Heatmap colors based on intensity
const HEATMAP_BG: Record<number, string> = {
  1: '#2DD4BF', // Low
  2: '#0D9488', // Med-low
  3: '#0F766E', // Med-high
  4: '#134E4A', // High
};

export const RoomInsightsDetailView: React.FC<{
  room: RoomInsight;
  onEdit?: () => void;
}> = ({ room, onEdit }) => {
  const [viewerSearch, setViewerSearch] = useState('');
  const [viewerFilter, setViewerFilter] = useState<'all' | 'returning' | 'new' | 'high_value'>('all');
  const [locationMetric, setLocationMetric] = useState<'unique' | 'clicks' | 'views' | 'engagement' | 'ctr'>('unique');
  const [page, setPage] = useState(1);

  // Filter viewers
  const filteredViewers = room.viewers.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(viewerSearch.toLowerCase()) ||
      v.role.toLowerCase().includes(viewerSearch.toLowerCase()) ||
      v.company.toLowerCase().includes(viewerSearch.toLowerCase()) ||
      v.location.toLowerCase().includes(viewerSearch.toLowerCase());
    const matchesStatus =
      viewerFilter === 'all' || v.status === viewerFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              Insights for <span style={{ color: 'var(--accent)' }}>{room.roomName}</span>
            </h2>
            {room.isPublished ? (
              <span className="badge badge-success" style={{ gap: 4 }}>
                <CheckCircle2 size={11} /> Published
              </span>
            ) : (
              <span className="badge badge-neutral">Draft</span>
            )}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
            Understand how your room is viewed and improve engagement
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {room.publishedUrl && (
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
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Total views</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{room.totalViews.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(room.totalViews.count)}
          </p>
        </div>

        {/* Unique views */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Unique views</span>
            <span className="badge badge-error" style={{ gap: 2, fontSize: 11 }}>
              <ArrowDownRight size={11} /> {room.uniqueViews.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(room.uniqueViews.count)}
          </p>
        </div>

        {/* Avg Time Spent */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Avg Time Spent</span>
            <span className="badge badge-info" style={{ fontSize: 11 }}>
              {room.avgTimeSpent.change}
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {room.avgTimeSpent.value}
          </p>
        </div>

        {/* Engagement Quality */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Engagement Quality</span>
            <span className="badge badge-warning" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{room.engagementQuality.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {room.engagementQuality.percentage}%
          </p>
        </div>
      </div>

      {/* ── Views Trend Area Chart ────────────────────────────── */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Views Trend
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>How your views are growing</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FB923C' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2DD4BF' }} />
              <span style={{ color: 'var(--text-2)' }}>Unique Views</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={room.viewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="totalViewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="uniqueViewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
              labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
            />
            <Area type="monotone" dataKey="totalViews" stroke="#FB923C" strokeWidth={2.5} fillOpacity={1} fill="url(#totalViewsGrad)" name="Total Views" />
            <Area type="monotone" dataKey="uniqueViews" stroke="#2DD4BF" strokeWidth={2.5} fillOpacity={1} fill="url(#uniqueViewsGrad)" name="Unique Views" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Traffic Source & Devices ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic source */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Traffic source
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>How people find your room</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {room.trafficSources.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.count}</span>
                </div>
                <div style={{ height: 18, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      background: 'linear-gradient(90deg, #E9D5FF, #DDD6FE)',
                      borderRadius: 3,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Devices
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>How your room is being viewed</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {room.devices.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{d.count}</span>
                </div>
                <div style={{ height: 18, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${d.percentage}%`,
                      background: 'linear-gradient(90deg, #BAE6FD, #7DD3FC)',
                      borderRadius: 3,
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
              Who's viewing
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Who's checking out your work</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input
                type="text"
                placeholder="Search viewers…"
                value={viewerSearch}
                onChange={e => setViewerSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 32, fontSize: 13, height: 34 }}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--panel-2)', padding: 3, borderRadius: 8, border: '1px solid var(--line)' }}>
              {[
                { key: 'all', label: 'All', count: room.viewers.length },
                { key: 'returning', label: 'Returning' },
                { key: 'new', label: 'New' },
                { key: 'high_value', label: 'High Value' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setViewerFilter(tab.key as typeof viewerFilter)}
                  style={{
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: 'none',
                    background: viewerFilter === tab.key ? 'var(--panel)' : 'transparent',
                    color: viewerFilter === tab.key ? 'var(--text)' : 'var(--text-2)',
                    boxShadow: viewerFilter === tab.key ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span style={{ fontSize: 10, background: 'var(--ink)', color: '#2DD4BF', padding: '1px 5px', borderRadius: 99 }}>
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
          <table>
          <thead>
            <tr>
              <th>Viewer</th>
              <th>Role/Company</th>
              <th>Location</th>
              <th>Time spent</th>
              <th>Views</th>
              <th>Status</th>
              <th>Last visit</th>
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
                        width: 32, height: 32, borderRadius: '50%',
                        background: v.avatarBg || 'var(--ink)',
                        color: '#2DD4BF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, fontFamily: 'Sora',
                      }}>
                        {v.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v.name}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{v.role}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{v.company}</p>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{v.location}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{v.timeSpent}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{v.views}</td>
                  <td>
                    <span className={`badge ${
                      v.status === 'high_value'
                        ? 'badge-success'
                        : v.status === 'new'
                        ? 'badge-info'
                        : 'badge-neutral'
                    }`}>
                      {v.status === 'high_value' ? 'high value' : v.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--faint)', fontSize: 12 }}>{v.lastVisit}</td>
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
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{page}</span>
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
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Engagement Heatmap
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>See when your room gets the most views throughout the day</p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span>Low</span>
            {[1, 2, 3, 4].map(lvl => (
              <div key={lvl} style={{ width: 14, height: 14, borderRadius: 3, background: HEATMAP_BG[lvl] }} />
            ))}
            <span>High</span>
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
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', display: 'flex', alignItems: 'center' }}>
                  {slot}
                </div>
                {DAYS.map(day => {
                  const cell = room.heatmap.find(h => h.day === day && h.timeSlot === slot);
                  const intensity = cell ? cell.intensity : 1;
                  const val = cell ? (cell.views > 1000 ? `${(cell.views / 1000).toFixed(1)}k` : `${cell.views}`) : '100';

                  return (
                    <div
                      key={day + slot}
                      style={{
                        height: 38,
                        borderRadius: 6,
                        background: HEATMAP_BG[intensity],
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'transform 0.12s',
                        cursor: 'default',
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
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Traffic by Location
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Where your audience is located</p>
          </div>

          {/* Metric tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--panel-2)', padding: 3, borderRadius: 8, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
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
                style={{
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  background: locationMetric === tab.key ? 'var(--panel)' : 'transparent',
                  color: locationMetric === tab.key ? 'var(--text)' : 'var(--text-2)',
                  boxShadow: locationMetric === tab.key ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                }}
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
            borderRadius: 12,
            border: '1px dashed var(--line-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 20,
          }}>
            <Globe size={48} color="var(--accent)" strokeWidth={1.5} style={{ opacity: 0.8 }} />
            <p style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center' }}>
              Global geographic distribution active across <strong style={{ color: 'var(--accent)' }}>6 countries</strong>
            </p>
          </div>

          {/* Top countries list */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Top 6 Countries
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {room.geoTraffic.map(g => (
                <div key={g.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{g.flag}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.country}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                      {g.views > 1000 ? `${(g.views / 1000).toFixed(1)}k` : g.views}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${g.percentage}%`,
                        background: 'var(--ink)',
                        borderRadius: 99,
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
            Smart Recommendations
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Personalized suggestions to improve your room's performance</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {room.recommendations.map(rec => (
            <div
              key={rec.id}
              className="card"
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
                    ? '#F59E0B'
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
                      ? 'badge-warning'
                      : 'badge-info'
                  }`} style={{ fontSize: 10 }}>
                    {rec.priority}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {rec.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent2)', fontSize: 12 }}>
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
