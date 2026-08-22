// src/components/SocialMedia/SocialMediaOverview.tsx
// Social Media Analytics Overview Dashboard (Main View under Engagement & Media Tab)

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Clock,
  Layers,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useSocialMediaSummary } from '../../hooks/useSocialMediaSummary';
import { socialMediaApi } from '../../api/socialMediaApi';
import { PlatformCard, LinkedInIcon } from './PlatformCard';
import { SocialMediaTrend } from './SocialMediaTrend';
import { PostDetailModal } from './PostDetailModal';
import { LinkedInDetailedView } from './LinkedInDetailedView';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { SyncStatus } from '../Common/SyncStatus';
import { EmptyState } from '../Common/EmptyState';
import { TimezoneSelector } from '../Common/TimezoneSelector';
import { formatNumber, formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';
import type { SocialMediaPostItem, SocialMediaPostsResponse } from '../../types/socialMedia';


export const SocialMediaOverview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'linkedin'>('overview');
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '7d' });
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('engagement');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPostItem | null>(null);

  // 1. Fetch Summary Data via Hook
  const {
    totalPosts,
    totalEngagement,
    avgEngagementRate,
    topPlatform,
    byPlatform,
    trend,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useSocialMediaSummary(dateRange.preset);

  // 2. Fetch Paginated & Filtered Posts
  const {
    data: postsData,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useQuery<SocialMediaPostsResponse>({
    queryKey: ['social-media-posts', activePlatformFilter, dateRange.preset, sortBy, sortOrder, searchQuery, currentPage],
    queryFn: () =>
      socialMediaApi.getPosts({
        platform: activePlatformFilter,
        dateRange: dateRange.preset,
        sort: sortBy,
        order: sortOrder,
        search: searchQuery,
        page: currentPage,
        limit: 10,
      }),
  });

  const handleExportCsv = () => {

    if (!postsData?.posts?.length) return;
    exportToCsv({
      filename: `talentbridge_social_posts_${dateRange.preset}`,
      columns: [
        { header: 'Platform', accessor: (row) => row.platform },
        { header: 'Content', accessor: (row) => row.content_text },
        { header: 'Posted At', accessor: (row) => row.posted_at },
        { header: 'Status', accessor: (row) => row.buffer_status || 'published' },
        { header: 'Impressions', accessor: (row) => row.latest_engagement?.impressions || 0 },
        { header: 'Reactions/Score', accessor: (row) => row.latest_engagement?.reactions || row.latest_engagement?.score || 0 },
        { header: 'Comments', accessor: (row) => row.latest_engagement?.comments || 0 },
        { header: 'Shares', accessor: (row) => row.latest_engagement?.shares || 0 },
        { header: 'Clicks', accessor: (row) => row.latest_engagement?.clicks || 0 },
        { header: 'Engagement Rate (%)', accessor: (row) => `${row.latest_engagement?.engagement_rate || 0}%` },
      ],
      data: postsData.posts,
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon size={16} color="#0A66C2" />;
      case 'reddit':
        return <MessageSquare size={16} color="#FF4500" />;
      default:
        return <Clock size={16} color="var(--success)" />;
    }
  };

  if (viewMode === 'linkedin') {
    return (
      <LinkedInDetailedView onBack={() => setViewMode('overview')} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Top Header & Action Controls */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
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
              Social Media &amp; Viral Channels
            </h2>
            <span
              className="badge"
              style={{
                background: 'var(--sunset-glow)',
                color: 'var(--sunset)',
                border: '1px solid rgba(250, 82, 15, 0.25)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              Live Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>
            Cross-platform engagement, automated Buffer schedules, LinkedIn UGC, and Reddit viral growth loops.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <SyncStatus platform="all" onSyncCompleted={() => { refetchSummary(); refetchPosts(); }} />
          <TimezoneSelector />
          <DateRangeSelector value={dateRange} onChange={setDateRange} idPrefix="social-date-range" />

          <button
            onClick={handleExportCsv}
            disabled={!postsData?.posts?.length}
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6 }}
            title="Export Posts to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>


      {/* Hero Metric Cards (Top Row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Total Posts */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(13, 148, 136, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Total Posts ({dateRange.preset})
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {isSummaryLoading ? '...' : totalPosts}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <TrendingUp size={12} />
              +14% vs last period
            </span>
          </div>
        </div>

        {/* Total Engagement */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--sunset-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sunset)',
              flexShrink: 0,
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Total Engagement
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {isSummaryLoading ? '...' : formatNumber(totalEngagement)}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2, display: 'block' }}>
              Reactions, comments, shares
            </span>
          </div>
        </div>

        {/* Avg Engagement Rate */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--info)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Avg Engagement Rate
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {isSummaryLoading ? '...' : `${avgEngagementRate}%`}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <CheckCircle2 size={12} />
              Above B2B SaaS average (2.1%)
            </span>
          </div>
        </div>

        {/* Top Performing Platform */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(10, 102, 194, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A66C2',
              flexShrink: 0,
            }}
          >
            <LinkedInIcon size={22} />
          </div>
          <div>

            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Top Channel
            </span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2, textTransform: 'capitalize' }}>
              {isSummaryLoading ? '...' : topPlatform}
            </div>
            <span style={{ fontSize: 11.5, color: '#0A66C2', fontWeight: 600, marginTop: 2, display: 'block' }}>
              4.18% CTR &amp; 342 clicks
            </span>
          </div>
        </div>
      </div>

      {/* Platform Cards (3 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <PlatformCard
          platform="linkedin"
          dataLinkedIn={byPlatform?.linkedin}
          onViewDetails={() => setViewMode('linkedin')}
        />
        <PlatformCard platform="reddit" dataReddit={byPlatform?.reddit} />
        <PlatformCard platform="buffer" dataBuffer={byPlatform?.buffer} />
      </div>


      {/* Engagement Velocity Trend Chart */}
      <SocialMediaTrend data={trend} />

      {/* Recent Posts Table Section */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}
      >
        {/* Table Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
              Cross-Platform Posts &amp; Metrics
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Inspect published updates, scheduled dispatches, link CTRs, and engagement ratios.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--dim)',
                }}
              />
              <input
                type="text"
                placeholder="Search post text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Platform Filter Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: 2,
              }}
            >
              {['all', 'linkedin', 'reddit', 'buffer'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setActivePlatformFilter(p);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: activePlatformFilter === p ? 700 : 500,
                    borderRadius: 'calc(var(--radius-sm) - 2px)',
                    border: 'none',
                    background: activePlatformFilter === p ? 'var(--panel)' : 'transparent',
                    color: activePlatformFilter === p ? 'var(--text)' : 'var(--text-2)',
                    boxShadow: activePlatformFilter === p ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Platform</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Content</th>
                <th
                  onClick={() => toggleSort('recent')}
                  style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Posted / Status</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('impressions')}
                  style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'right' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span>Impressions</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('engagement')}
                  style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'right' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span>Engagement</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('clicks')}
                  style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'right' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span>Clicks</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Rate</th>
              </tr>
            </thead>

            <tbody>
              {isPostsLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading posts...
                    </div>
                  </td>
                </tr>
              ) : !postsData?.posts || postsData.posts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 16 }}>
                    <EmptyState
                      title="No social posts found"
                      description="No posts found matching the selected platform and date filters. Try changing your search query or reset filter."
                      actionLabel="Show All Platforms"
                      onAction={() => {
                        setActivePlatformFilter('all');
                        setSearchQuery('');
                      }}
                    />
                  </td>
                </tr>
              ) : (

                postsData.posts.map((post) => {
                  const eng = post.latest_engagement || {
                    impressions: 0,
                    reactions: 0,
                    comments: 0,
                    shares: 0,
                    clicks: 0,
                    score: 0,
                    engagement_rate: 0,
                  };

                  const isScheduled = post.buffer_status === 'scheduled';

                  return (
                    <tr
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="table-row-hover"
                      style={{
                        borderBottom: '1px solid var(--line)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {getPlatformIcon(post.platform)}
                          <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text)' }}>
                            {post.platform}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', maxWidth: 360 }}>
                        <div
                          style={{
                            color: 'var(--text)',
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {post.content_text}
                        </div>
                        {post.reddit_subreddit && (
                          <span style={{ fontSize: 11, color: '#FF4500', fontWeight: 600 }}>
                            {post.reddit_subreddit}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {isScheduled ? (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: 'var(--warning)',
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 12,
                            }}
                          >
                            Scheduled
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-2)', fontSize: 12 }}>
                            {formatDate(post.posted_at)}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                        {isScheduled ? '-' : formatNumber(eng.impressions)}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                        {isScheduled ? '-' : formatNumber(eng.reactions || eng.score)}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                        {isScheduled ? '-' : eng.clicks}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {isScheduled ? (
                          <span style={{ color: 'var(--dim)' }}>-</span>
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              color: eng.engagement_rate >= 4 ? 'var(--success)' : 'var(--text)',
                            }}
                          >
                            {eng.engagement_rate}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {postsData?.pagination && postsData.pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              fontSize: 13,
              color: 'var(--text-2)',
            }}
          >
            <span>
              Page {postsData.pagination.page} of {postsData.pagination.totalPages} ({postsData.pagination.totalCount} posts)
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn btn-ghost"
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(postsData.pagination.totalPages, p + 1))}
                disabled={!postsData.pagination.hasMore}
                className="btn btn-ghost"
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Inspection Modal */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};
