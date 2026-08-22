// src/components/SocialMedia/PlatformCard.tsx
// Reusable summary card component for LinkedIn, Reddit, and Buffer platforms

import React from 'react';
import {
  MessageSquare,
  Clock,
  TrendingUp,
  MousePointerClick,
  Users,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import type {
  PlatformMetricsLinkedIn,
  PlatformMetricsBuffer,
  PlatformMetricsReddit,
} from '../../types/socialMedia';
import { formatNumber } from '../../utils/formatters';

export const LinkedInIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#0A66C2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


interface PlatformCardProps {
  platform: 'linkedin' | 'reddit' | 'buffer';
  dataLinkedIn?: PlatformMetricsLinkedIn;
  dataReddit?: PlatformMetricsReddit;
  dataBuffer?: PlatformMetricsBuffer;
  onViewDetails?: () => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  dataLinkedIn,
  dataReddit,
  dataBuffer,
  onViewDetails,
}) => {
  if (platform === 'linkedin') {
    const d = dataLinkedIn || {
      posts: 12,
      impressions: 8420,
      engagement: 345,
      engagementRate: 4.1,
      clicks: 342,
      followersAdded: 24,
    };

    return (
      <div
        className="card card-hover"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #0A66C2 0%, #00A0DC 100%)',
          }}
        />

        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(10, 102, 194, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A66C2',
                }}
              >
                <LinkedInIcon size={20} />
              </div>
              <div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  LinkedIn Organic
                </h3>
                <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>Company Page &amp; UGC</span>
              </div>
            </div>

            <span
              className="badge"
              style={{
                background: 'rgba(10, 102, 194, 0.1)',
                color: '#0A66C2',
                border: '1px solid rgba(10, 102, 194, 0.25)',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              Top Reach
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <Layers size={13} />
                <span>Posts Published</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.posts}
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <TrendingUp size={13} color="var(--accent)" />
                <span>Impressions</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {formatNumber(d.impressions)}
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <Sparkles size={13} color="var(--warning)" />
                <span>Engagement Rate</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.engagementRate}%
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <MousePointerClick size={13} color="var(--sunset)" />
                <span>Link Clicks</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.clicks}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info & Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--line)',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)' }}>
            <Users size={14} />
            <span>+{d.followersAdded} new followers</span>
          </div>

          {onViewDetails && (
            <button
              onClick={onViewDetails}
              style={{
                background: 'none',
                border: 'none',
                color: '#0A66C2',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: 0,
              }}
            >
              Details
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (platform === 'reddit') {
    const d = dataReddit || {
      posts: 5,
      score: 1240,
      comments: 142,
      upvoteRate: 78,
    };

    return (
      <div
        className="card card-hover"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #FF4500 0%, #FF8700 100%)',
          }}
        />

        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 69, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF4500',
                }}
              >
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Reddit Communities
                </h3>
                <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>r/Recruiting, r/TalentBridge</span>
              </div>
            </div>

            <span
              className="badge"
              style={{
                background: 'rgba(255, 69, 0, 0.1)',
                color: '#FF4500',
                border: '1px solid rgba(255, 69, 0, 0.25)',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              High Viral Potential
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <Layers size={13} />
                <span>Posts Tracked</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.posts}
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <TrendingUp size={13} color="#FF4500" />
                <span>Net Karma / Score</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {formatNumber(d.score)}
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <MessageSquare size={13} color="var(--info)" />
                <span>Comments</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.comments}
              </div>
            </div>

            <div
              style={{
                background: 'var(--panel-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
                <Sparkles size={13} color="var(--success)" />
                <span>Upvote Ratio</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {d.upvoteRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info & Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--line)',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)' }}>
            <Sparkles size={14} color="#FF4500" />
            <span>2 viral threads (&gt;100 score)</span>
          </div>


          {onViewDetails && (
            <button
              onClick={onViewDetails}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF4500',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: 0,
              }}
            >
              Details
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Buffer Card
  const d = dataBuffer || {
    scheduledPosts: 8,
    nextPostTime: 'In 2 hours',
    platforms: ['LinkedIn', 'Reddit', 'Twitter'],
    publishedPosts: 22,
  };

  return (
    <div
      className="card card-hover"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Gradient Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)',
        }}
      />

      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Buffer Queue
              </h3>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>Automated Multichannel Dispatch</span>
            </div>
          </div>

          <span
            className="badge"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 20,
            }}
          >
            Queue Active
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              background: 'var(--panel-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
              <Clock size={13} color="var(--warning)" />
              <span>In Schedule Queue</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
              {d.scheduledPosts} posts
            </div>
          </div>

          <div
            style={{
              background: 'var(--panel-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
              <Layers size={13} color="var(--info)" />
              <span>Published (30d)</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
              {d.publishedPosts || 22}
            </div>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              background: 'var(--panel-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 3 }}>
              <Clock size={13} />
              <span>Next Dispatch Slot</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Sora, sans-serif' }}>
              {d.nextPostTime}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid var(--line)',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)' }}>
          <Layers size={14} />
          <span>Platforms: {d.platforms.join(', ')}</span>
        </div>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: 0,
            }}
          >
            Queue
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
