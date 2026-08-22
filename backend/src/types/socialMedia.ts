// src/types/socialMedia.ts
// TypeScript interfaces and types for Social Media Marketing, Campaigns, and Enhanced Email Analytics

export type SocialPlatform = 'linkedin' | 'buffer' | 'reddit' | 'twitter' | 'facebook' | 'other';

export type CampaignStatus = 'planning' | 'active' | 'completed' | 'archived';

export type BufferStatus = 'scheduled' | 'published' | 'failed' | 'draft';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

// ==========================================================
// DATABASE ROW INTERFACES
// ==========================================================

export interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  start_date: string | Date | null;
  end_date: string | Date | null;
  budget_usd: number | string;
  goal: string | null;
  channels: string[] | SocialPlatform[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SocialMediaPostRow {
  id: string;
  platform: SocialPlatform;
  platform_post_id: string;
  posted_by: string | null;
  content_text: string | null;
  content_image_urls: string[];
  link_url: string | null;
  posted_at: Date;
  synced_at: Date;
  updated_at: Date;
  buffer_id: string | null;
  buffer_status: BufferStatus | null;
  buffer_scheduled_time: Date | null;
  linkedin_post_id: string | null;
  linkedin_urn: string | null;
  reddit_post_id: string | null;
  reddit_subreddit: string | null;
  campaign_id: string | null;
  tags: Record<string, any>;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface SocialMediaEngagementRow {
  id: number;
  post_id: string;
  platform: SocialPlatform | string;
  impressions: number;
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  reposts: number;
  clicks: number;
  score: number;
  upvote_ratio: number | string;
  awards: number;
  engagement_rate: number | string;
  measured_at: Date;
  synced_at: Date;
  created_at: Date;
}

export interface EmailEngagementDetailedRow {
  id: number;
  mailgun_event_id: number | null;
  campaign_id: string | null;
  campaign_name: string | null;
  email_address: string;
  event_type: string;
  link_url: string | null;
  click_link_index: number;
  click_link_label: string | null;
  device_type: DeviceType | string;
  email_client: string | null;
  geolocation_country: string | null;
  geolocation_city: string | null;
  user_agent: string | null;
  ip_address: string | null;
  opened_at: Date | null;
  clicked_at: Date | null;
  post_click_action: string | null;
  post_click_action_at: Date | null;
  post_click_user_id: string | null;
  conversion_time_seconds: number | null;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface ChannelPerformanceMetrics {
  reach?: number;
  impressions?: number;
  engagement?: number;
  engagement_rate?: number;
  clicks?: number;
  signups?: number;
  spend?: number;
  conversion_rate?: number;
  [key: string]: any;
}

export interface CampaignPerformanceRow {
  id: number;
  campaign_id: string;
  total_reach: number;
  total_impressions: number;
  total_engagement: number;
  engagement_rate: number | string;
  total_clicks: number;
  total_signups: number;
  signup_conversion_rate: number | string;
  channel_data: Record<string, ChannelPerformanceMetrics>;
  spend_usd: number | string;
  cost_per_click: number | string;
  cost_per_signup: number | string;
  roi: number | string;
  measured_at: Date;
  synced_at: Date;
  created_at: Date;
}

export interface SyncLogRow {
  id: number;
  service: 'buffer' | 'linkedin' | 'reddit' | 'mailgun' | 'campaign' | string;
  status: 'success' | 'failed' | 'partial';
  sync_count: number;
  error_message: string | null;
  synced_at: Date;
}

// ==========================================================
// COMPOSITE & API DTO TYPES
// ==========================================================

export interface SocialMediaPostWithEngagement extends SocialMediaPostRow {
  latest_engagement?: SocialMediaEngagementRow;
  author_email?: string;
  campaign_name?: string;
}

export interface SocialMediaSummaryResponse {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatform: SocialPlatform | string;
  byPlatform: {
    linkedin: {
      posts: number;
      impressions: number;
      engagement: number;
      engagementRate: number;
      clicks: number;
      followersAdded?: number;
    };
    buffer: {
      scheduledPosts: number;
      nextPostTime?: string | null;
      platforms: string[];
      publishedPosts: number;
    };
    reddit: {
      posts: number;
      score: number;
      comments: number;
      upvoteRate: number;
    };
  };
  trend: Array<{
    week: string;
    linkedin: number;
    buffer: number;
    reddit: number;
    total: number;
  }>;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  budgetUsd?: number;
  goal?: string;
  channels: string[];
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  budgetUsd?: number;
  goal?: string;
  channels?: string[];
}
