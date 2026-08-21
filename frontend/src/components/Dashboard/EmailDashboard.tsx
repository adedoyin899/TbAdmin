import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Mail, MousePointerClick, AlertTriangle, Trophy,
  Inbox, ArrowRight, Download,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { EmailDashboardResponse, EmailCampaign } from '../../types';
import { formatNumber, formatDate } from '../../utils/formatters';
import { CHART_COLORS } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { CampaignDetailView } from '../Email/CampaignDetailView';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';

export const EmailDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  const { data, isLoading, error } = useQuery<EmailDashboardResponse>({
    queryKey: ['email', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getEmail(dateRange.preset) as Promise<EmailDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.campaigns?.length) return;
    exportToCsv({
      filename: `talentbridge_email_campaigns_${dateRange.preset}`,
      columns: [
        { header: 'Campaign Name', accessor: row => row.campaignName },
        { header: 'Subject Line', accessor: row => row.subjectLine || '' },
        { header: 'Sent Date', accessor: row => row.sentDate },
        { header: 'Sent Count', accessor: row => row.sentCount },
        { header: 'Open Count', accessor: row => row.openCount },
        { header: 'Open Rate (%)', accessor: row => `${row.openPercentage}%` },
        { header: 'Click Count', accessor: row => row.clickCount },
        { header: 'Click Rate (%)', accessor: row => `${row.clickPercentage}%` },
        { header: 'Bounce Count', accessor: row => row.bounceCount },
      ],
      data: data.campaigns,
    });
  };

  const chartData = (data?.campaigns || []).map(c => ({
    name: (c.campaignName || '').length > 16 ? (c.campaignName || '').slice(0, 16) + '…' : (c.campaignName || ''),
    'Open %': c.openPercentage ?? 0,
    'Click %': c.clickPercentage ?? 0,
  }));

  // If a campaign is selected, render its granular drill-down view!
  if (selectedCampaign) {
    return (
      <CampaignDetailView
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  const totalBounces = (data?.campaigns || []).reduce((a, c) => a + (c.bounceCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Email Campaigns
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Open rates, click rates, and bounce data from Mailgun. Click any campaign to explore granular details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="email-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!data?.campaigns?.length}
            className="btn btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: data?.campaigns?.length ? 'pointer' : 'not-allowed',
            }}
            title="Export Email Campaigns to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bounce alert if bounces detected */}
      {data && totalBounces > 15 && (
        <MetricAlertBanner
          severity="warning"
          title="Elevated Email Bounces Detected"
          metricLabel="Total Bounces"
          metricValue={`${totalBounces} across campaigns`}
          message="Deliverability audit recommended to prevent domain sender reputation degradation with Mailgun."
        />
      )}

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (!data.campaigns || data.campaigns.length === 0) ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Mail size={24} color="#2DD4BF" />
          </div>
          <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Email Campaigns Sent Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
            When onboarding or lifecycle emails are delivered through Mailgun, live delivery rates, open percentages, clicks, and bounce logs will stream here.
          </p>
        </div>
      ) : data && data.campaigns && data.campaigns.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Campaigns', value: data.campaigns.length, suffix: '', color: CHART_COLORS.primary, icon: <Inbox size={16} color={CHART_COLORS.primary} /> },
              { label: 'Avg Open Rate', value: data.campaigns.length ? Math.round(data.campaigns.reduce((a, c) => a + (c.openPercentage || 0), 0) / data.campaigns.length) : 0, suffix: '%', color: CHART_COLORS.info, icon: <Mail size={16} color={CHART_COLORS.info} /> },
              { label: 'Avg Click Rate', value: data.campaigns.length ? Math.round(data.campaigns.reduce((a, c) => a + (c.clickPercentage || 0), 0) / data.campaigns.length) : 0, suffix: '%', color: CHART_COLORS.success, icon: <MousePointerClick size={16} color={CHART_COLORS.success} /> },
              { label: 'Total Bounces', value: data.campaigns.reduce((a, c) => a + (c.bounceCount || 0), 0), suffix: '', color: CHART_COLORS.warning, icon: <AlertTriangle size={16} color={CHART_COLORS.warning} /> },
            ].map(card => (
              <div key={card.label} className="stat-card animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </p>
                  {card.icon}
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: card.color, fontFamily: 'Geist, sans-serif' }}>
                  {card.value}{card.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              Open & Click Rates by Campaign
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist' }}
                />
                <Bar dataKey="Open %" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Click %" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top performers & Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  All Campaigns
                </h3>
                <p style={{ fontSize: 12, color: 'var(--faint)' }}>Click any campaign row to explore its link CTRs, recipient logs, and email mockup</p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {(data.topPerformers || []).slice(0, 1).map(p => (
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.campaigns || []).map(c => (
                    <tr
                      key={c.campaignId}
                      onClick={() => setSelectedCampaign(c)}
                      style={{ cursor: 'pointer' }}
                      title="Click to explore campaign details"
                    >
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{c.campaignName}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.subjectLine || c.campaignId}</p>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{formatDate(c.sentDate)}</td>
                      <td style={{ fontFamily: 'Geist Mono, monospace' }}>{formatNumber(c.sentCount)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'Geist Mono, monospace' }}>{c.openPercentage}%</span>
                          <span className="badge badge-info" style={{ fontSize: 11 }}>{formatNumber(c.openCount)}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'Geist Mono, monospace' }}>{formatNumber(c.clickCount)}</td>
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
                      <td>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCampaign(c);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: 12, gap: 4, color: 'var(--accent2)' }}
                        >
                          Explore <ArrowRight size={12} />
                        </button>
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
