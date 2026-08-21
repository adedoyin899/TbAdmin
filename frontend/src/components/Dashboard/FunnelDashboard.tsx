import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import {
  Filter, ArrowDownRight, Download,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FunnelDashboardResponse, Dropoff } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { SIGNUP_SOURCES } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';

const STAGE_COLORS = [
  '#2DD4BF', '#1FB8A7', '#13A090', '#0A8A7A', '#057060',
];

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
      </div>
    );
  }
  return null;
};

export const FunnelDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [signupSource, setSignupSource] = useState('all');

  const { data, isLoading, error, isFetching } = useQuery<FunnelDashboardResponse>({
    queryKey: ['funnel', dateRange.preset, dateRange.startDate, dateRange.endDate, signupSource],
    queryFn: () => dashboardApi.getFunnel(dateRange.preset, signupSource) as Promise<FunnelDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.funnel?.length) return;
    exportToCsv({
      filename: `talentbridge_funnel_conversion_${signupSource}`,
      columns: [
        { header: 'Funnel Stage', accessor: row => row.stage },
        { header: 'User Count', accessor: row => row.count },
        { header: 'Conversion Rate (%)', accessor: row => `${row.percentage}%` },
        {
          header: 'Drop-off Rate (%)',
          accessor: (_, index) => {
            const drop = data.dropoff[index];
            return drop ? `${drop.percentage}%` : '0%';
          },
        },
      ],
      data: data.funnel,
    });
  };

  // Check for critical drop-off (> 40%)
  const maxDropoff = data?.dropoff?.reduce<Dropoff | null>((max, curr) => (!max || curr.percentage > max.percentage ? curr : max), null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Funnel Conversion
            </h2>
            {isFetching && <div className="spinner" style={{ width: 14, height: 14 }} />}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Track conversion and drop-off across key user onboarding stages
          </p>
        </div>
        {/* Filters & Export */}
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
              style={{ width: 155 }}
              value={signupSource}
              onChange={e => setSignupSource(e.target.value)}
            >
              {SIGNUP_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={!data?.funnel?.length}
            className="btn btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: data?.funnel?.length ? 'pointer' : 'not-allowed',
            }}
            title="Export Funnel Breakdown to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Anomaly / Alert Banner */}
      {data && maxDropoff && maxDropoff.percentage >= 40 && (
        <MetricAlertBanner
          severity="warning"
          title="High Funnel Drop-off Detected"
          metricLabel="Peak Drop-off Stage"
          metricValue={`${maxDropoff.from} → ${maxDropoff.to} (${formatPercentage(maxDropoff.percentage)})`}
          message={`A significant drop-off occurred between ${maxDropoff.from} and ${maxDropoff.to}. Consider reviewing onboarding friction and guidance.`}
        />
      )}

      {/* Stat cards */}
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
            <div key={stage.stage || i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stage.stage}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', fontFamily: 'Geist, sans-serif', marginBottom: 2 }}>
                {formatNumber(stage.count)}
              </p>
              <p style={{ fontSize: 13, color: STAGE_COLORS[i % STAGE_COLORS.length], fontWeight: 600 }}>
                {formatPercentage(stage.percentage)} of total
              </p>
              {data.dropoff && i < data.dropoff.length && data.dropoff[i] && (
                <div style={{ marginTop: 8, padding: '4px 8px', background: 'color-mix(in srgb, #EF4444 10%, transparent)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowDownRight size={12} color="#EF4444" />
                  <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
                    {formatPercentage(data.dropoff[i]?.percentage)} drop-off
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {data && data.funnel && data.funnel.length > 0 && (
        <div className="chart-container">
          <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
            Funnel Visualisation
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.funnel} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" vertical={false} />
              <XAxis
                dataKey="stage"
                tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Geist' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'Geist' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,212,191,0.06)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(v) => formatNumber(v as number)}
                  style={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Geist' }}
                />
                {data.funnel.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Drop-off table */}
      {data && data.funnel && data.funnel.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Stage Breakdown
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Users</th>
                <th>% of Total</th>
                <th>Drop-off to Next</th>
              </tr>
            </thead>
            <tbody>
              {data.funnel.map((stage, i) => (
                <tr key={stage.stage || i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: STAGE_COLORS[i % STAGE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{stage.stage}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 600 }}>{formatNumber(stage.count)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
              Cached at {data.cachedAt ? new Date(data.cachedAt).toLocaleTimeString('en-GB') : '—'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
              Refreshes at {data.expiresAt ? new Date(data.expiresAt).toLocaleTimeString('en-GB') : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
