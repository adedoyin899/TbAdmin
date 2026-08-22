import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Mail, MousePointerClick, AlertTriangle, Trophy,
  Inbox, ArrowRight, Download, Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { EmailDashboardResponse, EmailCampaign } from '../../types';
import { formatNumber, formatDate } from '../../utils/formatters';
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

  // If a campaign is selected, render its granular drill-down view
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
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Email Campaigns &amp; Deliverability
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Open rates, link CTRs, and deliverability health logs from Mailgun dispatch stream.
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
              fontSize: 13,
              gap: 6,
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
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load email analytics data.</div>}

      {data && (!data.campaigns || data.campaigns.length === 0) ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <Mail size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Email Campaigns Sent Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            When onboarding or lifecycle emails are delivered through Mailgun, live delivery rates, open percentages, clicks, and bounce logs will stream here.
          </p>
        </div>
      ) : data && data.campaigns && data.campaigns.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { label: 'Total Campaigns', value: data.campaigns.length, suffix: '', color: 'var(--text)', icon: <Inbox size={16} color="var(--accent)" /> },
              { label: 'Avg Open Rate', value: data.campaigns.length ? Math.round(data.campaigns.reduce((a, c) => a + (c.openPercentage || 0), 0) / data.campaigns.length) : 0, suffix: '%', color: '#3B82F6', icon: <Mail size={16} color="#3B82F6" /> },
              { label: 'Avg Click Rate', value: data.campaigns.length ? Math.round(data.campaigns.reduce((a, c) => a + (c.clickPercentage || 0), 0) / data.campaigns.length) : 0, suffix: '%', color: 'var(--accent)', icon: <MousePointerClick size={16} color="var(--accent)" /> },
              { label: 'Total Bounces', value: data.campaigns.reduce((a, c) => a + (c.bounceCount || 0), 0), suffix: '', color: totalBounces > 0 ? '#EF4444' : 'var(--text)', icon: <AlertTriangle size={16} color={totalBounces > 0 ? '#EF4444' : 'var(--dim)'} /> },
            ].map(card => (
              <div key={card.label} className="stat-card animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                    {card.label}
                  </p>
                  {card.icon}
                </div>
                <p className="mono-metric" style={{ fontSize: 30, fontWeight: 800, color: card.color }}>
                  {card.value}{card.suffix}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card-mistral">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Open &amp; Click Rates by Campaign
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>
                  Direct engagement comparison across broadcast batches
                </p>
              </div>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>
                <Sparkles size={12} /> Metric Comparison
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11.5, fontFamily: 'Geist' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                />
                <Bar dataKey="Open %" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Click %" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top performers & Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  All Campaigns
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Click any campaign row to explore its link CTRs, recipient logs, and email preview</p>
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
                      className="hover:bg-[var(--panel-2)] transition-colors"
                      title="Click to explore campaign details"
                    >
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13.5 }}>{c.campaignName}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{c.subjectLine || c.campaignId}</p>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{formatDate(c.sentDate)}</td>
                      <td className="mono-metric" style={{ fontWeight: 700 }}>{formatNumber(c.sentCount)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="mono-metric">{c.openPercentage}%</span>
                          <span className="badge badge-neutral mono-metric" style={{ fontSize: 11 }}>{formatNumber(c.openCount)}</span>
                        </div>
                      </td>
                      <td className="mono-metric" style={{ fontWeight: 700 }}>{formatNumber(c.clickCount)}</td>
                      <td>
                        <span
                          className={`badge mono-metric ${c.clickPercentage >= 15 ? 'badge-success' : c.clickPercentage >= 10 ? 'badge-warning' : 'badge-error'}`}
                        >
                          {c.clickPercentage}%
                        </span>
                      </td>
                      <td>
                        {c.bounceCount > 0
                          ? <span className="badge badge-error mono-metric">{c.bounceCount}</span>
                          : <span style={{ color: 'var(--dim)' }}>—</span>}
                      </td>
                      <td>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCampaign(c);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11.5, gap: 4 }}
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
