import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Filter, ArrowDownRight, Download, X, ExternalLink,
  Users, Clock, Zap, ChevronRight,
  TrendingUp, AlertCircle, Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FunnelDashboardResponse, FunnelStage, Dropoff } from '../../types';
import { formatNumber, formatPercentage, formatRelativeTime } from '../../utils/formatters';
import { SIGNUP_SOURCES } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const STAGE_COLORS = [
  '#0D9488', '#14B8A6', '#2DD4BF', '#059669', '#10B981',
];

// Static, editorial one-line definitions of what each stage means — not a data claim, so this
// stays hardcoded. Everything else previously here (avgDuration, primaryDevice, topDropoffReason,
// recommendedAction, sampleUsers) was invented text and an identical fake user list repeated on
// every stage; that's now computed for real in FunnelStageDetail from the backing PostHog events.
const STAGE_DESCRIPTIONS: Record<string, string> = {
  '1. Landing & Pageview': 'Initial visitor landed on TalentBridge marketing root or public directory page.',
  '2. Directory & App Navigation': 'Visitor navigated through Talent Directory profiles and candidate showcase registries.',
  '3. Showcase Room Inspection': 'User explored full interactive 3D showcase portfolios and asset studios.',
  '4. Interactive Telemetry Actions': 'Viewer interacted directly with 3D models, autocapture buttons, and project links.',
  '5. Identified Creator Accounts': 'Fully registered and authenticated creator profile identified in PostHog telemetry.',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { stage: string; count: number; percentage: number } }[] }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'Sora, sans-serif' }}>{d.stage}</p>
        <p style={{ color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between', gap: 12, margin: '2px 0' }}>
          <span>Count:</span> <strong className="mono-metric" style={{ color: 'var(--accent)' }}>{formatNumber(d.count)}</strong>
        </p>
        <p style={{ color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between', gap: 12, margin: '2px 0' }}>
          <span>Conversion:</span> <strong className="mono-metric" style={{ color: 'var(--accent)' }}>{formatPercentage(d.percentage)}</strong>
        </p>
        <p style={{ color: 'var(--dim)', fontSize: 11, marginTop: 6 }}>Click column to explore details ↗</p>
      </div>
    );
  }
  return null;
};

export const FunnelDashboard: React.FC = () => {
  const rbac = useRbac();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [signupSource, setSignupSource] = useState('all');
  const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);

  const { data, isLoading, error, isFetching } = useQuery<FunnelDashboardResponse>({
    queryKey: ['funnel', dateRange.preset, dateRange.startDate, dateRange.endDate, signupSource],
    queryFn: () => dashboardApi.getFunnel(dateRange.preset, signupSource) as Promise<FunnelDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.funnel?.length) return;
    exportToCsv({
      filename: `talentbridge_funnel_${dateRange.preset}_${signupSource}`,
      columns: [
        { header: 'Funnel Stage', accessor: row => row.stage },
        { header: 'User Count', accessor: row => row.count },
        { header: 'Conversion Rate (%)', accessor: row => `${row.percentage}%` },
      ],
      data: data.funnel,
    });
  };

  const maxDropoff = (data?.dropoff || []).reduce<Dropoff | null>(
    (max, cur) => (!max || cur.percentage > max.percentage ? cur : max),
    null
  );

  const stageDesc = selectedStage ? STAGE_DESCRIPTIONS[selectedStage.stage] : null;
  const stageDetail = selectedStage?.detail || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Funnel Conversion
            </h2>
            {isFetching && <div className="spinner" style={{ width: 14, height: 14 }} />}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Real-time creator onboarding telemetry from initial signup to published 3D rooms.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="funnel-date-range"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--dim)" />
            <select
              id="funnel-signup-source"
              className="input"
              style={{ width: 140 }}
              value={signupSource}
              onChange={e => setSignupSource(e.target.value)}
            >
              {SIGNUP_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={!data?.funnel?.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {data && maxDropoff && maxDropoff.percentage >= 40 && (
        <MetricAlertBanner
          severity="warning"
          title="High Funnel Drop-off Detected"
          metricLabel="Peak Drop-off Stage"
          metricValue={`${maxDropoff.from} → ${maxDropoff.to} (${formatPercentage(maxDropoff.percentage)})`}
          message={`A significant drop-off occurred between ${maxDropoff.from} and ${maxDropoff.to}. Consider reviewing onboarding friction.`}
        />
      )}

      {/* Metric Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{ height: 110, background: 'var(--panel-2)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: 24, color: '#EF4444', textAlign: 'center', background: 'var(--panel)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
          Failed to load funnel analytics data.
        </div>
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {(data.funnel || []).map((stage, i) => (
            <div
              key={stage.stage || i}
              onClick={() => setSelectedStage(stage)}
              className="stat-card card-interactive animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
              title={`Click to inspect ${stage.stage} details`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                  {stage.stage}
                </p>
                <ChevronRight size={13} color="var(--dim)" />
              </div>
              <p className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                {formatNumber(stage.count)}
              </p>
              <p style={{ fontSize: 12.5, color: STAGE_COLORS[i % STAGE_COLORS.length], fontWeight: 600 }}>
                {formatPercentage(stage.percentage)} of total
              </p>
              {data.dropoff && i < data.dropoff.length && data.dropoff[i] && (
                <div style={{ marginTop: 10, padding: '3px 8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid rgba(239,68,68,0.18)' }}>
                  <ArrowDownRight size={11} color="#EF4444" />
                  <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                    {formatPercentage(data.dropoff[i]?.percentage)} drop
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart Visualization */}
      {data && data.funnel && data.funnel.length > 0 && (
        <div className="card-mistral">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Funnel Conversion Step Progression
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginTop: 2 }}>
                Visual volume transition across consecutive milestones
              </p>
            </div>
            <span className="badge badge-teal" style={{ fontSize: 11 }}>
              <Sparkles size={12} /> Interactive
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.funnel}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              onClick={(state: any) => {
                if (state?.activePayload?.[0]) setSelectedStage(state.activePayload[0].payload as FunnelStage);
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
              <XAxis dataKey="stage" tick={{ fill: 'var(--text-2)', fontSize: 11.5, fontFamily: 'Geist' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,184,166,0.06)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {(data.funnel || []).map((_, i) => <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stage Breakdown Table */}
      {data && data.funnel && data.funnel.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Milestone Stage Breakdown
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
                Click any stage row to explore user cohorts, drop-off factors, and optimization playbooks
              </p>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              Interactive Drill-down
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Stage</th>
                  <th style={{ minWidth: 100 }}>Users</th>
                  <th style={{ minWidth: 180 }}>% of Total</th>
                  <th style={{ minWidth: 140 }}>Drop-off to Next</th>
                  <th style={{ textAlign: 'right', minWidth: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.funnel || []).map((stage, i) => (
                  <tr
                    key={stage.stage || i}
                    onClick={() => setSelectedStage(stage)}
                    className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                    title={`Click to inspect ${stage.stage}`}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: STAGE_COLORS[i % STAGE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', fontSize: 13.5 }}>{stage.stage}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mono-metric" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        {formatNumber(stage.count)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 100, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${stage.percentage || 0}%`, height: '100%', background: STAGE_COLORS[i % STAGE_COLORS.length], borderRadius: 99 }} />
                        </div>
                        <span className="mono-metric" style={{ fontWeight: 600, color: STAGE_COLORS[i % STAGE_COLORS.length], fontSize: 12.5, whiteSpace: 'nowrap' }}>
                          {formatPercentage(stage.percentage)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {data.dropoff && i < data.dropoff.length && data.dropoff[i] ? (
                        <span className="badge badge-error" style={{ whiteSpace: 'nowrap', padding: '3px 9px' }}>
                          ↓ {formatPercentage(data.dropoff[i]?.percentage)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--dim)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, gap: 5, display: 'inline-flex', whiteSpace: 'nowrap' }}>
                        Explore Stage <ChevronRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: 'var(--panel-2)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>
              Cached at {data.cachedAt ? new Date(data.cachedAt).toLocaleTimeString('en-GB') : '—'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>
              Refreshes at {data.expiresAt ? new Date(data.expiresAt).toLocaleTimeString('en-GB') : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Granular Stage Drill-Down Modal */}
      {selectedStage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--over)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(6px)',
          }}
          className="animate-fade-in"
          onClick={() => setSelectedStage(null)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              padding: '26px',
            }}
            className="animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(20, 184, 166, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {selectedStage.stage}
                    </h3>
                    <span className="badge badge-teal" style={{ fontSize: 11 }}>
                      {formatNumber(selectedStage.count)} Creators ({formatPercentage(selectedStage.percentage)})
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0 0' }}>
                    {stageDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Stage Quick KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11.5, marginBottom: 4 }}>
                  <Users size={14} /> Total Converted
                </div>
                <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {formatNumber(selectedStage.count)}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11.5, marginBottom: 4 }}>
                  <Clock size={14} /> Median Time Since Prior Stage
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {stageDetail?.medianDurationLabel ?? 'Not enough paired data'}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11.5, marginBottom: 4 }}>
                  <Zap size={14} /> Device Split
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>
                  {stageDetail?.deviceBreakdown?.length
                    ? stageDetail.deviceBreakdown.map(d => `${d.name} ${d.percentage}%`).join(' / ')
                    : 'No device data'}
                </p>
              </div>
            </div>

            {/* Real drop-off, computed from the prior stage's actual cohort size */}
            <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <AlertCircle size={15} /> Measured Drop-off
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {stageDetail?.dropOffSummary ?? 'No drop-off data available for this range.'}
              </p>
            </div>

            {/* Active User Cohort Sample List — real people who reached this stage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, fontFamily: 'Sora, sans-serif' }}>
                  Real Creators at this Milestone ({(stageDetail?.sampleUsers || []).length})
                </h4>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                  Live PostHog Profile Stream
                </span>
              </div>

              {(stageDetail?.sampleUsers || []).length === 0 ? (
                <p style={{ fontSize: 12.5, color: 'var(--dim)', padding: '10px 0' }}>No creators reached this stage in the selected range.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(stageDetail?.sampleUsers || []).map(u => (
                    <div
                      key={u.userId}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--panel-2)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                          {u.name}
                        </p>
                        <p className="mono-metric" style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0' }}>
                          {u.email} • {u.country} ({u.source})
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--dim)' }}>{formatRelativeTime(u.lastSeen)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage(null);
                            navigate(`/lookup?userId=${encodeURIComponent(u.userId)}`);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11.5, gap: 4 }}
                        >
                          Inspect Profile <ExternalLink size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="btn btn-primary"
                style={{ padding: '7px 18px', fontSize: 13 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
