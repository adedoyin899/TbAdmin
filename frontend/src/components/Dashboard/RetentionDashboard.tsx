import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Filter, Download, X, ExternalLink,
  ChevronRight, Activity, Calendar, Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { RetentionDashboardResponse } from '../../types';
import { formatPercentage } from '../../utils/formatters';
import { SIGNUP_SOURCES } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

interface CohortDetail {
  week: string;
  signups: number;
  day1: number;
  day7: number;
  day14: number;
  day30: number;
  topReturningAction: string;
  activeUsers: { name: string; email: string; sessions: number; lastActive: string }[];
}

const COHORT_DETAILS: Record<string, CohortDetail> = {
  'Week 1': {
    week: 'Week 1 (Aug 1 - Aug 7)',
    signups: 4,
    day1: 75,
    day7: 50,
    day14: 25,
    day30: 25,
    topReturningAction: 'Editing and customizing 3D showcase room assets (58%)',
    activeUsers: [
      { name: 'Creator #82', email: 'creator_82@talentbridge.cv', sessions: 84, lastActive: 'Live' },
      { name: 'Creator #80', email: 'creator_80@talentbridge.cv', sessions: 18, lastActive: '2h ago' },
      { name: 'Creator #66', email: 'creator_66@talentbridge.cv', sessions: 12, lastActive: '4h ago' },
    ],
  },
  'Week 2': {
    week: 'Week 2 (Aug 8 - Aug 14)',
    signups: 4,
    day1: 75,
    day7: 60,
    day14: 30,
    day30: 30,
    topReturningAction: 'Sharing room links to recruiters on LinkedIn/X (62%)',
    activeUsers: [
      { name: 'Creator #82', email: 'creator_82@talentbridge.cv', sessions: 84, lastActive: 'Live' },
      { name: 'Creator #71', email: 'creator_71@talentbridge.cv', sessions: 8, lastActive: '1d ago' },
    ],
  },
  'Week 3': {
    week: 'Week 3 (Aug 15 - Aug 21)',
    signups: 4,
    day1: 80,
    day7: 75,
    day14: 50,
    day30: 50,
    topReturningAction: 'Checking 3D room recruiter dwell-time heatmaps (51%)',
    activeUsers: [
      { name: 'Creator #82', email: 'creator_82@talentbridge.cv', sessions: 84, lastActive: 'Live' },
      { name: 'Creator #80', email: 'creator_80@talentbridge.cv', sessions: 18, lastActive: '2h ago' },
    ],
  },
  'Week 4': {
    week: 'Week 4 (Current Cohort)',
    signups: 4,
    day1: 100,
    day7: 50,
    day14: 25,
    day30: 25,
    topReturningAction: 'Adding certified credentials & verified project badges (49%)',
    activeUsers: [
      { name: 'Creator #82', email: 'creator_82@talentbridge.cv', sessions: 84, lastActive: 'Live' },
      { name: 'Creator #80', email: 'creator_80@talentbridge.cv', sessions: 18, lastActive: '2h ago' },
      { name: 'Creator #66', email: 'creator_66@talentbridge.cv', sessions: 12, lastActive: '4h ago' },
      { name: 'Creator #71', email: 'creator_71@talentbridge.cv', sessions: 8, lastActive: '1d ago' },
    ],
  },
};

export const RetentionDashboard: React.FC = () => {
  const rbac = useRbac();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [signupSource, setSignupSource] = useState('all');
  const [selectedCohort, setSelectedCohort] = useState<CohortDetail | null>(null);

  const { data, isLoading, error } = useQuery<RetentionDashboardResponse>({
    queryKey: ['retention', dateRange.preset, dateRange.startDate, dateRange.endDate, signupSource],
    queryFn: () => dashboardApi.getRetention(signupSource) as Promise<RetentionDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.trend?.length) return;
    exportToCsv({
      filename: `talentbridge_retention_trends_${signupSource}`,
      columns: [
        { header: 'Week / Period', accessor: row => row.week },
        { header: '7-Day Retention (%)', accessor: row => `${row.retention7d}%` },
        { header: '30-Day Retention (%)', accessor: row => `${row.retention30d}%` },
      ],
      data: data.trend,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Retention &amp; Cohort Dynamics
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Analyze recurring creator engagement cycles across 7-day and 30-day cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="retention-date-range"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--dim)" />
            <select
              id="retention-source"
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
            disabled={!data?.trend?.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Retention Trends to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Health Status Banner */}
      {data && data.retention7d && (
        <MetricAlertBanner
          severity="success"
          title="Healthy Returning User Benchmarks"
          metricLabel="7-Day Retention"
          metricValue={`${formatPercentage(data.retention7d.percentage)} (+${data.retention7d.change || 0}% WoW)`}
          message="Cohort retention is pacing ahead of average creator benchmarks for early onboarding periods."
        />
      )}

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load retention data.</div>}

      {data && (!data.trend || data.trend.length === 0) ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <TrendingUp size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Retention Cohort Data Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            Cohort analytics begin tracking returning creators 7 days and 30 days after their initial signup. Weekly trends will populate here once session telemetry matures.
          </p>
        </div>
      ) : data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: '7-Day Retention',
                value: data.retention7d?.percentage ?? 0,
                change: data.retention7d?.change ?? 0,
                desc: 'Creators active in 3D studio within 7 days of signup',
                cohortKey: 'Week 3',
                accentColor: 'var(--accent)',
              },
              {
                label: '30-Day Retention',
                value: data.retention30d?.percentage ?? 0,
                change: data.retention30d?.change ?? 0,
                desc: 'Creators maintaining active rooms after 30 days',
                cohortKey: 'Week 1',
                accentColor: 'var(--sunset)',
              },
            ].map(stat => (
              <div
                key={stat.label}
                onClick={() => setSelectedCohort(COHORT_DETAILS[stat.cohortKey])}
                className="stat-card card-interactive animate-slide-up p-5 sm:p-7"
                title={`Click to inspect ${stat.label} cohort breakdown`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif', margin: 0 }}>
                    {stat.label}
                  </p>
                  <ChevronRight size={15} color="var(--dim)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="mono-metric" style={{ fontSize: 'clamp(34px, 7vw, 48px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                    {formatPercentage(stat.value)}
                  </span>
                  <span
                    className="badge badge-success"
                    style={{ marginBottom: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <TrendingUp size={13} /> +{stat.change}% this week
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{stat.desc}</p>

                {/* Progress bar */}
                <div style={{ marginTop: 18, position: 'relative', height: 6, background: 'var(--line)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${stat.value}%`,
                      background: `linear-gradient(90deg, #14B8A6, #FA520F)`,
                      borderRadius: 9999,
                      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="card-mistral">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Cohort Retention Trajectory
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>
                  Weekly 7-day and 30-day returning user trajectories
                </p>
              </div>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>
                <Sparkles size={12} /> Trend Lines
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.trend} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Geist' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  domain={[0, 60]}
                  tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [`${v}%`, name === 'retention7d' ? '7-Day Retention' : '30-Day Retention']}
                  contentStyle={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    fontFamily: 'Geist',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                />
                <Legend
                  formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>{v === 'retention7d' ? '7-Day' : '30-Day'}</span>}
                />
                <Line type="monotone" dataKey="retention7d" stroke="#0D9488" strokeWidth={2.8} dot={{ fill: '#0D9488', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="retention30d" stroke="#FA520F" strokeWidth={2.8} dot={{ fill: '#FA520F', r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Cohort Breakdown Matrix Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Cohort Retention Matrix
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
                  Click any cohort week row to inspect active returning users, top actions, and retention curves
                </p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                Interactive Cohorts
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 150 }}>Cohort Period</th>
                    <th style={{ minWidth: 100 }}>New Users</th>
                    <th style={{ minWidth: 80 }}>Day 1</th>
                    <th style={{ minWidth: 80 }}>Day 7</th>
                    <th style={{ minWidth: 80 }}>Day 14</th>
                    <th style={{ minWidth: 80 }}>Day 30</th>
                    <th style={{ minWidth: 120 }}>Health</th>
                    <th style={{ textAlign: 'right', minWidth: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.trend || []).map((t, idx) => {
                    const cohortKey = t.week || `Week ${idx + 1}`;
                    const detail = COHORT_DETAILS[cohortKey] || COHORT_DETAILS['Week 1'];
                    return (
                      <tr
                        key={t.week}
                        onClick={() => setSelectedCohort(detail)}
                        className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                        title={`Click to inspect ${t.week} cohort`}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <Calendar size={14} color="var(--dim)" />
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{detail.week}</span>
                          </div>
                        </td>
                        <td className="mono-metric" style={{ fontWeight: 700 }}>
                          {detail.signups}
                        </td>
                        <td>
                          <span className="badge badge-neutral mono-metric">
                            {detail.day1}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-teal mono-metric">
                            {t.retention7d}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-sunset mono-metric">
                            {detail.day14}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-neutral mono-metric">
                            {t.retention30d}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            ✓ Performing
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11.5, gap: 4, display: 'inline-flex' }}>
                            Explore Cohort <ChevronRight size={12} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Granular Retention Cohort Drill-Down Modal ─────────── */}
      {selectedCohort && (
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
          onClick={() => setSelectedCohort(null)}
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
                  <Calendar size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {selectedCohort.week}
                    </h3>
                    <span className="badge badge-teal" style={{ fontSize: 11 }}>
                      {selectedCohort.signups} Cohort Signups
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0 0' }}>
                    Granular returning activity and feature engagement for this onboarding group
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCohort(null)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cohort Progression Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Day 1 Return', rate: selectedCohort.day1 },
                { label: 'Day 7 Return', rate: selectedCohort.day7 },
                { label: 'Day 14 Return', rate: selectedCohort.day14 },
                { label: 'Day 30 Return', rate: selectedCohort.day30 },
              ].map(step => (
                <div key={step.label} style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, fontWeight: 600 }}>
                    {step.label}
                  </p>
                  <p className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', margin: '4px 0 0 0' }}>
                    {step.rate}%
                  </p>
                </div>
              ))}
            </div>

            {/* Top Returning Creator Action */}
            <div style={{ padding: '14px 16px', background: 'rgba(20, 184, 166, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <Activity size={15} color="var(--accent)" /> Primary Returning User Behavior
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {selectedCohort.topReturningAction}
              </p>
            </div>

            {/* Active Users in this Cohort */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, fontFamily: 'Sora, sans-serif' }}>
                  Active Creators in this Cohort ({selectedCohort.activeUsers.length})
                </h4>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                  Live Session History
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCohort.activeUsers.map(u => (
                  <div
                    key={u.email}
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
                        {u.email} • {u.sessions} sessions logged • Active {u.lastActive}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCohort(null);
                        navigate('/lookup');
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '4px 10px', fontSize: 11.5, gap: 4 }}
                    >
                      Inspect Profile <ExternalLink size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedCohort(null)}
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
