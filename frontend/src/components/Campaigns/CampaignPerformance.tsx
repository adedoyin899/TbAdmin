import React, { useState } from 'react';
import {
  ArrowLeft,
  Target,
  DollarSign,
  Users,
  MousePointerClick,
  Sparkles,
  Download,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';


import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useCampaignPerformance } from '../../hooks/useCampaignPerformance';
import { LinkedInIcon } from '../SocialMedia/PlatformCard';
import { PostDetailModal } from '../SocialMedia/PostDetailModal';
import { SyncStatus } from '../Common/SyncStatus';
import { formatNumber, formatDate } from '../../utils/formatters';
import { exportCampaignCsvReport } from '../../utils/exportCampaignReport';
import { exportToCsv } from '../../utils/exportCsv';
import type { SocialMediaPostItem } from '../../types/socialMedia';


interface CampaignPerformanceProps {
  campaignId: string;
  onBack?: () => void;
}


export const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({
  campaignId,
  onBack,
}) => {
  const [selectedPost, setSelectedPost] = useState<SocialMediaPostItem | null>(null);

  const {
    currentCampaign,
    performance,
    byChannel,
    timeline,
    posts,
    isLoading,
    refetchPerformance,
  } = useCampaignPerformance(campaignId);

  const handleExportCsv = () => {
    if (!posts?.length) return;
    exportToCsv({
      filename: `talentbridge_${campaignId}_performance`,
      columns: [
        { header: 'Platform', accessor: (r) => r.platform },
        { header: 'Post Content', accessor: (r) => r.content_text },
        { header: 'Posted At', accessor: (r) => r.posted_at },
        { header: 'Impressions', accessor: (r) => r.latest_engagement?.impressions || 0 },
        { header: 'Reactions', accessor: (r) => r.latest_engagement?.reactions || 0 },
        { header: 'Clicks', accessor: (r) => r.latest_engagement?.clicks || 0 },
        { header: 'Engagement Rate (%)', accessor: (r) => `${r.latest_engagement?.engagement_rate || 0}%` },
      ],
      data: posts,
    });
  };

  const camp = currentCampaign || {
    id: campaignId,
    name: 'Q3 Product Launch (Showcase Rooms)',
    goal: 'signups',
    channels: ['email', 'linkedin', 'reddit'],
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    budget: 1500,
    spend: 1500,
    status: 'active',
    target_audience: 'Hiring Managers & Frontend Engineers',
    created_by: 'peter@talentbridge.cv',
  };

  const perf = performance || {
    total_reach: 28000,
    total_impressions: 35000,
    total_engagement: 1200,
    avg_engagement_rate: 4.3,
    total_clicks: 340,
    total_signups: 45,
    signup_conversion_rate: 13.24,
    spend: 1500,
    cpc: 4.41,
    cps: 33.33,
    roi: 0.03,
  };

  const emailMetrics = byChannel?.email || {
    channel: 'email',
    reach: 4500,
    impressions: 4500,
    engagement: 1615,
    engagement_rate: 35.9,
    clicks: 85,
    signups: 18,
    conversion_rate: 21.18,
  };

  const linkedinMetrics = byChannel?.linkedin || {
    channel: 'linkedin',
    reach: 18000,
    impressions: 22500,
    engagement: 940,
    engagement_rate: 4.18,
    clicks: 195,
    signups: 22,
    conversion_rate: 11.28,
  };

  const redditMetrics = byChannel?.reddit || {
    channel: 'reddit',
    reach: 7600,
    impressions: 8000,
    engagement: 320,
    engagement_rate: 4.22,
    clicks: 60,
    signups: 5,
    conversion_rate: 8.33,
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon size={16} color="#0A66C2" />;
      case 'reddit':
        return <MessageSquare size={16} color="#FF4500" />;
      case 'email':
        return <Mail size={16} color="var(--info)" />;
      default:
        return <Clock size={16} color="var(--success)" />;
    }
  };

  if (isLoading && !performance) {

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* 1. Campaign Header */}
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
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--sunset-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sunset)',
              }}
            >
              <Target size={20} />
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
              {camp.name}
            </h2>
            <span
              className="badge"
              style={{
                background:
                  camp.status === 'active'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(59, 130, 246, 0.12)',
                color: camp.status === 'active' ? 'var(--success)' : 'var(--info)',
                border: `1px solid ${camp.status === 'active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                textTransform: 'capitalize',
              }}
            >
              {camp.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} />
              {formatDate(camp.start_date)} &ndash; {camp.end_date ? formatDate(camp.end_date) : 'Ongoing'}
            </span>
            <span>&bull;</span>
            <span style={{ textTransform: 'capitalize' }}>
              Goal: <strong style={{ color: 'var(--text)' }}>{camp.goal}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Budget: <strong style={{ color: 'var(--text)' }}>${formatNumber(camp.spend || camp.budget || 0)}</strong>
              {camp.budget ? ` / $${formatNumber(camp.budget)}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <SyncStatus platform="all" onSyncCompleted={() => refetchPerformance()} />

          <button
            onClick={() => {
              if (camp && perf) {
                exportCampaignCsvReport({
                  campaign: camp,
                  performance: {
                    ...perf,
                    by_channel: byChannel || {},
                    timeline: timeline || [],
                  },
                  posts: posts,
                });

              } else {
                handleExportCsv();
              }
            }}
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6 }}
            title="Export Full Campaign Performance Report to CSV"
          >
            <Download size={14} />
            Export Report
          </button>

        </div>
      </div>


      {/* 2. 5 Hero KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {/* Total Reach */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>
            <Users size={14} color="var(--info)" />
            <span>Total Campaign Reach</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(perf.total_reach)}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4, display: 'block' }}>
            {formatNumber(perf.total_impressions)} cross-channel views
          </span>
        </div>

        {/* Avg Engagement Rate */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>
            <Sparkles size={14} color="var(--success)" />
            <span>Avg Engagement Rate</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {perf.avg_engagement_rate}%
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 4, display: 'block', fontWeight: 600 }}>
            {formatNumber(perf.total_engagement)} interactions
          </span>
        </div>

        {/* Total Clicks */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>
            <MousePointerClick size={14} color="var(--sunset)" />
            <span>Showcase Link Clicks</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(perf.total_clicks)}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4, display: 'block' }}>
            Direct traffic referrals
          </span>
        </div>

        {/* Total Signups */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>
            <CheckCircle2 size={14} color="var(--accent)" />
            <span>Candidate Signups</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Sora, sans-serif' }}>
            {perf.total_signups}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 4, display: 'block', fontWeight: 600 }}>
            {perf.signup_conversion_rate}% Conversion
          </span>
        </div>

        {/* Cost Per Signup / ROI */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>
            <DollarSign size={14} color="var(--warning)" />
            <span>Cost Per Signup (CPS)</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            ${perf.cps || (perf.spend > 0 ? (perf.spend / perf.total_signups).toFixed(2) : '0.00')}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4, display: 'block' }}>
            ${perf.cpc} CPC &bull; ${formatNumber(perf.spend)} spend
          </span>
        </div>
      </div>

      {/* 3. By-Channel Breakdown Cards (3 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Email Channel Card */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                <Mail size={16} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Email Sequences
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--info)', fontWeight: 700 }}>
              {emailMetrics.conversion_rate}% Conv.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Delivered Reach</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{formatNumber(emailMetrics.reach)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Open Rate</span>
              <div style={{ fontWeight: 700, color: 'var(--info)' }}>{emailMetrics.engagement_rate}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Link Clicks</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{emailMetrics.clicks}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Candidate Signups</span>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>{emailMetrics.signups}</div>
            </div>
          </div>
        </div>

        {/* LinkedIn Channel Card */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(10, 102, 194, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A66C2',
                }}
              >
                <LinkedInIcon size={16} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                LinkedIn Organic
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: '#0A66C2', fontWeight: 700 }}>
              {linkedinMetrics.conversion_rate}% Conv.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Impressions</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{formatNumber(linkedinMetrics.reach)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Engagement Rate</span>
              <div style={{ fontWeight: 700, color: '#0A66C2' }}>{linkedinMetrics.engagement_rate}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Link Clicks</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{linkedinMetrics.clicks}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Candidate Signups</span>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>{linkedinMetrics.signups}</div>
            </div>
          </div>
        </div>

        {/* Reddit Channel Card */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 69, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF4500',
                }}
              >
                <MessageSquare size={16} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Reddit Community
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: '#FF4500', fontWeight: 700 }}>
              {redditMetrics.conversion_rate}% Conv.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Community Views</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{formatNumber(redditMetrics.reach)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Engagement Rate</span>
              <div style={{ fontWeight: 700, color: '#FF4500' }}>{redditMetrics.engagement_rate}%</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Link Clicks</span>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{redditMetrics.clicks}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Candidate Signups</span>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>{redditMetrics.signups}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Performance Timeline (Composed Chart: Area + Cumulative Line) */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
            Daily Reach Progression &amp; Cumulative Signups
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Track cross-channel reach acceleration overlaid against candidate onboarding conversion
          </p>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="campReachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
              <XAxis dataKey="day" stroke="var(--dim)" fontSize={12} tickLine={false} />
              <YAxis yAxisId="left" stroke="var(--dim)" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--dim)" fontSize={12} tickLine={false} />
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
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Daily Reach: {formatNumber(d.reach)}</div>
                        <div style={{ color: 'var(--sunset)', fontWeight: 600 }}>Engagement: {formatNumber(d.engagement)}</div>
                        <div style={{ color: 'var(--success)', fontWeight: 700 }}>Cumulative Signups: {d.cumulative_signups}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="reach" name="Total Reach" stroke="var(--accent)" fillOpacity={1} fill="url(#campReachGrad)" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative_signups" name="Cumulative Signups" stroke="var(--sunset)" strokeWidth={3} dot={{ r: 4, fill: 'var(--sunset)' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Top Posts Table */}
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
            Top Performing Campaign Posts
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Ranked updates tagged to this campaign across LinkedIn and Reddit
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Platform</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Post Content</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Posted</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Engagement</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Clicks</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const eng = post.latest_engagement || {
                  impressions: 4200,
                  reactions: 156,
                  comments: 23,
                  shares: 10,
                  clicks: 45,
                  engagement_rate: 4.5,
                };

                return (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getPlatformIcon(post.platform)}
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text)' }}>
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 360 }}>
                      <div style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content_text}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 12 }}>
                      {formatDate(post.posted_at)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                      {formatNumber(eng.reactions || eng.impressions || 0)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                      {eng.clicks}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {eng.engagement_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Performance Breakdown Table */}
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
            Channel Conversion Breakdown
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Side-by-side multi-touch attribution metrics across email sequences and organic social
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Channel</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Reach / Views</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Engagement</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Clicks</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Signups</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={16} color="var(--info)" />
                    <span>Email Campaigns</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{formatNumber(emailMetrics.reach)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--info)' }}>{emailMetrics.engagement_rate}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{emailMetrics.clicks}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{emailMetrics.signups}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{emailMetrics.conversion_rate}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LinkedInIcon size={16} />
                    <span>LinkedIn Organic</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{formatNumber(linkedinMetrics.reach)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0A66C2' }}>{linkedinMetrics.engagement_rate}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{linkedinMetrics.clicks}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{linkedinMetrics.signups}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{linkedinMetrics.conversion_rate}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={16} color="#FF4500" />
                    <span>Reddit Community</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{formatNumber(redditMetrics.reach)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#FF4500' }}>{redditMetrics.engagement_rate}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text)' }}>{redditMetrics.clicks}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{redditMetrics.signups}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{redditMetrics.conversion_rate}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Detail Inspection Modal */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

