import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Filter, Download, X, ExternalLink,
  ChevronRight, Activity, Calendar,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { RetentionDashboardResponse } from '../../types';
import { formatPercentage } from '../../utils/formatters';
import { SIGNUP_SOURCES, CHART_COLORS } from '../../config/constants';
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
    signups: 240,
    day1: 68,
    day7: 42,
    day14: 35,
    day30: 28,
    topReturningAction: 'Editing and customizing 3D showcase room assets (58%)',
    activeUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', sessions: 8, lastActive: '2h ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', sessions: 6, lastActive: '5h ago' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', sessions: 4, lastActive: '1d ago' },
    ],
  },
  'Week 2': {
    week: 'Week 2 (Aug 8 - Aug 14)',
    signups: 280,
    day1: 72,
    day7: 46,
    day14: 38,
    day30: 31,
    topReturningAction: 'Sharing room links to recruiters on LinkedIn/X (62%)',
    activeUsers: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', sessions: 9, lastActive: '30m ago' },
      { name: 'Bob Smith', email: 'bob.smith@example.com', sessions: 5, lastActive: '3h ago' },
    ],
  },
  'Week 3': {
    week: 'Week 3 (Aug 15 - Aug 21)',
    signups: 310,
    day1: 74,
    day7: 48,
    day14: 40,
    day30: 33,
    topReturningAction: 'Checking 3D room recruiter dwell-time heatmaps (51%)',
    activeUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', sessions: 11, lastActive: '10m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', sessions: 7, lastActive: '1h ago' },
      { name: 'Priya Sharma', email: 'priya.sharma@example.com', sessions: 3, lastActive: '4h ago' },
    ],
  },
  'Week 4': {
    week: 'Week 4 (Current Cohort)',
    signups: 170,
    day1: 78,
    day7: 50,
    day14: 42,
    day30: 35,
    topReturningAction: 'Adding certified credentials & verified project badges (49%)',
    activeUsers: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', sessions: 4, lastActive: '5m ago' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', sessions: 3, lastActive: '25m ago' },
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Retention & Cohorts
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Track recurring creator activity across 7-day and 30-day cohorts. Click any cohort row or card to explore returning user profiles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
              style={{ width: 160 }}
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: data?.trend?.length && rbac.canExportData ? 'pointer' : 'not-allowed',
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
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (!data.trend || data.trend.length === 0) ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <TrendingUp size={24} color="#2DD4BF" />
          </div>
          <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Retention Cohort Data Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
            Cohort analytics begin tracking returning creators 7 days and 30 days after their initial signup. Weekly trends will populate here once enough session history is established.
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
              },
              {
                label: '30-Day Retention',
                value: data.retention30d?.percentage ?? 0,
                change: data.retention30d?.change ?? 0,
                desc: 'Creators maintaining active rooms after 30 days',
                cohortKey: 'Week 1',
              },
            ].map(stat => (
              <div
                key={stat.label}
                onClick={() => setSelectedCohort(COHORT_DETAILS[stat.cohortKey])}
                className="stat-card animate-slide-up p-5 sm:p-7 hover:border-[var(--accent)] hover:translate-y-[-2px] transition-all cursor-pointer"
                title={`Click to inspect ${stat.label} cohort breakdown`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    {stat.label}
                  </p>
                  <ChevronRight size={15} color="var(--dim)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: 'var(--text)', fontFamily: 'Geist, sans-serif', lineHeight: 1 }}>
                    {formatPercentage(stat.value)}
                  </span>
                  <span
                    className="badge badge-success"
                    style={{ marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <TrendingUp size={13} /> +{stat.change}% this week
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--faint)' }}>{stat.desc}</p>

                {/* Visual arc */}
                <div style={{ marginTop: 16, position: 'relative', height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${stat.value}%`,
                      background: `linear-gradient(90deg, ${CHART_COLORS.primary}, ${CHART_COLORS.secondary})`,
                      borderRadius: 99,
                      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Retention Trend (Weekly)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>7-day and 30-day returning user trajectories</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Geist' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  domain={[0, 60]}
                  tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Geist' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [`${v}%`, name === 'retention7d' ? '7-Day Retention' : '30-Day Retention']}
                  contentStyle={{
                    background: 'var(--panel)', border: '1px solid var(--line)',
                    borderRadius: 10, fontFamily: 'Geist',
                  }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist' }}
                />
                <Legend
                  formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{v === 'retention7d' ? '7-Day' : '30-Day'}</span>}
                />
                <Line type="monotone" dataKey="retention7d" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ fill: CHART_COLORS.primary, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="retention30d" stroke={CHART_COLORS.secondary} strokeWidth={2.5} dot={{ fill: CHART_COLORS.secondary, r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Cohort Breakdown Matrix Table — Clickable Rows */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Cohort Retention Matrix
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12 }}>
                  Click any cohort week row to inspect active returning users, top actions, and retention curves
                </p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                Interactive Cohorts
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Cohort Period</th>
                    <th>New Users</th>
                    <th>Day 1</th>
                    <th>Day 7</th>
                    <th>Day 14</th>
                    <th>Day 30</th>
                    <th>Health</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={14} color="var(--dim)" />
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{detail.week}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>
                          {detail.signups}
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontFamily: 'Geist Mono, monospace' }}>
                            {detail.day1}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ fontFamily: 'Geist Mono, monospace' }}>
                            {t.retention7d}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info" style={{ fontFamily: 'Geist Mono, monospace' }}>
                            {detail.day14}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontFamily: 'Geist Mono, monospace' }}>
                            {t.retention30d}%
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ gap: 4 }}>
                            ✓ Performing
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 4, display: 'inline-flex' }}>
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
              padding: '24px',
            }}
            className="animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(45, 212, 191, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2DD4BF',
                  }}
                >
                  <Calendar size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {selectedCohort.week}
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
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
                <div key={step.label} style={{ padding: '12px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    {step.label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Geist Mono, monospace', margin: '4px 0 0 0' }}>
                    {step.rate}%
                  </p>
                </div>
              ))}
            </div>

            {/* Top Returning Creator Action */}
            <div style={{ padding: '14px 16px', background: 'rgba(45, 212, 191, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F766E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <Activity size={15} color="#2DD4BF" /> Primary Returning User Behavior
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {selectedCohort.topReturningAction}
              </p>
            </div>

            {/* Active Users in this Cohort */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
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
                      <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0', fontFamily: 'Geist Mono, monospace' }}>
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
                      style={{ padding: '4px 10px', fontSize: 11, gap: 4 }}
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
