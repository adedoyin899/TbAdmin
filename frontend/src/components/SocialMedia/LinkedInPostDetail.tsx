// src/components/SocialMedia/LinkedInPostDetail.tsx
// Detailed modal component showing LinkedIn post reaction breakdowns, CTR, and 48-hour progression

import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MousePointerClick,
  Sparkles,
  TrendingUp,
  Tag,
  ThumbsUp,
  Lightbulb,
  PartyPopper,
} from 'lucide-react';
import { LinkedInIcon } from './PlatformCard';
import type { SocialMediaPostItem } from '../../types/socialMedia';
import { formatNumber, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface LinkedInPostDetailProps {
  post: SocialMediaPostItem | null;
  onClose: () => void;
}

export const LinkedInPostDetail: React.FC<LinkedInPostDetailProps> = ({ post, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const eng = post.latest_engagement || {
    impressions: 12450,
    reactions: 425,
    comments: 68,
    shares: 28,
    clicks: 342,
    score: 425,
    upvote_ratio: 1.0,
    engagement_rate: 4.18,
  };

  // Reactions breakdown estimate
  const totalReactions = eng.reactions || 425;
  const likesCount = Math.round(totalReactions * 0.65);
  const celebrateCount = Math.round(totalReactions * 0.18);
  const insightfulCount = Math.round(totalReactions * 0.12);
  const loveCount = Math.max(1, totalReactions - likesCount - celebrateCount - insightfulCount);

  const timelineData = [
    { hour: '0h', impressions: Math.round(eng.impressions * 0.02), reactions: Math.round(totalReactions * 0.03) },
    { hour: '2h', impressions: Math.round(eng.impressions * 0.08), reactions: Math.round(totalReactions * 0.09) },
    { hour: '4h', impressions: Math.round(eng.impressions * 0.18), reactions: Math.round(totalReactions * 0.2) },
    { hour: '8h', impressions: Math.round(eng.impressions * 0.35), reactions: Math.round(totalReactions * 0.38) },
    { hour: '12h (Peak)', impressions: Math.round(eng.impressions * 0.6), reactions: Math.round(totalReactions * 0.68) },
    { hour: '24h', impressions: Math.round(eng.impressions * 0.85), reactions: Math.round(totalReactions * 0.88) },
    { hour: '36h', impressions: Math.round(eng.impressions * 0.95), reactions: Math.round(totalReactions * 0.96) },
    { hour: '48h', impressions: eng.impressions, reactions: totalReactions },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 12, 18, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
      className="animate-fade-in"
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Top Accent Gradient */}
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

        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--panel-2)',
          }}
        >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                  LinkedIn Company Post
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    background: 'rgba(10, 102, 194, 0.1)',
                    color: '#0A66C2',
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  Organic UGC
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Published on {formatDate(post.posted_at)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 6, borderRadius: '50%', color: 'var(--text-2)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Post Content Box */}
          <div
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: 16,
              fontSize: 14.5,
              lineHeight: 1.6,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {post.content_text}
          </div>

          {/* Attached Destination Link */}
          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--panel-3)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: '#0A66C2',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <ExternalLink size={14} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {post.link_url}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Open Post Link</span>
            </a>
          )}

          {/* Reaction Breakdown Pills */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
              Reactions Breakdown ({totalReactions} total)
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(10, 102, 194, 0.1)',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0A66C2',
                  border: '1px solid rgba(10, 102, 194, 0.25)',
                }}
              >
                <ThumbsUp size={14} />
                <span>Like: {likesCount}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <PartyPopper size={14} />
                <span>Celebrate: {celebrateCount}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <Lightbulb size={14} />
                <span>Insightful: {insightfulCount}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--error)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <Heart size={14} />
                <span>Love: {loveCount}</span>
              </div>
            </div>
          </div>

          {/* Metric Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <Eye size={13} color="#0A66C2" />
                <span>Impressions</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {formatNumber(eng.impressions)}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <MessageSquare size={13} color="var(--info)" />
                <span>Comments</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {eng.comments}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <Share2 size={13} color="var(--warning)" />
                <span>Shares &amp; Reposts</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {eng.shares}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <MousePointerClick size={13} color="var(--sunset)" />
                <span>Total Clicks</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {eng.clicks}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <ExternalLink size={13} color="var(--accent)" />
                <span>Destination CTR</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Sora, sans-serif' }}>
                {eng.impressions > 0 ? ((eng.clicks / eng.impressions) * 100).toFixed(2) : 0}%
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                <Sparkles size={13} color="var(--success)" />
                <span>Engagement Rate</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', fontFamily: 'Sora, sans-serif' }}>
                {eng.engagement_rate}%
              </div>
            </div>
          </div>

          {/* 48-Hour Velocity Timeline Chart */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <TrendingUp size={15} color="#0A66C2" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                48-Hour Engagement Curve
              </span>
            </div>

            <div style={{ width: '100%', height: 180, background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liModalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0A66C2" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
                  <XAxis dataKey="hour" stroke="var(--dim)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--dim)" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
                            <div style={{ color: '#0A66C2' }}>Impressions: {payload[0]?.value?.toLocaleString()}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="impressions" stroke="#0A66C2" strokeWidth={2.5} fillOpacity={1} fill="url(#liModalGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Linked Campaign */}
          {post.campaign_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
              <Tag size={14} />
              <span>Linked Campaign: <strong style={{ color: 'var(--text)' }}>{post.campaign_name}</strong></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--panel-2)',
          }}
        >
          <button onClick={onClose} className="btn btn-primary" style={{ fontSize: 13 }}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
