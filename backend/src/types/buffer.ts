// src/types/buffer.ts
// TypeScript interfaces for the Buffer GraphQL API (channels, posts, metrics) and internal telemetry

import type { SocialPlatform, BufferStatus } from './socialMedia.js';

export interface BufferChannel {
  id: string;
  name: string;
  displayName?: string | null;
  service: string; // Service enum: TWITTER, LINKEDIN, INSTAGRAM, FACEBOOK, PINTEREST, TIKTOK, YOUTUBE, BLUESKY, MASTODON, THREADS, GOOGLE_BUSINESS_PROFILE
  avatar: string;
}

export interface BufferAsset {
  source: string;
  thumbnail?: string | null;
}

export interface BufferPostMetric {
  type: string;
  name: string;
  value: number;
  unit: string;
  description: string;
}

export interface BufferPostTag {
  id: string;
  name?: string;
}

export interface BufferPost {
  id: string;
  text: string;
  status: string; // PostStatus enum: DRAFT, BUFFER, SENT, FAILED, APPROVAL_PENDING
  channelId: string;
  channelService: string;
  dueAt?: string | null; // DateTime (ISO 8601)
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  externalLink?: string | null;
  assets: BufferAsset[];
  metrics?: BufferPostMetric[] | null;
  ideaId?: string | null;
  tags: BufferPostTag[];
}

export interface ParsedBufferPost {
  platform_post_id: string;
  platform: SocialPlatform;
  content_text: string;
  content_image_urls: string[];
  link_url: string | null;
  posted_at: Date;
  buffer_id: string;
  buffer_status: BufferStatus;
  buffer_scheduled_time: Date | null;
  campaign_id: string | null;
  tags: Record<string, any>;
  metadata: Record<string, any>;
}

export interface BufferEngagementMetrics {
  impressions: number;
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  reposts: number;
  clicks: number;
  score: number;
  upvote_ratio: number;
  awards: number;
  engagement_rate: number;
  measured_at: Date;
}
