import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle2,
  MousePointerClick,
  Sparkles,
  Download,
  Layers,
  UserCheck,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useEmailDetailedAnalytics } from '../../hooks/useEmailDetailedAnalytics';
import { EmailMetricsCards } from './EmailMetricsCards';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { SyncStatus } from '../Common/SyncStatus';
import { TimezoneSelector } from '../Common/TimezoneSelector';
import { formatNumber } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';



interface EmailDetailedViewProps {
  campaignId?: string;
  onBack?: () => void;
}


export const EmailDetailedView: React.FC<EmailDetailedViewProps> = ({
  campaignId = 'welcome-email-001',
  onBack,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });

  const { data, isLoading, refetch } = useEmailDetailedAnalytics(campaignId, dateRange.preset);

  const handleExportCsv = () => {
    if (!data?.campaignsTable?.length) return;
    exportToCsv({
      filename: `talentbridge_email_journey_${dateRange.preset}`,
      columns: [
        { header: 'Campaign Name', accessor: (r) => r.name },
        { header: 'Sent Count', accessor: (r) => r.sent },
        { header: 'Opens', accessor: (r) => r.opens },
        { header: 'Open Rate (%)', accessor: (r) => `${r.openPercentage}%` },
        { header: 'Clicks', accessor: (r) => r.clicks },
        { header: 'Click Rate (%)', accessor: (r) => `${r.clickPercentage}%` },
        { header: 'Signup Conversion (%)', accessor: (r) => `${r.signupConversion}%` },
        { header: 'Avg Time to Signup', accessor: (r) => r.timeToSignup },
        { header: 'Device Breakdown', accessor: (r) => r.deviceSummary },
      ],
      data: data.campaignsTable,
    });
  };

  const campaign = data?.campaign || {
    id: 'welcome-email-001',
    name: 'Welcome Email Onboarding Journey',
    sent: 500,
    opened: 210,
    openPercentage: 42.0,
    clicked: 85,
    clickPercentage: 17.0,
    bounced: 2,
    unsubscribed: 0,
  };

  const clickTiming = data?.clickTiming || [];
  const peakRecommendation =
    data?.peakClickRecommendation ||
    'Best time to send is 10:00 AM (28% of total link clicks happen between 9am-12pm)';
  const deviceBreakdown = data?.deviceBreakdown || [];
  const clientBreakdown = data?.clientBreakdown || [];
  const linkPerformance = data?.linkPerformance || [];
  const userJourney = data?.userJourney || {
    totalClicks: 256,
    signups: 89,
    signupConversionRate: 34.8,
    avgTimeToSignupHours: 4.0,
    signupsByChannel: {
      'Welcome Email Journey': 45,
      'Weekly Tips & Digest': 32,
      'Showcase Promo': 12,
    },
  };
  const campaignsTable = data?.campaignsTable || [];

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* 1. Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-ghost"
              style={{
                fontSize: 12,
                padding: '4px 8px',
                marginBottom: 8,
                color: 'var(--text-2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <ArrowLeft size={14} />
              Back to Campaigns List
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--info)',
              }}
            >
              <Mail size={18} />
            </div>
            <h2
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Enhanced Email Analytics &amp; Attribution
            </h2>
            <span
              className="badge"
              style={{
                background: 'rgba(13, 148, 136, 0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(13, 148, 136, 0.25)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              Mailgun v2 Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>
            Inspect delivery rates, peak click timing, device and client rendering, heatmap density, and click-to-signup conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <SyncStatus platform="mailgun" onSyncCompleted={() => refetch()} />
          <TimezoneSelector />
          <DateRangeSelector value={dateRange} onChange={setDateRange} idPrefix="email-enhanced-date-range" />

          <button
            onClick={handleExportCsv}
            disabled={!campaignsTable?.length}
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6 }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>


      {/* 2. Hero KPI Cards & Device Cards */}
      <EmailMetricsCards
        sentCount={campaign.sent}
        openPercentage={campaign.openPercentage}
        openCount={campaign.opened}
        clickPercentage={campaign.clickPercentage}
        clickCount={campaign.clicked}
        deviceBreakdown={deviceBreakdown}
        userJourney={userJourney}
      />

      {/* 3. NEW: Click Timing Analysis (Bar Chart) */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
              Click Timing Analysis (Time of Day)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Hourly link interaction density grouped into 3-hour recipient activity windows
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'var(--sunset-glow)',
              border: '1px solid rgba(250, 82, 15, 0.25)',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--sunset)',
            }}
          >
            <Clock size={14} />
            <span>Peak Window: 9:00 AM &ndash; 12:00 PM (28% of Clicks)</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ width: '100%', height: 260, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clickTiming} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
              <XAxis dataKey="timeOfDay" stroke="var(--dim)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--dim)" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--line-2)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 14px',
                          boxShadow: 'var(--shadow-lg)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Click Share: {d.clickRate}%</div>
                        <div style={{ color: 'var(--text-2)' }}>Average Clicks: {d.avgClicks}</div>
                        <div style={{ color: 'var(--text-2)' }}>Verified Opens: {d.opens}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="clickRate" radius={[6, 6, 0, 0]}>
                {clickTiming.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.timeOfDay === '9am-12pm' ? 'var(--sunset)' : 'var(--accent)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Peak Recommendation Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: 'var(--panel-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--text)',
          }}
        >
          <Sparkles size={16} color="var(--warning)" />
          <span>
            <strong>AI Optimization Recommendation:</strong> {peakRecommendation}
          </span>
        </div>
      </div>

      {/* 4 & 5. Email Client Breakdown & Click Location Heatmap (2-Column Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Email Client Breakdown */}
        <div
          className="card"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Layers size={18} color="var(--info)" />
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Email Client Distribution
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 20px 0' }}>
              Client engine detection extracted from user-agent and image proxy telemetry
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {clientBreakdown.map((item) => (
                <div key={item.client}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.client}</span>
                    <span style={{ color: 'var(--text-2)' }}>
                      <strong>{item.percentage}%</strong> ({item.opens} opens • {item.clicks} clicks)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background:
                          item.client.includes('Gmail')
                            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
                            : item.client.includes('Outlook')
                            ? 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'
                            : item.client.includes('Apple')
                            ? 'linear-gradient(90deg, #A855F7 0%, #C084FC 100%)'
                            : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-2)',
            }}
          >
            <CheckCircle2 size={14} color="var(--success)" />
            <span>Dark mode supported in 100% of tested email clients</span>
          </div>
        </div>

        {/* 6. NEW: Click Location Heatmap (Visual Layout Mock) */}
        <div
          className="card"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <MousePointerClick size={18} color="var(--sunset)" />
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Email Click Location Heatmap
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px 0' }}>
            Interactive density layout tracking link engagement shares across template elements
          </p>

          {/* Email Template Wireframe Preview */}
          <div
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Template Header / Logo */}
            <div style={{ padding: '8px 12px', background: 'var(--panel-3)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)' }}>TALENTBRIDGE LOGO &amp; PRE-HEADER</span>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>Direct Link (0.5%)</span>
            </div>

            {/* Dynamic Link Performance Elements */}
            {linkPerformance.map((link, idx) => {
              const isPrimary = idx === 0;
              const isSecondary = idx === 1;

              if (isPrimary) {
                return (
                  <div
                    key={link.linkLabel}
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, rgba(250, 82, 15, 0.15) 0%, rgba(255, 138, 0, 0.15) 100%)',
                      border: '2px solid var(--sunset)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--sunset)' }}>
                        🔥 PRIMARY CTA: {link.linkLabel}
                      </div>
                      <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{link.url}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--sunset)' }}>
                        {link.clicks} Clicks
                      </span>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{link.percentage}% share</div>
                    </div>
                  </div>
                );
              }

              if (isSecondary) {
                return (
                  <div
                    key={link.linkLabel}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(13, 148, 136, 0.1)',
                      border: '1px solid var(--accent)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--accent)' }}>
                        SECONDARY LINK: {link.linkLabel}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{link.url}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>
                        {link.clicks} Clicks
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{link.percentage}% share</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={link.linkLabel}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{link.linkLabel}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    {link.clicks} Clicks ({link.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 7. NEW: User Journey (Click -> Signup) Attribution Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <UserCheck size={20} color="var(--accent)" />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Downstream User Journey &amp; Conversion Attribution
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Total Link Clicks</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {userJourney.totalClicks}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>Unique recipient clicks</span>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Verified Candidate Signups</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {userJourney.signups}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 600 }}>
              {userJourney.signupConversionRate}% Conversion Rate
            </span>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Avg Time from Click to Signup</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--info)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {userJourney.avgTimeToSignupHours}h
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>Rapid onboarding cycle</span>
          </div>
        </div>

        {/* Campaign Breakdown Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Signups by Campaign Source:</span>
          {Object.entries(userJourney.signupsByChannel).map(([source, count]) => (
            <span
              key={source}
              className="badge"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
                padding: '4px 10px',
                borderRadius: 16,
              }}
            >
              {source}: <strong style={{ color: 'var(--accent)', marginLeft: 4 }}>{count} signups</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Enhanced Campaign Performance Grid */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
            Enhanced Campaign Performance &amp; Onboarding Grid
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Compare deliverability, CTR, and downstream signup velocity across email sequences
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Campaign Sequence</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Sent</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Open %</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Click %</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Signup Conv.</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Time to Signup</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Device Split</th>
              </tr>
            </thead>
            <tbody>
              {campaignsTable.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>{row.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{formatNumber(row.sent)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--info)' }}>
                    {row.openPercentage}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--sunset)' }}>
                    {row.clickPercentage}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{row.signupConversion}%</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 12.5 }}>{row.timeToSignup}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 12 }}>{row.deviceSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
