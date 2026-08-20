import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import type { FunnelDashboardResponse } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { DATE_RANGES, SIGNUP_SOURCES } from '../../config/constants';

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
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: 'Sora, sans-serif' }}>{d.stage}</p>
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Users: <strong style={{ color: 'var(--accent)' }}>{formatNumber(d.count)}</strong></p>
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Of total: <strong>{formatPercentage(d.percentage)}</strong></p>
      </div>
    );
  }
  return null;
};

export const FunnelDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [signupSource, setSignupSource] = useState('all');

  const { data, isLoading, error } = useQuery<FunnelDashboardResponse>({
    queryKey: ['funnel', dateRange, signupSource],
    queryFn: () => dashboardApi.getFunnel(dateRange, signupSource) as Promise<FunnelDashboardResponse>,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            User Funnel
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Track how users move from signup to sharing their room
          </p>
        </div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            id="funnel-date-range"
            className="input"
            style={{ width: 150 }}
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
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
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div style={{ display: 'flex', gap: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{ flex: 1, height: 80, background: 'var(--panel-2)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>
      ) : data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {data.funnel.map((stage, i) => (
            <div key={stage.stage} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stage.stage}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>
                {formatNumber(stage.count)}
              </p>
              <p style={{ fontSize: 13, color: STAGE_COLORS[i], fontWeight: 600 }}>
                {formatPercentage(stage.percentage)} of total
              </p>
              {i < data.dropoff.length && (
                <div style={{ marginTop: 8, padding: '4px 8px', background: 'color-mix(in srgb, #EF4444 10%, transparent)', borderRadius: 6, display: 'inline-block' }}>
                  <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
                    ↓ {formatPercentage(data.dropoff[i].percentage)} drop-off
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {data && (
        <div className="chart-container">
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
            Funnel Visualisation
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.funnel} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" vertical={false} />
              <XAxis
                dataKey="stage"
                tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,212,191,0.06)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(v) => formatNumber(v as number)}
                  style={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'DM Sans' }}
                />
                {data.funnel.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Drop-off table */}
      {data && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Stage Breakdown
            </h3>
          </div>
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
                <tr key={stage.stage}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: STAGE_COLORS[i], flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{stage.stage}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{formatNumber(stage.count)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${stage.percentage}%`, height: '100%', background: STAGE_COLORS[i], borderRadius: 99 }} />
                      </div>
                      <span style={{ fontWeight: 600, color: STAGE_COLORS[i] }}>{formatPercentage(stage.percentage)}</span>
                    </div>
                  </td>
                  <td>
                    {i < data.dropoff.length ? (
                      <span className="badge badge-error">↓ {formatPercentage(data.dropoff[i].percentage)}</span>
                    ) : (
                      <span style={{ color: 'var(--faint)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
