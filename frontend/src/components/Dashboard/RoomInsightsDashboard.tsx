import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Sparkles, ArrowUpRight,
  ArrowDownRight, Trophy, Download,
  Palette, LayoutTemplate, Clock,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { RoomsDashboardResponse } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TIME_SLOTS = [
  '9 - 11 AM', '11 - 1 PM', '2 - 4 PM', '4 - 6 PM',
  '6 - 8 PM', '8 - 10 PM', '10 - 12 AM',
] as const;

const HEATMAP_BG: Record<number, string> = {
  1: 'rgba(20, 184, 166, 0.45)',
  2: 'rgba(20, 184, 166, 0.75)',
  3: 'rgba(13, 148, 136, 0.9)',
  4: '#0F766E',
};

const THEME_PALETTE: Record<string, string> = {
  'midnight': '#1E1B4B',
  'emerald': '#059669',
  'sunset': '#EA580C',
  'ocean': '#0284C7',
  'slate': '#475569',
  'nordic': '#0D9488',
  'cyberpunk': '#D946EF',
  'minimalist': '#71717A',
  'monochrome': '#18181B',
  'amethyst': '#9333EA',
  'rose gold': '#F43F5E',
  'corporate': '#2563EB',
  'sandstone': '#D97706',
};

const CURATED_THEMES = [
  { name: 'Midnight', key: 'midnight', color: '#1E1B4B' },
  { name: 'Emerald', key: 'emerald', color: '#059669' },
  { name: 'Sunset', key: 'sunset', color: '#EA580C' },
  { name: 'Ocean', key: 'ocean', color: '#0284C7' },
  { name: 'Slate', key: 'slate', color: '#475569' },
  { name: 'Nordic', key: 'nordic', color: '#0D9488' },
  { name: 'Cyberpunk', key: 'cyberpunk', color: '#D946EF' },
  { name: 'Minimalist', key: 'minimalist', color: '#71717A' },
  { name: 'Monochrome', key: 'monochrome', color: '#18181B' },
  { name: 'Amethyst', key: 'amethyst', color: '#9333EA' },
  { name: 'Rose Gold', key: 'rose gold', color: '#F43F5E' },
  { name: 'Corporate', key: 'corporate', color: '#2563EB' },
  { name: 'Sandstone', key: 'sandstone', color: '#D97706' },
];

export const RoomInsightsDashboard: React.FC = () => {
  const rbac = useRbac();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<RoomsDashboardResponse>({
    queryKey: ['roomsDashboard', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getRoomsDashboard(dateRange.preset) as Promise<RoomsDashboardResponse>,
  });

  const templateBreakdown = useMemo(() => {
    if (!data?.topPerformingRooms?.length) return [];
    const counts = new Map<string, number>();
    for (const r of data.topPerformingRooms) {
      const tmpl = r.template || 'Custom Portfolio';
      counts.set(tmpl, (counts.get(tmpl) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / data.topPerformingRooms.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [data?.topPerformingRooms]);

  const activeThemeCounts = useMemo(() => {
    if (!data?.topPerformingRooms?.length) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const r of data.topPerformingRooms) {
      if (r.theme) {
        const key = r.theme.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return counts;
  }, [data?.topPerformingRooms]);

  const handleExportCsv = () => {
    if (!data?.topPerformingRooms?.length) return;
    exportToCsv({
      filename: `talentbridge_top_showcase_rooms_${dateRange.preset}`,
      columns: [
        { header: 'Room ID', accessor: row => row.roomId },
        { header: 'Room Name', accessor: row => row.roomName },
        { header: 'Creator Name', accessor: row => row.ownerName },
        { header: 'Creator Email', accessor: row => row.ownerEmail },
        { header: 'Template', accessor: row => row.template || 'Custom Portfolio' },
        { header: 'Theme Preset', accessor: row => row.theme || 'Pending Save' },
        { header: 'Block Count', accessor: row => row.blockCount ?? 'N/A' },
        { header: 'Customization Depth', accessor: row => (row.customizationDepth !== null && row.customizationDepth !== undefined ? `${row.customizationDepth}%` : 'N/A') },
        { header: 'Status', accessor: row => (row.isPublished ? 'Published' : 'Draft') },
        { header: 'Published At', accessor: row => row.publishedAt || '' },
        { header: 'Total Views', accessor: row => row.views },
        { header: 'Unique Views', accessor: row => row.uniqueViews },
        { header: 'Engagement Score (%)', accessor: row => `${row.engagement}%` },
      ],
      data: data.topPerformingRooms,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Showcase Room Intelligence
            </h2>
            <span className="badge badge-sunset" style={{ gap: 4 }}>
              <Sparkles size={11} /> 3D Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Platform-wide viewer telemetry, dwell-time heatmaps, traffic sources, and 3D portfolio engagement.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="rooms-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!data?.topPerformingRooms?.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Top Showcase Rooms to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Engagement Alert Banner */}
      {data && (
        <MetricAlertBanner
          severity="info"
          title="High Mobile Room Viewership Surge"
          metricLabel="Mobile Traffic Share"
          metricValue={`${(data.devices || []).find(d => (d.name || '').toLowerCase().includes('mobile'))?.percentage || 45}%`}
          message="Mobile viewers represent nearly half of all 3D showcase sessions. Optimization for mobile WebGL rendering remains high priority."
        />
      )}

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load room insights data.</div>}

      {data && (!data.summary || data.summary.totalRooms === 0) ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(250, 82, 15, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--sunset)' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Showcase Rooms Published Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            As creators build and publish 3D showcase portfolios on TalentBridge, real-time viewer dwell times, engagement heatmaps, and device analytics will appear here.
          </p>
        </div>
      ) : data && data.summary && (
        <>
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Total Rooms</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalRooms)}</p>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>{data.summary.publishedRooms || 0} Published</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Total Views</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalViews?.count)}</p>
              <span className="badge badge-success" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowUpRight size={10} /> +{data.summary.totalViews?.change || 0}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Unique Views</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.uniqueViews?.count)}</p>
              <span className="badge badge-error" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowDownRight size={10} /> {data.summary.uniqueViews?.change || 0}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Avg Time Spent</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.avgTimeSpent?.value || '—'}</p>
              <span className="badge badge-neutral" style={{ fontSize: 10, marginTop: 4 }}>
                {data.summary.avgTimeSpent?.change || '—'}
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Avg Engagement</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.engagementQuality?.percentage || 0}%</p>
              <span className="badge badge-sunset" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowUpRight size={10} /> +{data.summary.engagementQuality?.change || 0}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Publish Rate</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
                {data.summary.totalRooms ? Math.round(((data.summary.publishedRooms || 0) / data.summary.totalRooms) * 100) : 0}%
              </p>
              <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Rooms live</p>
            </div>
          </div>

          {/* Views Trend Chart */}
          <div className="card-mistral">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Showcase Views Trajectory
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Platform-wide views volume across all published rooms</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
                  <span style={{ color: 'var(--text-2)' }}>Total Views (k)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
                  <span style={{ color: 'var(--text-2)' }}>Unique Views (k)</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.viewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="platformTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="platformUniqueGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="totalViews" stroke="#FA520F" strokeWidth={2.6} fillOpacity={1} fill="url(#platformTotalGrad)" name="Total Views (k)" />
                <Area type="monotone" dataKey="uniqueViews" stroke="#0D9488" strokeWidth={2.6} fillOpacity={1} fill="url(#platformUniqueGrad)" name="Unique Views (k)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Traffic source */}
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Global Traffic Sources
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>How recruiters and viewers discover candidate rooms</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(data.trafficSources || []).map(s => (
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
                Global Device Breakdown
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Operating systems and form-factors used by viewers</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(data.devices || []).map(d => (
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
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Showcase Architecture & Curated Theme Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Active Templates Breakdown */}
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayoutTemplate size={16} color="var(--accent)" />
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    Showcase Template Distribution
                  </h3>
                </div>
                <span className="badge badge-teal" style={{ fontSize: 10.5 }}>
                  {data.topPerformingRooms?.length || 0} Portfolios
                </span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>
                Industry templates active across published and draft creator rooms
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {templateBreakdown.slice(0, 6).map(tmpl => (
                  <div key={tmpl.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{tmpl.name}</span>
                      <span className="mono-metric" style={{ color: 'var(--text-2)', fontSize: 12 }}>
                        {tmpl.count} room{tmpl.count === 1 ? '' : 's'} ({tmpl.percentage}%)
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(6, tmpl.percentage)}%`,
                          background: tmpl.name.includes('Eng') ? '#3B82F6' : tmpl.name.includes('Cyber') ? '#D946EF' : tmpl.name.includes('IAM') ? '#0D9488' : tmpl.name.includes('Design') ? '#FA520F' : '#14B8A6',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 13 Curated Theme Adoption Registry */}
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Palette size={16} color="#8B5CF6" />
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    13 Curated Theme Presets
                  </h3>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: 10.5, gap: 4 }}>
                  <Clock size={10} /> Syncing
                </span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 14 }}>
                Aesthetic theme system telemetry status across showcase portfolios
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {CURATED_THEMES.map(t => {
                  const count = activeThemeCounts.get(t.key) || 0;
                  return (
                    <div
                      key={t.key}
                      style={{
                        padding: '7px 10px',
                        background: 'var(--panel-2)',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: `0 0 6px ${t.color}55` }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.name}
                        </span>
                      </div>
                      {count > 0 ? (
                        <span className="badge badge-teal mono-metric" style={{ fontSize: 10, padding: '1px 5px' }}>
                          {count}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9.5, color: 'var(--dim)', whiteSpace: 'nowrap' }}>
                          Ready
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Performing Showcase Rooms Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={16} color="var(--accent)" />
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                  Top Performing Showcase Rooms
                </h3>
              </div>
              <span className="badge badge-sunset" style={{ fontSize: 11 }}>Leaderboard</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 880 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Room Name</th>
                    <th style={{ minWidth: 160 }}>Creator</th>
                    <th style={{ minWidth: 140 }}>Template</th>
                    <th style={{ minWidth: 120 }}>Theme Preset</th>
                    <th style={{ minWidth: 110 }}>Composition</th>
                    <th style={{ minWidth: 80 }}>Status</th>
                    <th style={{ minWidth: 90 }}>Views</th>
                    <th style={{ minWidth: 90 }}>Unique</th>
                    <th style={{ minWidth: 110 }}>Engagement</th>
                    <th style={{ textAlign: 'right', minWidth: 110 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.topPerformingRooms || []).map(room => (
                    <tr key={room.roomId}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{room.roomName}</span>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {room.ownerName}
                            {room.ownerIdConfirmed === false && (
                              <span className="badge badge-neutral" style={{ fontSize: 9, padding: '1px 6px' }} title="Matched by first-visitor activity, not a confirmed owner ID">
                                inferred
                              </span>
                            )}
                          </p>
                          <p className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{room.ownerEmail}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-teal" style={{ fontSize: 11, fontWeight: 600 }}>
                          {room.template || 'Custom Portfolio'}
                        </span>
                      </td>
                      <td>
                        {room.theme ? (
                          <span className="badge" style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: THEME_PALETTE[room.theme.toLowerCase()] || '#FA520F' }} />
                            {room.theme}
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: 10, opacity: 0.7 }} title="Waiting for room_saved event with creator's theme choice">
                            Pending Save
                          </span>
                        )}
                      </td>
                      <td>
                        {room.blockCount ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span className="mono-metric" style={{ fontSize: 12, fontWeight: 600 }}>
                              {room.blockCount} blocks
                            </span>
                            {room.customizationDepth !== null && room.customizationDepth !== undefined && (
                              <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
                                {room.customizationDepth}% depth
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {room.isPublished ? (
                          <span className="badge badge-success" style={{ fontSize: 10.5 }} title={room.publishedAt ? `room_published recorded ${new Date(room.publishedAt).toLocaleDateString()}` : undefined}>
                            Published
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: 10.5 }} title="No room_published event recorded yet for this room">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(room.views)}</td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(room.uniqueViews)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-teal mono-metric">{room.engagement}% quality</span>
                          {!!room.rageClicks && (
                            <span className="badge badge-error mono-metric" title="Repeated clicks on something unresponsive — a friction signal, not counted toward engagement">
                              {room.rageClicks} rage click{room.rageClicks === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/lookup?userId=${encodeURIComponent(room.ownerDistinctId || room.ownerEmail)}`)}
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11.5, gap: 5 }}
                          title={room.ownerIdConfirmed ? `Open ${room.ownerName}'s profile` : 'Owner identity is inferred from room activity, not confirmed'}
                        >
                          Inspect User <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Peak Engagement Heatmap */}
          <div className="card-mistral" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Platform Engagement Heatmap
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Aggregate view frequency across 24-hour cycles and weekdays</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--dim)' }}>Low</span>
                {[1, 2, 3, 4].map(lvl => (
                  <div key={lvl} style={{ width: 14, height: 14, borderRadius: 3, background: HEATMAP_BG[lvl] }} />
                ))}
                <span style={{ color: 'var(--dim)' }}>High</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 640 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                  <div />
                  {DAYS.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--text-2)', padding: '4px 0' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map(slot => (
                  <div key={slot} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dim)', display: 'flex', alignItems: 'center' }}>
                      {slot}
                    </div>
                    {DAYS.map(day => {
                      const cell = (data.heatmap || []).find(h => h.day === day && h.timeSlot === slot);
                      const intensity = cell ? cell.intensity : 1;
                      const val = cell ? (cell.views > 1000 ? `${(cell.views / 1000).toFixed(1)}k` : `${cell.views}`) : '1.8k';

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
        </>
      )}
    </div>
  );
};
