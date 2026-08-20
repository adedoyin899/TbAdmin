import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Mail, MousePointerClick, AlertTriangle, Trophy,
  Calendar, Inbox,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { EmailDashboardResponse } from '../../types';
import { formatNumber, formatDate } from '../../utils/formatters';
import { DATE_RANGES, CHART_COLORS } from '../../config/constants';

export const EmailDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');

  const { data, isLoading, error } = useQuery<EmailDashboardResponse>({
    queryKey: ['email', dateRange],
    queryFn: () => dashboardApi.getEmail(dateRange) as Promise<EmailDashboardResponse>,
  });

  const chartData = data?.campaigns.map(c => ({
    name: c.campaignName.length > 16 ? c.campaignName.slice(0, 16) + '…' : c.campaignName,
    'Open %': c.openPercentage,
    'Click %': c.clickPercentage,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Email Campaigns
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Open rates, click rates, and bounce data from Mailgun</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} color="var(--dim)" />
          <select
            id="email-date-range"
            className="input"
            style={{ width: 150 }}
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Campaigns', value: data.campaigns.length, suffix: '', color: CHART_COLORS.primary, icon: <Inbox size={16} color={CHART_COLORS.primary} /> },
              { label: 'Avg Open Rate', value: Math.round(data.campaigns.reduce((a, c) => a + c.openPercentage, 0) / data.campaigns.length), suffix: '%', color: CHART_COLORS.info, icon: <Mail size={16} color={CHART_COLORS.info} /> },
              { label: 'Avg Click Rate', value: Math.round(data.campaigns.reduce((a, c) => a + c.clickPercentage, 0) / data.campaigns.length), suffix: '%', color: CHART_COLORS.success, icon: <MousePointerClick size={16} color={CHART_COLORS.success} /> },
              { label: 'Total Bounces', value: data.campaigns.reduce((a, c) => a + c.bounceCount, 0), suffix: '', color: CHART_COLORS.warning, icon: <AlertTriangle size={16} color={CHART_COLORS.warning} /> },
            ].map(card => (
              <div key={card.label} className="stat-card animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </p>
                  {card.icon}
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: card.color, fontFamily: 'Sora, sans-serif' }}>
                  {card.value}{card.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              Open & Click Rates by Campaign
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                />
                <Bar dataKey="Open %" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Click %" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top performers & Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                All Campaigns
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {data.topPerformers.slice(0, 1).map(p => (
                  <div key={p.campaignName} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Top performer:</span>
                    <span className="badge badge-success" style={{ gap: 4 }}>
                      <Trophy size={13} /> {p.campaignName} ({p.clickPercentage}% click)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Sent Date</th>
                    <th>Sent</th>
                    <th>Opens</th>
                    <th>Clicks</th>
                    <th>Click %</th>
                    <th>Bounces</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map(c => (
                    <tr key={c.campaignId}>
                      <td style={{ fontWeight: 600 }}>{c.campaignName}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{formatDate(c.sentDate)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatNumber(c.sentCount)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.openPercentage}%</span>
                          <span className="badge badge-info" style={{ fontSize: 11 }}>{formatNumber(c.openCount)}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatNumber(c.clickCount)}</td>
                      <td>
                        <span
                          className={`badge ${c.clickPercentage >= 15 ? 'badge-success' : c.clickPercentage >= 10 ? 'badge-warning' : 'badge-error'}`}
                        >
                          {c.clickPercentage}%
                        </span>
                      </td>
                      <td>
                        {c.bounceCount > 0
                          ? <span className="badge badge-error">{c.bounceCount}</span>
                          : <span style={{ color: 'var(--faint)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
