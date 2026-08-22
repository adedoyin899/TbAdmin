// src/types/reddit.ts
// TypeScript interfaces and types for Reddit API responses, posts, and engagement metrics

export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export interface RedditPostImage {
  source: {
    url: string;
    width: number;
    height: number;
  };
  resolutions?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

export interface RedditPostData {
  id: string; // e.g. "1ex4abc"
  name: string; // Fullname e.g. "t3_1ex4abc"
  title: string;
  selftext: string;
  selftext_html?: string;
  author: string;
  subreddit: string; // e.g. "TalentBridge"
  subreddit_name_prefixed: string; // e.g. "r/TalentBridge"
  score: number; // Net upvotes
  ups: number;
  downs: number;
  upvote_ratio: number; // 0.0 to 1.0 (e.g. 0.88)
  total_awards_received: number;
  num_comments: number;
  created_utc: number; // Epoch seconds
  url: string;
  permalink: string;
  is_self: boolean;
  thumbnail?: string;
  preview?: {
    images?: RedditPostImage[];
    enabled?: boolean;
  };
  link_flair_text?: string;
  over_18?: boolean;
  is_video?: boolean;
  pinned?: boolean;
  [key: string]: any;
}

export interface RedditListingChild {
  kind: string; // "t3"
  data: RedditPostData;
}

export interface RedditListingResponse {
  kind: string; // "Listing"
  data: {
    after: string | null;
    before: string | null;
    dist: number;
    children: RedditListingChild[];
  };
}

export interface ParsedRedditPost {
  platform_post_id: string;
  platform: 'reddit';
  content_text: string;
  content_image_urls: string[];
  link_url: string | null;
  posted_at: Date;
  reddit_post_id: string;
  reddit_subreddit: string;
  is_viral: boolean;
  campaign_id: string | null;
  tags: Record<string, any>;
  metadata: Record<string, any>;
}

export interface RedditEngagementMetrics {
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
  is_viral: boolean;
  measured_at: Date;
}
