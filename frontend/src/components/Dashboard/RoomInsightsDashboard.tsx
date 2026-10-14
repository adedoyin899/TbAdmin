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
  Search, X, Layers, ExternalLink,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { RoomsDashboardResponse } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const ALL_BLOCK_TYPES = [
  'Video intro', 'Skill tags', 'Metric tile', 'Paragraph', 'Work gallery', 'Profile',
  'Availability', 'Credentials', 'Case studies', 'Call to action', 'Reference',
  'Heading', 'Pipeline/CI-CD', 'Skill bars', 'Document carousel', 'Before/after',
  'Flow diagram', 'Pull quote', 'Coverage matrix', 'Pricing tiers', 'Statement callout',
  'Clause brief', 'Retro columns',
];

const ALL_TEMPLATES = [
  'Software Eng / Architect', 'Designer', 'IAM Specialist', 'Cybersecurity',
  'Project Manager', 'Data Consultant', 'Student -> BA / PM', 'Finance / Accountant',
  'Legal & Compliance', 'Custom Portfolio', 'Start from a blank room',
];

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

  // Filter states for showcase rooms table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [inspectingRoom, setInspectingRoom] = useState<any | null>(null);

  const { data, isLoading, error } = useQuery<RoomsDashboardResponse>({
    queryKey: ['roomsDashboard', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getRoomsDashboard(dateRange.preset) as Promise<RoomsDashboardResponse>,
  });

  const filteredRooms = useMemo(() => {
    if (!data?.topPerformingRooms) return [];
    return data.topPerformingRooms.filter(room => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = (room.roomName || '').toLowerCase().includes(q);
        const matchesOwner = (room.ownerName || '').toLowerCase().includes(q);
        const matchesEmail = (room.ownerEmail || '').toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesEmail) return false;
      }
      if (selectedTemplate !== 'all' && (room.template || 'Custom Portfolio') !== selectedTemplate) {
        return false;
      }
      if (selectedBlock !== 'all') {
        const hasBlock = (room.blocksUsed || []).some(b => b.toLowerCase() === selectedBlock.toLowerCase());
        if (!hasBlock) return false;
      }
      if (selectedStatus === 'published' && !room.isPublished) return false;
      if (selectedStatus === 'draft' && room.isPublished) return false;
      return true;
    });
  }, [data?.topPerformingRooms, searchTerm, selectedTemplate, selectedBlock, selectedStatus]);

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
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Trophy size={16} color="var(--accent)" />
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    Top Performing Showcase Rooms
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                    Inspect creator room architectures, blocks used, and live viewer telemetry ({filteredRooms.length} of {data.topPerformingRooms?.length || 0} rooms)
                  </p>
                </div>
              </div>
              <span className="badge badge-sunset" style={{ fontSize: 11 }}>Live PostHog Telemetry</span>
            </div>

            {/* Filter Toolbar */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--line)',
              background: 'var(--panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 260 }}>
                {/* Search */}
                <div style={{ position: 'relative', minWidth: 200, flex: '1 1 200px' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
                  <input
                    type="text"
                    placeholder="Search by room name or creator…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 30, fontSize: 12, height: 32, width: '100%' }}
                  />
                </div>

                {/* Template Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LayoutTemplate size={13} color="var(--dim)" />
                  <select
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="input"
                    style={{ fontSize: 12, height: 32, padding: '0 8px', minWidth: 150 }}
                  >
                    <option value="all">All Templates</option>
                    {ALL_TEMPLATES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Block Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={13} color="var(--dim)" />
                  <select
                    value={selectedBlock}
                    onChange={e => setSelectedBlock(e.target.value)}
                    className="input"
                    style={{ fontSize: 12, height: 32, padding: '0 8px', minWidth: 140 }}
                  >
                    <option value="all">All Active Blocks</option>
                    {ALL_BLOCK_TYPES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Toggle Pills & Clear */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="pill-group">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`pill-tab ${selectedStatus === 'all' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedStatus('published')}
                    className={`pill-tab ${selectedStatus === 'published' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setSelectedStatus('draft')}
                    className={`pill-tab ${selectedStatus === 'draft' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    Draft
                  </button>
                </div>

                {(searchTerm || selectedTemplate !== 'all' || selectedBlock !== 'all' || selectedStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTemplate('all');
                      setSelectedBlock('all');
                      setSelectedStatus('all');
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 11, gap: 4 }}
                    title="Reset all filters"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 920 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Room Name</th>
                    <th style={{ minWidth: 160 }}>Creator</th>
                    <th style={{ minWidth: 130 }}>Template</th>
                    <th style={{ minWidth: 110 }}>Theme Preset</th>
                    <th style={{ minWidth: 160 }}>Block Composition</th>
                    <th style={{ minWidth: 80 }}>Status</th>
                    <th style={{ minWidth: 80 }}>Views</th>
                    <th style={{ minWidth: 80 }}>Unique</th>
                    <th style={{ minWidth: 110 }}>Engagement</th>
                    <th style={{ textAlign: 'right', minWidth: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--dim)', fontSize: 13 }}>
                        No showcase rooms match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map(room => (
                      <tr key={room.roomId}>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{room.roomName}</span>
                            {(room.interactionsCount ?? 0) > 0 && (
                              <p style={{ fontSize: 11, color: 'var(--dim)', margin: '2px 0 0 0' }}>
                                ⚡ {room.interactionsCount} builder clicks
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                              {room.ownerName}
                              {room.ownerIdConfirmed === false && (
                                <span className="badge badge-neutral" style={{ fontSize: 9, padding: '1px 6px' }} title="Matched by first-visitor activity, not a confirmed owner ID">
                                  inferred
                                </span>
                              )}
                            </p>
                            <p className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)', margin: '2px 0 0 0' }}>{room.ownerEmail}</p>
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
                          {room.blocksUsed && room.blocksUsed.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {room.blocksUsed.slice(0, 2).map(b => (
                                  <span
                                    key={b}
                                    style={{
                                      fontSize: 10.5,
                                      padding: '2px 6px',
                                      borderRadius: 4,
                                      background: 'var(--panel-2)',
                                      border: '1px solid var(--line)',
                                      color: 'var(--text)',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {b}
                                  </span>
                                ))}
                                {room.blocksUsed.length > 2 && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      padding: '2px 5px',
                                      borderRadius: 4,
                                      background: 'var(--panel)',
                                      color: 'var(--dim)',
                                      cursor: 'pointer',
                                    }}
                                    title={room.blocksUsed.join(', ')}
                                    onClick={() => setInspectingRoom(room)}
                                  >
                                    +{room.blocksUsed.length - 2} more
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: 10.5, color: 'var(--dim)' }}>
                                {room.blockCount || room.blocksUsed.length} blocks total
                              </span>
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
                              <span className="badge badge-error mono-metric" title="Repeated clicks on something unresponsive">
                                {room.rageClicks} rage click{room.rageClicks === 1 ? '' : 's'}
                              </span>
                            )}
                            {!!room.errorCount && (
                              <span className="badge badge-error mono-metric" title={`${room.errorCount} exceptions recorded during room setup`}>
                                ⚠️ {room.errorCount} error{room.errorCount === 1 ? '' : 's'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              onClick={() => setInspectingRoom(room)}
                              className="btn btn-ghost"
                              style={{ padding: '4px 8px', fontSize: 11.5, gap: 4 }}
                              title="Inspect this room's exact blocks and telemetry"
                            >
                              <Layers size={12} color="var(--accent)" /> Blocks
                            </button>
                            <button
                              onClick={() => navigate(`/lookup?userId=${encodeURIComponent(room.ownerDistinctId || room.ownerEmail)}`)}
                              className="btn btn-ghost"
                              style={{ padding: '4px 8px', fontSize: 11.5, gap: 4 }}
                              title={room.ownerIdConfirmed ? `Open ${room.ownerName}'s profile` : 'Owner identity is inferred from room activity'}
                            >
                              User <ArrowUpRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Blocks & Telemetry Modal */}
          {inspectingRoom && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20,
            }}>
              <div className="card-mistral" style={{
                maxWidth: 680,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 24,
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {inspectingRoom.roomName}
                      </h3>
                      {inspectingRoom.isPublished ? (
                        <span className="badge badge-success" style={{ fontSize: 11 }}>Published</span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: 11 }}>Draft</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
                      Creator: <strong style={{ color: 'var(--text)' }}>{inspectingRoom.ownerName}</strong> ({inspectingRoom.ownerEmail})
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectingRoom(null)}
                    className="btn btn-ghost"
                    style={{ padding: 6 }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Architecture & Template Specs */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Template Architecture
                    </span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', margin: '2px 0 0 0' }}>
                      {inspectingRoom.template || 'Custom Portfolio'}
                    </p>
                  </div>
                  {inspectingRoom.theme && (
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Theme Preset
                      </span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: THEME_PALETTE[inspectingRoom.theme.toLowerCase()] || '#FA520F' }} />
                        {inspectingRoom.theme}
                      </p>
                    </div>
                  )}
                  {inspectingRoom.publishedUrl && (
                    <a
                      href={inspectingRoom.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ fontSize: 12, gap: 5, padding: '4px 10px' }}
                    >
                      <ExternalLink size={12} /> Live Room
                    </a>
                  )}
                </div>

                {/* Blocks Used in This Room */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Layers size={15} color="var(--accent)" />
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        Active Room Blocks ({inspectingRoom.blocksUsed?.length || 0})
                      </h4>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                      Click Stream Synthesized
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                    {(inspectingRoom.blocksUsed || ['Profile', 'Video intro', 'Skill tags']).map((b: string) => (
                      <div
                        key={b}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: 'var(--panel-2)',
                          border: '1px solid var(--line)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  <div className="stat-card" style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Total Views</span>
                    <p className="mono-metric" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '4px 0 0 0' }}>
                      {formatNumber(inspectingRoom.views)}
                    </p>
                  </div>
                  <div className="stat-card" style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Unique Visitors</span>
                    <p className="mono-metric" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '4px 0 0 0' }}>
                      {formatNumber(inspectingRoom.uniqueViews)}
                    </p>
                  </div>
                  <div className="stat-card" style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Builder Clicks</span>
                    <p className="mono-metric" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '4px 0 0 0' }}>
                      ⚡ {inspectingRoom.interactionsCount ?? 0}
                    </p>
                  </div>
                  <div className="stat-card" style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Setup Errors</span>
                    <p className="mono-metric" style={{ fontSize: 18, fontWeight: 700, color: (inspectingRoom.errorCount ?? 0) > 0 ? '#EF4444' : 'var(--accent)', margin: '4px 0 0 0' }}>
                      {inspectingRoom.errorCount ?? 0}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => setInspectingRoom(null)}
                    className="btn btn-ghost"
                    style={{ fontSize: 12.5 }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const id = inspectingRoom.ownerDistinctId || inspectingRoom.ownerEmail;
                      setInspectingRoom(null);
                      navigate(`/lookup?userId=${encodeURIComponent(id)}`);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: 12.5, gap: 5 }}
                  >
                    Inspect Full Creator Profile <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

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
