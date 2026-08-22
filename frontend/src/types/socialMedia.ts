// src/types/socialMedia.ts
// Frontend TypeScript definitions for Social Media Overview, Platform Cards, Trends, and Post Tables

export interface PlatformMetricsLinkedIn {
  posts: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  clicks: number;
  followersAdded: number;
}

export interface PlatformMetricsBuffer {
  scheduledPosts: number;
  nextPostTime: string;
  platforms: string[];
  publishedPosts?: number;
}

export interface PlatformMetricsReddit {
  posts: number;
  score: number;
  comments: number;
  upvoteRate: number;
}

export interface SocialMediaTrendPoint {
  week: string;
  linkedin?: number;
  buffer?: number;
  reddit?: number;
  total?: number;
}

export interface SocialMediaSummaryResponse {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatform: string;
  byPlatform: {
    linkedin: PlatformMetricsLinkedIn;
    buffer: PlatformMetricsBuffer;
    reddit: PlatformMetricsReddit;
  };
  trend: SocialMediaTrendPoint[];
}

export interface SocialMediaPostItem {
  id: string;
  platform: 'linkedin' | 'buffer' | 'reddit' | 'twitter';
  platform_post_id?: string;
  content_text: string;
  content_image_urls?: string[];
  link_url?: string;
  posted_at: string;
  buffer_status?: string;
  buffer_scheduled_time?: string;
  reddit_subreddit?: string;
  campaign_name?: string;
  author_email?: string;
  tags?: Record<string, any>;
  latest_engagement?: {
    impressions: number;
    reactions: number;
    comments: number;
    shares: number;
    clicks: number;
    score: number;
    upvote_ratio: number;
    engagement_rate: number;
    measured_at?: string;
  };
}

export interface SocialMediaPostsResponse {
  posts: SocialMediaPostItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface PostDetailModalData {
  post: SocialMediaPostItem;
  engagement?: {
    impressions: number;
    reactions: number;
    comments: number;
    shares: number;
    clicks: number;
    engagementRate: number;
  };
  engagementTimeline?: {
    timestamp: string;
    impressions: number;
    reactions: number;
    comments: number;
    clicks: number;
  }[];
}

export interface LinkedInDemographicItem {
  title?: string;
  size?: string;
  region?: string;
  percentage: number;
  count: number;
}

export interface LinkedInCampaignPerformanceItem {
  id: string;
  name: string;
  postsCount: number;
  impressions: number;
  engagement: number;
  clickRate: number;
  comments: number;
}

export interface LinkedInHourlyPoint {
  hour: string;
  impressions: number;
  reactions: number;
  clicks: number;
}

export interface LinkedInDetailedData {
  platform: 'linkedin';
  dateRange: string;
  metrics: {
    postsCount: number;
    impressions: number;
    reactions: number;
    comments: number;
    shares: number;
    clicks: number;
    linkClicks: number;
    followersAdded: number;
    engagementRate: number;
    peakEngagementTime: string;
    recommendation: string;
  };
  audienceDemographics: {
    topJobTitles: { title: string; percentage: number; count: number }[];
    companySizes: { size: string; percentage: number; count: number }[];
    topRegions: { region: string; percentage: number; count: number }[];
  };
  campaigns: LinkedInCampaignPerformanceItem[];
  recommendations: {
    bestPostingTime: string;
    bestContentType: string;
    suggestedNextTopic: string;
  };
  hourlyTimeline: LinkedInHourlyPoint[];
}

export interface CampaignItem {

  id: string;
  name: string;
  goal: 'signups' | 'awareness' | 'engagement' | 'retention';
  channels: string[];
  start_date: string;
  end_date?: string;
  budget?: number;
  spend?: number;
  status: 'active' | 'completed' | 'planning' | 'archived';
  target_audience?: string;
  created_by?: string;
  created_at?: string;
  performance_summary?: {
    reach: number;
    clicks: number;
    signups: number;
    engagement_rate: number;
  };
}

export interface CampaignChannelMetric {
  channel: 'email' | 'linkedin' | 'reddit' | 'buffer';
  reach: number;
  impressions?: number;
  engagement: number;
  engagement_rate: number;
  clicks: number;
  signups: number;
  conversion_rate: number;
}

export interface CampaignTimelinePoint {
  day: string;
  reach: number;
  engagement: number;
  signups: number;
  cumulative_signups: number;
}

export interface CampaignPerformanceResponse {
  campaign: CampaignItem;
  performance: {
    total_reach: number;
    total_impressions: number;
    total_engagement: number;
    avg_engagement_rate: number;
    total_clicks: number;
    total_signups: number;
    signup_conversion_rate: number;
    spend: number;
    cpc: number;
    cps: number;
    roi: number;
    by_channel: {
      email?: CampaignChannelMetric;
      linkedin?: CampaignChannelMetric;
      reddit?: CampaignChannelMetric;
    };
    timeline: CampaignTimelinePoint[];
  };
  posts: SocialMediaPostItem[];
}


