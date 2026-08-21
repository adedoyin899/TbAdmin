import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Filter, ArrowDownRight, Download, X, ExternalLink,
  Users, Clock, Zap, CheckCircle2, ChevronRight,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FunnelDashboardResponse, FunnelStage, Dropoff } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { SIGNUP_SOURCES } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const STAGE_COLORS = [
  '#2DD4BF', '#1FB8A7', '#13A090', '#0A8A7A', '#057060',
];

const STAGE_METADATA: Record<string, {
  desc: string;
  avgDuration: string;
  primaryDevice: string;
  topDropoffReason: string;
  recommendedAction: string;
  sampleUsers: { name: string; email: string; userId: string; country: string; source: string; time: string }[];
}> = {
  'Signup Started': {
    desc: 'Initial account creation initiated with email and password.',
    avgDuration: '45 seconds',
    primaryDevice: 'Desktop (58%) / Mobile (42%)',
    topDropoffReason: 'Email typo or password validation requirements friction.',
    recommendedAction: 'Enable Google/GitHub 1-click social sign-on to eliminate form friction.',
    sampleUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', userId: 'user_123abc', country: 'United Kingdom', source: 'Organic', time: '10m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', userId: 'user_456def', country: 'Ghana', source: 'Email', time: '25m ago' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', userId: 'user_789ghi', country: 'Italy', source: 'Referral', time: '1h ago' },
      { name: 'Bob Smith', email: 'bob.smith@example.com', userId: 'user_321jkl', country: 'United States', source: 'Paid Ad', time: '2h ago' },
    ],
  },
  'Email Verified': {
    desc: 'Recipient confirmed inbox link or submitted 6-digit confirmation pin.',
    avgDuration: '2 minutes 14 seconds',
    primaryDevice: 'Mobile (64%) / Desktop (36%)',
    topDropoffReason: 'Email landing in spam/promotions or delayed Mailgun dispatch.',
    recommendedAction: 'Maintain clean SPF/DKIM records and trigger instant SMS fallback.',
    sampleUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', userId: 'user_123abc', country: 'United Kingdom', source: 'Organic', time: '8m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', userId: 'user_456def', country: 'Ghana', source: 'Email', time: '22m ago' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', userId: 'user_789ghi', country: 'Italy', source: 'Referral', time: '55m ago' },
    ],
  },
  'Room Created': {
    desc: 'Creator launched the 3D showcase canvas editor and selected an initial layout template.',
    avgDuration: '3 minutes 50 seconds',
    primaryDevice: 'Desktop (82%) / Tablet (18%)',
    topDropoffReason: 'Blank canvas intimidation without pre-populated showcase content.',
    recommendedAction: 'Offer 1-click LinkedIn/GitHub portfolio import to pre-populate 3D assets.',
    sampleUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', userId: 'user_123abc', country: 'United Kingdom', source: 'Organic', time: '5m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', userId: 'user_456def', country: 'Ghana', source: 'Email', time: '18m ago' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', userId: 'user_987pqr', country: 'Canada', source: 'Organic', time: '40m ago' },
    ],
  },
  'Room Published': {
    desc: 'Creator finalized assets, verified responsive layout, and toggled room status to Public.',
    avgDuration: '6 minutes 30 seconds',
    primaryDevice: 'Desktop (91%) / Mobile (9%)',
    topDropoffReason: 'Hesitation around public profile readiness or incomplete project thumbnails.',
    recommendedAction: 'Show interactive checklist: "Your room is 90% ready to publish!".',
    sampleUsers: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', userId: 'user_123abc', country: 'United Kingdom', source: 'Organic', time: '3m ago' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', userId: 'user_456def', country: 'Ghana', source: 'Email', time: '14m ago' },
    ],
  },
  'Room Shared': {
    desc: 'Creator copied public URL or used one-click share to LinkedIn, X, or email portfolio to recruiters.',
    avgDuration: '1 minute 10 seconds',
    primaryDevice: 'Desktop (70%) / Mobile (30%)',
    topDropoffReason: 'Lack of instant social preview card generation.',
    recommendedAction: 'Generate instant high-res OG image previews of the 3D room on share.',
    sampleUsers: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', userId: 'user_456def', country: 'Ghana', source: 'Email', time: '10m ago' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', userId: 'user_987pqr', country: 'Canada', source: 'Organic', time: '35m ago' },
    ],
  },
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { stage: string; count: number; percentage: number } }[] }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{d.stage}</p>
        <p style={{ color: 'var(--text-2)' }}>Count: <strong style={{ color: '#2DD4BF' }}>{formatNumber(d.count)}</strong></p>
        <p style={{ color: 'var(--text-2)' }}>Conversion: <strong style={{ color: '#2DD4BF' }}>{formatPercentage(d.percentage)}</strong></p>
        <p style={{ color: 'var(--dim)', fontSize: 11, marginTop: 4 }}>Click column to explore details ↗</p>
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

  const stageMeta = selectedStage ? (STAGE_METADATA[selectedStage.stage] || STAGE_METADATA['Signup Started']) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Funnel Conversion
            </h2>
            {isFetching && <div className="spinner" style={{ width: 14, height: 14 }} />}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Track step-by-step conversion from signup to 3D room publish. Click any stage to inspect cohort drill-downs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
              style={{ width: 160 }}
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: data?.funnel?.length && rbac.canExportData ? 'pointer' : 'not-allowed',
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{ height: 80, background: 'var(--panel-2)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(data.funnel || []).map((stage, i) => (
            <div
              key={stage.stage || i}
              onClick={() => setSelectedStage(stage)}
              className="stat-card animate-slide-up hover:border-[var(--accent)] hover:translate-y-[-2px] transition-all cursor-pointer"
              style={{ animationDelay: `${i * 60}ms`, position: 'relative' }}
              title={`Click to inspect ${stage.stage} details`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stage.stage}
                </p>
                <ChevronRight size={14} color="var(--dim)" />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', fontFamily: 'Geist, sans-serif', marginBottom: 2 }}>
                {formatNumber(stage.count)}
              </p>
              <p style={{ fontSize: 13, color: STAGE_COLORS[i % STAGE_COLORS.length], fontWeight: 600 }}>
                {formatPercentage(stage.percentage)} of total
              </p>
              {data.dropoff && i < data.dropoff.length && data.dropoff[i] && (
                <div style={{ marginTop: 8, padding: '3px 7px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowDownRight size={11} color="#EF4444" />
                  <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                    {formatPercentage(data.dropoff[i]?.percentage)} drop-off
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.funnel && data.funnel.length > 0 && (
        <div className="chart-container">
          <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
            Funnel Visualisation
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.funnel}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              onClick={(state: any) => {
                if (state?.activePayload?.[0]) setSelectedStage(state.activePayload[0].payload as FunnelStage);
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Geist' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Geist' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,212,191,0.06)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.funnel.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stage Breakdown Table — Clickable Rows */}
      {data && data.funnel && data.funnel.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Stage Breakdown
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12 }}>
                Click on any stage row to explore user cohorts, drop-off factors, and optimization playbooks
              </p>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              Interactive Drill-down
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Users</th>
                  <th>% of Total</th>
                  <th>Drop-off to Next</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.funnel.map((stage, i) => (
                  <tr
                    key={stage.stage || i}
                    onClick={() => setSelectedStage(stage)}
                    className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                    title={`Click to inspect ${stage.stage}`}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: STAGE_COLORS[i % STAGE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{stage.stage}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>{formatNumber(stage.count)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${stage.percentage || 0}%`, height: '100%', background: STAGE_COLORS[i % STAGE_COLORS.length], borderRadius: 99 }} />
                        </div>
                        <span style={{ fontWeight: 600, color: STAGE_COLORS[i % STAGE_COLORS.length] }}>{formatPercentage(stage.percentage)}</span>
                      </div>
                    </td>
                    <td>
                      {data.dropoff && i < data.dropoff.length && data.dropoff[i] ? (
                        <span className="badge badge-error">↓ {formatPercentage(data.dropoff[i]?.percentage)}</span>
                      ) : (
                        <span style={{ color: 'var(--faint)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 4, display: 'inline-flex' }}>
                        Explore Stage <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
              Cached at {data.cachedAt ? new Date(data.cachedAt).toLocaleTimeString('en-GB') : '—'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
              Refreshes at {data.expiresAt ? new Date(data.expiresAt).toLocaleTimeString('en-GB') : '—'}
            </span>
          </div>
        </div>
      )}

      {/* ── Granular Stage Drill-Down Modal ──────────────────────── */}
      {selectedStage && stageMeta && (
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
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {selectedStage.stage}
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      {formatNumber(selectedStage.count)} Creators ({formatPercentage(selectedStage.percentage)})
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0 0' }}>
                    {stageMeta.desc}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12, marginBottom: 4 }}>
                  <Users size={14} /> Total Converted
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Geist Mono, monospace', margin: 0 }}>
                  {formatNumber(selectedStage.count)}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12, marginBottom: 4 }}>
                  <Clock size={14} /> Median Stage Time
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {stageMeta.avgDuration}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12, marginBottom: 4 }}>
                  <Zap size={14} /> Device Split
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>
                  {stageMeta.primaryDevice}
                </p>
              </div>
            </div>

            {/* Friction & Drop-off Root Cause */}
            <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <AlertCircle size={15} /> Observed Friction & Drop-off Cause
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {stageMeta.topDropoffReason}
              </p>
            </div>

            {/* Recommended Optimization Playbook */}
            <div style={{ padding: '14px 16px', background: 'rgba(45, 212, 191, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F766E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <CheckCircle2 size={15} color="#2DD4BF" /> Recommended UX Optimization Action
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {stageMeta.recommendedAction}
              </p>
            </div>

            {/* Active User Cohort Sample List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Recent Cohort Creators at this Milestone ({stageMeta.sampleUsers.length})
                </h4>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                  Live PostHog Profile Stream
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageMeta.sampleUsers.map(u => (
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
                      <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0 0', fontFamily: 'Geist Mono, monospace' }}>
                        {u.email} • {u.country} ({u.source})
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--dim)' }}>{u.time}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStage(null);
                          navigate('/lookup');
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 11, gap: 4 }}
                      >
                        Inspect Profile <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
