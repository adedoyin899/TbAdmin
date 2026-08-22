// src/types/buffer.ts
// TypeScript interfaces and types for Buffer API responses, profiles, updates, and telemetry

import type { SocialPlatform, BufferStatus } from './socialMedia.js';

export interface BufferProfile {
  id: string;
  service: string; // 'linkedin', 'twitter', 'facebook', 'instagram', 'pinterest', etc.
  service_id: string;
  service_username?: string;
  formatted_username?: string;
  avatar?: string;
  avatar_https?: string;
  default?: boolean;
  schedules?: Array<{
    days: string[];
    times: string[];
  }>;
  counts?: {
    daily_suggestions?: number;
    drafts?: number;
    pending?: number;
    sent?: number;
  };
}

export interface BufferMedia {
  link?: string;
  picture?: string;
  thumbnail?: string;
  photo?: string;
  title?: string;
  description?: string;
  video?: {
    details?: {
      duration?: number;
      width?: number;
      height?: number;
    };
    thumbnail?: string;
    transcoded_location?: string;
  };
}

export interface BufferStatistics {
  clicks?: number;
  favorites?: number;
  likes?: number;
  retweets?: number;
  shares?: number;
  comments?: number;
  impressions?: number;
  reach?: number;
  reshares?: number;
  mentions?: number;
  [key: string]: any;
}

export interface BufferUpdate {
  id: string;
  created_at: number; // Unix epoch seconds
  day?: string;
  due_at?: number; // Unix epoch seconds
  due_time?: string;
  media?: BufferMedia;
  profile_id?: string;
  profile_service?: string;
  service?: string;
  service_update_id?: string;
  status: 'buffer' | 'sent' | 'error' | 'pending' | 'draft' | string;
  text: string;
  text_formatted?: string;
  user_id?: string;
  sent_at?: number; // Unix epoch seconds
  statistics?: BufferStatistics;
  pinned?: boolean;
  campaign_id?: string;
  tags?: string[] | Record<string, any>;
}

export interface BufferUpdatesResponse {
  total: number;
  updates: BufferUpdate[];
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
