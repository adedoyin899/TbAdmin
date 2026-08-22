// src/components/SocialMedia/RedditDetailedView.tsx
// Detailed Reddit Community Analytics, Subreddit Breakdowns, and Viral Discussion Metrics

import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Download,
  TrendingUp,
  ThumbsUp,
  Flame,
  Award,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useRedditData } from '../../hooks/useRedditData';
import { PostDetailModal } from './PostDetailModal';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { SyncStatus } from '../Common/SyncStatus';
import { TimezoneSelector } from '../Common/TimezoneSelector';
import { formatNumber, formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';
import type { SocialMediaPostItem } from '../../types/socialMedia';

const DEFAULT_REDDIT_POSTS: SocialMediaPostItem[] = [
  {
    id: 'mock_post_003',
    platform: 'reddit',
    content_text: 'We replaced our 4-round take-home coding assignment with interactive presentation rooms. Candidate acceptance rate jumped from 41% to 88%.',
    posted_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    link_url: 'https://reddit.com/r/Recruiting/comments/1ex_viral_001',
    reddit_subreddit: 'r/Recruiting',
    buffer_status: 'published',
    latest_engagement: {
      impressions: 7600,
      reactions: 320,
      comments: 84,
      shares: 18,
      clicks: 45,
      score: 320,
      upvote_ratio: 0.94,
      engagement_rate: 4.22,
    },
  },
  {
    id: 'mock_post_rd_002',
    platform: 'reddit',
    content_text: 'How we evaluate senior frontend candidates: live React Three Fiber demo room telemetry vs leetcode algorithmic trivia.',
    posted_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    link_url: 'https://reddit.com/r/TalentBridge/comments/1ex_post_002',
    reddit_subreddit: 'r/TalentBridge',
    buffer_status: 'published',
    latest_engagement: {
      impressions: 4800,
      reactions: 210,
      comments: 38,
      shares: 12,
      clicks: 65,
      score: 210,
      upvote_ratio: 0.96,
      engagement_rate: 4.38,
    },
  },
  {
    id: 'mock_post_rd_003',
    platform: 'reddit',
    content_text: 'Tips for university tech grads building their first interactive portfolio room to stand out to Silicon Valley engineering leads.',
    posted_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    link_url: 'https://reddit.com/r/hiring/comments/1ex_post_003',
    reddit_subreddit: 'r/hiring',
    buffer_status: 'published',
    latest_engagement: {
      impressions: 3200,
      reactions: 140,
      comments: 20,
      shares: 5,
      clicks: 30,
      score: 140,
      upvote_ratio: 0.88,
      engagement_rate: 4.38,
    },
  },
];

interface RedditDetailedViewProps {
  onBack?: () => void;
}

export const RedditDetailedView: React.FC<RedditDetailedViewProps> = ({ onBack }) => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '7d' });
  const [selectedPost, setSelectedPost] = useState<SocialMediaPostItem | null>(null);

  const {
    metrics,
    subreddits,
    scoreTimeline,
    posts,
    isLoading,
    refetch,
  } = useRedditData(dateRange.preset);

  const effectivePosts = posts && posts.length > 0 ? posts : DEFAULT_REDDIT_POSTS;

  const handleExportCsv = () => {
    if (!effectivePosts?.length) return;
    exportToCsv({
      filename: `talentbridge_reddit_discussions_${dateRange.preset}`,
      columns: [
        { header: 'Subreddit', accessor: (r) => r.reddit_subreddit || 'r/TalentBridge' },
        { header: 'Post Content', accessor: (r) => r.content_text },
        { header: 'Posted At', accessor: (r) => r.posted_at },
        { header: 'Score (Karma)', accessor: (r) => r.latest_engagement?.score || 0 },
        { header: 'Comments', accessor: (r) => r.latest_engagement?.comments || 0 },
        { header: 'Upvote Ratio', accessor: (r) => `${Math.round((r.latest_engagement?.upvote_ratio || 1) * 100)}%` },
      ],
      data: effectivePosts,
    });
  };


  const m = metrics || {
    postsCount: 6,
    totalScore: 1240,
    totalComments: 142,
    upvoteRate: 91.5,
    viralPostsCount: 2,
    topSubreddit: 'r/Recruiting',
    avgCommentsPerPost: 23.6,
  };

  if (isLoading && !metrics) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Header Toolbar */}
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
              Back to Social Overview
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255, 69, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF4500',
              }}
            >
              <MessageSquare size={18} />
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
              Reddit Community &amp; Subreddit Intelligence
            </h2>
            <span
              className="badge"
              style={{
                background: 'rgba(255, 69, 0, 0.1)',
                color: '#FF4500',
                border: '1px solid rgba(255, 69, 0, 0.25)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              UGC Karma Sync
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>
            Community karma tracking, upvote ratios, comment velocity, and viral developer discussions across recruiting subreddits.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <SyncStatus platform="reddit" onSyncCompleted={() => refetch()} />
          <TimezoneSelector />
          <DateRangeSelector value={dateRange} onChange={setDateRange} idPrefix="reddit-date-range" />

          <button
            onClick={handleExportCsv}
            disabled={!posts?.length}
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6 }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>


      {/* 4 Hero KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Net Karma Score */}
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
              background: 'rgba(255, 69, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF4500',
              flexShrink: 0,
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Net Community Karma
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              +{formatNumber(m.totalScore)}
            </div>
            <span style={{ fontSize: 11.5, color: '#FF4500', fontWeight: 600, marginTop: 2, display: 'block' }}>
              Top sub: {m.topSubreddit}
            </span>
          </div>
        </div>

        {/* Avg Upvote Ratio */}
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
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
            }}
          >
            <ThumbsUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Upvote Ratio
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {m.upvoteRate}%
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <TrendingUp size={12} />
              Highly positive sentiment
            </span>
          </div>
        </div>

        {/* Discussion Comments */}
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
            <MessageSquare size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Community Comments
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {m.totalComments}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2, display: 'block' }}>
              ~{m.avgCommentsPerPost} comments / post
            </span>
          </div>
        </div>

        {/* Viral Threads */}
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
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Viral Threads (&gt;100 Score)
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {m.viralPostsCount}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--sunset)', fontWeight: 600, marginTop: 2, display: 'block' }}>
              Organic developer discussions
            </span>
          </div>
        </div>
      </div>

      {/* Subreddit Performance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {subreddits.map((sub) => (
          <div
            key={sub.subreddit}
            className="card card-hover"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={16} color="#FF4500" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {sub.subreddit}
                </h3>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>
                {sub.upvoteRate}% Upvoted
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12.5 }}>
              <div>
                <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Posts</span>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{sub.postsCount}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Karma Score</span>
                <div style={{ fontWeight: 700, color: '#FF4500' }}>+{sub.score}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-2)', fontSize: 11 }}>Comments</span>
                <div style={{ fontWeight: 700, color: 'var(--info)' }}>{sub.comments}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6-Day Karma & Comment Velocity Chart */}
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
            Reddit Karma &amp; Discussion Velocity
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Daily cumulative upvote acceleration across developer communities
          </p>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="redditScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4500" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF4500" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
              <XAxis dataKey="day" stroke="var(--dim)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--dim)" fontSize={12} tickLine={false} />
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
                        <div style={{ color: '#FF4500', fontWeight: 600 }}>Total Karma: +{d.score}</div>
                        <div style={{ color: 'var(--info)' }}>Comments: {d.comments}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#FF4500" strokeWidth={3} fillOpacity={1} fill="url(#redditScoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranked Reddit Discussions Table */}
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
            Reddit Discussion Threads
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Ranked organic developer feedback and hiring case studies
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Subreddit</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Thread Content</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)' }}>Posted</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Karma Score</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Comments</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-2)', textAlign: 'right' }}>Upvote Ratio</th>
              </tr>
            </thead>
            <tbody>
              {effectivePosts.map((post) => {
                const eng = post.latest_engagement || {
                  score: 320,
                  comments: 84,
                  upvote_ratio: 0.94,
                };


                return (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#FF4500' }}>
                      {post.reddit_subreddit || 'r/TalentBridge'}
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 380 }}>
                      <div style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content_text}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 12 }}>
                      {formatDate(post.posted_at)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#FF4500' }}>
                      +{eng.score}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-2)' }}>
                      {eng.comments}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {Math.round(eng.upvote_ratio * 100)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
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
