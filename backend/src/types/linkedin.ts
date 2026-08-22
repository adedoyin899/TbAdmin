// src/types/linkedin.ts
// TypeScript interfaces and types for LinkedIn Marketing & Community Management APIs

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number; // Duration in seconds (e.g. 5184000 for 60 days)
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface LinkedInMediaItem {
  id?: string;
  media?: string;
  status?: string;
  title?: string;
  description?: string;
  originalUrl?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number }>;
}

export interface LinkedInPostContent {
  media?: LinkedInMediaItem[];
  article?: {
    source?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
  };
  multiImage?: {
    images?: Array<{ id: string; originalUrl?: string }>;
  };
}

export interface LinkedInUGCPost {
  id: string; // e.g. "urn:li:share:123456789" or "urn:li:ugcPost:123456789"
  author: string; // e.g. "urn:li:organization:12345"
  lifecycleState: 'PUBLISHED' | 'DRAFT' | 'PROCESSING' | string;
  created?: {
    time: number; // Epoch milliseconds
    actor?: string;
  };
  lastModified?: {
    time: number;
    actor?: string;
  };
  specificContent?: {
    'com.linkedin.ugc.ShareContent'?: {
      shareCommentary?: {
        text: string;
      };
      shareMediaCategory?: 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | string;
      media?: LinkedInMediaItem[];
    };
  };
  commentary?: string;
  content?: LinkedInPostContent;
  visibility?: {
    'com.linkedin.ugc.MemberNetworkVisibility'?: 'PUBLIC' | 'CONNECTIONS' | string;
  };
}

export interface LinkedInPostsResponse {
  elements: LinkedInUGCPost[];
  paging?: {
    count: number;
    start: number;
    total?: number;
    links?: any[];
  };
}

export interface LinkedInShareStatistics {
  shareCount: number;
  likeCount: number;
  commentCount: number;
  clickCount: number;
  impressionCount: number;
  uniqueImpressionsCount?: number;
  engagement?: number;
}

export interface LinkedInAudienceDemographics {
  topJobTitles: Array<{ title: string; percentage: number }>;
  topIndustries: Array<{ industry: string; percentage: number }>;
  topLocations: Array<{ country: string; percentage: number }>;
}

export interface LinkedInEngagementMetrics {
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
  reaction_breakdown?: {
    likes: number;
    celebrates: number;
    loves: number;
    insightfuls: number;
    curious: number;
  };
  audience_demographics?: LinkedInAudienceDemographics;
  measured_at: Date;
}

export interface ParsedLinkedInPost {
  platform_post_id: string;
  platform: 'linkedin';
  content_text: string;
  content_image_urls: string[];
  link_url: string | null;
  posted_at: Date;
  linkedin_post_id: string;
  linkedin_urn: string;
  campaign_id: string | null;
  tags: Record<string, any>;
  metadata: Record<string, any>;
}
