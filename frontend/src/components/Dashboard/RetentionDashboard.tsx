import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import type { RetentionDashboardResponse } from '../../types';
import { formatPercentage } from '../../utils/formatters';
import { SIGNUP_SOURCES, CHART_COLORS } from '../../config/constants';

export const RetentionDashboard: React.FC = () => {
  const [signupSource, setSignupSource] = useState('all');

  const { data, isLoading, error } = useQuery<RetentionDashboardResponse>({
    queryKey: ['retention', signupSource],
    queryFn: () => dashboardApi.getRetention(signupSource) as Promise<RetentionDashboardResponse>,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Retention
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>How many users come back after signing up?</p>
        </div>
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

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: '7-Day Retention', value: data.retention7d.percentage, change: data.retention7d.change, desc: 'Users returning within 7 days of signup' },
              { label: '30-Day Retention', value: data.retention30d.percentage, change: data.retention30d.change, desc: 'Users returning within 30 days of signup' },
            ].map(stat => (
              <div
                key={stat.label}
                className="stat-card animate-slide-up"
                style={{ padding: '28px 32px' }}
              >
                <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  {stat.label}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
                    {formatPercentage(stat.value)}
                  </span>
                  <span
                    className="badge badge-success"
                    style={{ marginBottom: 6 }}
                  >
                    ↑ +{stat.change}% this week
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
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              Retention Trend (Weekly)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'DM Sans' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  domain={[0, 60]}
                  tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'DM Sans' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [`${v}%`, name === 'retention7d' ? '7-Day Retention' : '30-Day Retention']}
                  contentStyle={{
                    background: 'var(--panel)', border: '1px solid var(--line)',
                    borderRadius: 10, fontFamily: 'DM Sans',
                  }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                />
                <Legend
                  formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{v === 'retention7d' ? '7-Day' : '30-Day'}</span>}
                />
                <Line type="monotone" dataKey="retention7d" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ fill: CHART_COLORS.primary, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="retention30d" stroke={CHART_COLORS.secondary} strokeWidth={2.5} dot={{ fill: CHART_COLORS.secondary, r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
