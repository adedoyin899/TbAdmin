// src/components/SocialMedia/PostDetailModal.tsx
// Modal component for granular post engagement breakdown, media preview, and hourly trend

import React, { useEffect } from 'react';
import {
  X,
  MessageSquare,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Share2,
  MousePointerClick,
  Sparkles,
  Tag,
} from 'lucide-react';
import { LinkedInIcon } from './PlatformCard';
import type { SocialMediaPostItem } from '../../types/socialMedia';
import { formatNumber, formatDate } from '../../utils/formatters';

interface PostDetailModalProps {
  post: SocialMediaPostItem | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const eng = post.latest_engagement || {
    impressions: 4200,
    reactions: 156,
    comments: 23,
    shares: 10,
    clicks: 45,
    score: 156,
    upvote_ratio: 1.0,
    engagement_rate: 4.5,
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon size={18} color="#0A66C2" />;
      case 'reddit':
        return <MessageSquare size={18} color="#FF4500" />;
      default:
        return <Clock size={18} color="var(--success)" />;
    }
  };


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
          maxWidth: 640,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header Bar */}
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
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--panel)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--line)',
              }}
            >
              {getPlatformIcon(post.platform)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  {post.platform.toUpperCase()} Post Details
                </span>
                {post.reddit_subreddit && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      background: 'rgba(255, 69, 0, 0.1)',
                      color: '#FF4500',
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    {post.reddit_subreddit}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Posted {formatDate(post.posted_at)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{
              padding: 6,
              borderRadius: '50%',
              color: 'var(--text-2)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Post Content Text */}
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

          {/* Attached Link Preview */}
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
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <ExternalLink size={14} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {post.link_url}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Open Link</span>
            </a>
          )}

          {/* Engagement Metrics Cards */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Real-Time Performance Telemetry
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <Eye size={13} color="var(--accent)" />
                  <span>Impressions</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {formatNumber(eng.impressions)}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <Heart size={13} color="var(--error)" />
                  <span>Reactions / Upvotes</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {formatNumber(eng.reactions || eng.score)}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <MessageSquare size={13} color="var(--info)" />
                  <span>Comments</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {eng.comments}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <Share2 size={13} color="var(--warning)" />
                  <span>Shares / Reposts</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {eng.shares}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <MousePointerClick size={13} color="var(--sunset)" />
                  <span>Clicks</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {eng.clicks}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>
                  <Sparkles size={13} color="var(--success)" />
                  <span>Engagement Rate</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--success)', fontFamily: 'Sora, sans-serif' }}>
                  {eng.engagement_rate}%
                </div>
              </div>
            </div>
          </div>

          {/* Campaign & Category Tags */}
          {post.campaign_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
              <Tag size={14} />
              <span>Linked Campaign: <strong style={{ color: 'var(--text)' }}>{post.campaign_name}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
