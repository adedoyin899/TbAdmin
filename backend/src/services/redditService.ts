// src/services/redditService.ts
// Reddit API Client & Engagement Sync Service

import axios, { type AxiosInstance } from 'axios';
import { ENV } from '../config/env.js';
import { query } from '../db/connection.js';
import { REDDIT_SUBREDDITS, REDDIT_CONFIG } from '../config/redditConfig.js';
import type {
  RedditTokenResponse,
  RedditPostData,
  RedditListingResponse,
  ParsedRedditPost,
  RedditEngagementMetrics,
} from '../types/reddit.js';
import type {
  SocialMediaPostRow,
  SocialMediaEngagementRow,
} from '../types/socialMedia.js';
import { calculateEngagementRate } from '../utils/bufferHelpers.js';

class RedditService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private userAgent: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0; // Epoch milliseconds

  private client: AxiosInstance;

  constructor() {
    this.clientId = ENV.REDDIT_CLIENT_ID;
    this.clientSecret = ENV.REDDIT_CLIENT_SECRET;
    this.refreshToken = ENV.REDDIT_REFRESH_TOKEN;
    this.userAgent = ENV.REDDIT_USER_AGENT || 'TalentBridge Analytics (by /u/talentbridge_admin)';

    this.client = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': this.userAgent,
      },
    });
  }

  /**
   * Check if Reddit API credentials are provided
   */
  public isConfigured(): boolean {
    return Boolean(
      this.clientId &&
      this.clientSecret &&
      this.clientId !== 'your-client-id' &&
      this.clientSecret !== 'your-client-secret'
    );
  }

  /**
   * Get fresh or cached Reddit OAuth 2.0 Access Token
   */
  public async getRedditAccessToken(): Promise<string> {
    const now = Date.now();

    // If cached token is valid for more than 60s, reuse it
    if (this.accessToken && this.tokenExpiresAt > now + 60000) {
      return this.accessToken;
    }

    if (!this.isConfigured()) {
      return 'mock_reddit_access_token_demo';
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;

      let bodyData = 'grant_type=client_credentials';
      if (this.refreshToken && this.refreshToken !== 'your-refresh-token') {
        bodyData = `grant_type=refresh_token&refresh_token=${encodeURIComponent(this.refreshToken)}`;
      }

      const response = await axios.post<RedditTokenResponse>(
        `${REDDIT_CONFIG.OAUTH_BASE_URL}/access_token`,
        bodyData,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent,
          },
          timeout: 10000,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
      return this.accessToken;
    } catch (error: any) {
      console.warn('[WARN] Failed to retrieve Reddit access token, using fallback:', error.message);
      this.accessToken = 'mock_reddit_access_token_demo';
      this.tokenExpiresAt = Date.now() + 3600 * 1000;
      return this.accessToken;
    }
  }

  /**
   * Fetch posts from configured subreddits (r/TalentBridge, r/Recruiting, etc.)
   */
  public async fetchRedditPosts(
    subreddits: string[] = REDDIT_SUBREDDITS,
    limit: number = REDDIT_CONFIG.DEFAULT_POST_LIMIT
  ): Promise<RedditPostData[]> {
    if (!this.isConfigured()) {
      return this.getMockPosts();
    }

    const allPosts: RedditPostData[] = [];

    try {
      const accessToken = await this.getRedditAccessToken();

      for (const rawSub of subreddits) {
        const cleanSub = rawSub.replace(/^r\//, '');
        try {
          const response = await this.client.get<RedditListingResponse>(
            `${REDDIT_CONFIG.API_BASE_URL}/r/${cleanSub}/hot`,
            {
              params: { limit },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const children = response.data?.data?.children || [];
          for (const child of children) {
            if (child.data) {
              allPosts.push(child.data);
            }
          }
        } catch (err: any) {
          console.warn(`[WARN] Failed to fetch Reddit posts for r/${cleanSub}:`, err.message);
        }
      }

      return allPosts.length > 0 ? allPosts : this.getMockPosts();
    } catch (error: any) {
      console.warn('[WARN] Reddit API fetch failed, serving mock telemetry:', error.message);
      return this.getMockPosts();
    }
  }

  /**
   * Extract standardized post data from raw Reddit post payload
   */
  public parseRedditPost(rawPost: RedditPostData): ParsedRedditPost {
    const isViral = Number(rawPost.score || 0) >= REDDIT_CONFIG.VIRAL_SCORE_THRESHOLD;

    // Build rich text content from title and selftext
    let contentText = rawPost.title || '';
    if (rawPost.selftext && rawPost.selftext.trim().length > 0) {
      contentText = `${rawPost.title}\n\n${rawPost.selftext}`;
    }

    // Extract image URLs from Reddit post preview or URL
    const imageUrls: string[] = [];
    if (rawPost.preview?.images?.[0]?.source?.url) {
      imageUrls.push(rawPost.preview.images[0].source.url.replace(/&amp;/g, '&'));
    } else if (rawPost.thumbnail && rawPost.thumbnail.startsWith('http')) {
      imageUrls.push(rawPost.thumbnail);
    } else if (rawPost.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(rawPost.url)) {
      imageUrls.push(rawPost.url);
    }

    // External link or permalink
    const linkUrl = !rawPost.is_self && rawPost.url ? rawPost.url : `https://reddit.com${rawPost.permalink}`;

    const postedAt = rawPost.created_utc
      ? new Date(rawPost.created_utc * 1000)
      : new Date();

    const subredditPrefix = rawPost.subreddit_name_prefixed || `r/${rawPost.subreddit}`;

    return {
      platform_post_id: `rd_${rawPost.id}`,
      platform: 'reddit',
      content_text: contentText,
      content_image_urls: imageUrls,
      link_url: linkUrl,
      posted_at: postedAt,
      reddit_post_id: rawPost.id,
      reddit_subreddit: subredditPrefix,
      is_viral: isViral,
      campaign_id: null,
      tags: {
        is_viral: isViral,
        subreddit: subredditPrefix,
        author: rawPost.author,
        score: rawPost.score,
        flair: rawPost.link_flair_text || null,
      },
      metadata: {
        fullname: rawPost.name,
        upvote_ratio: rawPost.upvote_ratio,
        total_awards: rawPost.total_awards_received || 0,
        num_comments: rawPost.num_comments || 0,
        ups: rawPost.ups || 0,
        downs: rawPost.downs || 0,
      },
    };
  }

  /**
   * Save or update post in social_media_posts database table
   */
  public async storeRedditPost(
    post: ParsedRedditPost,
    postedByUserId?: string
  ): Promise<SocialMediaPostRow | null> {
    try {
      const sql = `
        INSERT INTO social_media_posts (
          platform,
          platform_post_id,
          posted_by,
          content_text,
          content_image_urls,
          link_url,
          posted_at,
          synced_at,
          updated_at,
          reddit_post_id,
          reddit_subreddit,
          campaign_id,
          tags,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, $10, $11, $12)
        ON CONFLICT (platform_post_id) DO UPDATE SET
          content_text = EXCLUDED.content_text,
          content_image_urls = EXCLUDED.content_image_urls,
          link_url = EXCLUDED.link_url,
          reddit_subreddit = EXCLUDED.reddit_subreddit,
          synced_at = NOW(),
          updated_at = NOW(),
          tags = EXCLUDED.tags,
          metadata = EXCLUDED.metadata
        RETURNING *;
      `;

      const values = [
        post.platform,
        post.platform_post_id,
        postedByUserId || null,
        post.content_text,
        JSON.stringify(post.content_image_urls),
        post.link_url,
        post.posted_at,
        post.reddit_post_id,
        post.reddit_subreddit,
        post.campaign_id,
        JSON.stringify(post.tags),
        JSON.stringify(post.metadata),
      ];

      const result = await query<SocialMediaPostRow>(sql, values);
      return result.rows[0] || null;
    } catch (error: any) {
      console.warn(`[WARN] Failed to store Reddit post ${post.platform_post_id} in DB:`, error.message);
      return null;
    }
  }

  /**
   * Save engagement metrics snapshot in social_media_engagement database table
   */
  public async storeRedditEngagement(
    postId: string,
    metrics: RedditEngagementMetrics
  ): Promise<SocialMediaEngagementRow | null> {
    try {
      const sql = `
        INSERT INTO social_media_engagement (
          post_id,
          platform,
          impressions,
          views,
          reactions,
          comments,
          shares,
          reposts,
          clicks,
          score,
          upvote_ratio,
          awards,
          engagement_rate,
          measured_at,
          synced_at
        ) VALUES ($1, 'reddit', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING *;
      `;

      const values = [
        postId,
        metrics.impressions,
        metrics.views,
        metrics.reactions,
        metrics.comments,
        metrics.shares,
        metrics.reposts,
        metrics.clicks,
        metrics.score,
        metrics.upvote_ratio,
        metrics.awards,
        metrics.engagement_rate,
        metrics.measured_at,
      ];

      const result = await query<SocialMediaEngagementRow>(sql, values);
      return result.rows[0] || null;
    } catch (error: any) {
      console.warn(`[WARN] Failed to store Reddit engagement for post ${postId}:`, error.message);
      return null;
    }
  }

  /**
   * Sync all Reddit posts and latest engagement metrics into PostgreSQL
   */
  public async syncRedditData(adminUserId?: string): Promise<{
    syncedCount: number;
    viralCount: number;
    errors: string[];
    posts: ParsedRedditPost[];
  }> {
    const errors: string[] = [];
    const parsedPosts: ParsedRedditPost[] = [];
    let syncedCount = 0;
    let viralCount = 0;

    try {
      const rawPosts = await this.fetchRedditPosts();

      for (const rawPost of rawPosts) {
        try {
          const parsed = this.parseRedditPost(rawPost);
          parsedPosts.push(parsed);

          if (parsed.is_viral) {
            viralCount++;
          }

          // 1. Upsert Post
          const storedPost = await this.storeRedditPost(parsed, adminUserId);

          // 2. Build and store engagement snapshot
          const score = Number(rawPost.score || 0);
          const comments = Number(rawPost.num_comments || 0);
          const awards = Number(rawPost.total_awards_received || 0);
          const upvoteRatio = Number(rawPost.upvote_ratio || 0.85);

          // Estimate impressions based on score and comment multiplier
          const impressions = Math.max(score * 12 + comments * 25, 250);
          const clicks = Math.round(impressions * 0.03);
          const reactions = score;
          const totalEngagement = reactions + comments + awards;
          const engagementRate = calculateEngagementRate(totalEngagement, impressions);

          const engagementMetrics: RedditEngagementMetrics = {
            impressions,
            views: impressions,
            reactions,
            comments,
            shares: Math.round(comments * 0.2),
            reposts: 0,
            clicks,
            score,
            upvote_ratio: upvoteRatio,
            awards,
            engagement_rate: engagementRate,
            is_viral: parsed.is_viral,
            measured_at: new Date(),
          };

          if (storedPost) {
            await this.storeRedditEngagement(storedPost.id, engagementMetrics);
          }

          syncedCount++;
        } catch (err: any) {
          errors.push(`Error processing Reddit post ${rawPost.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Fatal Reddit sync error: ${err.message}`);
    }

    return {
      syncedCount,
      viralCount,
      errors,
      posts: parsedPosts,
    };
  }

  /**
   * Mock Reddit community posts for development and testing
   */
  private getMockPosts(): RedditPostData[] {
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        id: '1ex_viral_001',
        name: 't3_1ex_viral_001',
        title: 'We replaced our 4-round take-home coding assignment with interactive presentation rooms. Candidate acceptance rate jumped from 41% to 88%.',
        selftext: 'Over the last 6 months, our engineering and talent teams overhauled the interview pipeline. Instead of giving candidates 8 hours of asynchronous take-home tests, we had them present their architecture in a 30-minute interactive room with live telemetry. Here are the 5 lessons we learned...',
        author: 'talentbridge_peter',
        subreddit: 'Recruiting',
        subreddit_name_prefixed: 'r/Recruiting',
        score: 234, // Viral! Score > 100
        ups: 245,
        downs: 11,
        upvote_ratio: 0.94,
        total_awards_received: 4,
        num_comments: 89,
        created_utc: now - 86400 * 1, // 1 day ago
        url: 'https://reddit.com/r/Recruiting/comments/1ex_viral_001/interactive_rooms',
        permalink: '/r/Recruiting/comments/1ex_viral_001/interactive_rooms',
        is_self: true,
        link_flair_text: 'Case Study',
      },
      {
        id: '1ex_post_002',
        name: 't3_1ex_post_002',
        title: 'Weekly Discussion: How are engineering hiring managers filtering junior vs senior portfolio artifacts in 2026?',
        selftext: 'Let us discuss portfolio telemetry and GitHub code verifications. What are the key signals you look for before scheduling a technical interview?',
        author: 'maz_founder',
        subreddit: 'TalentBridge',
        subreddit_name_prefixed: 'r/TalentBridge',
        score: 78,
        ups: 82,
        downs: 4,
        upvote_ratio: 0.91,
        total_awards_received: 1,
        num_comments: 34,
        created_utc: now - 86400 * 3, // 3 days ago
        url: 'https://reddit.com/r/TalentBridge/comments/1ex_post_002/weekly_discussion',
        permalink: '/r/TalentBridge/comments/1ex_post_002/weekly_discussion',
        is_self: true,
        link_flair_text: 'Discussion',
      },
      {
        id: '1ex_post_003',
        name: 't3_1ex_post_003',
        title: 'Top 7 resume mistakes engineers make when applying to high-growth startups',
        selftext: 'Having reviewed over 5,000 engineering profiles this year, here are the most common pitfalls and how to fix them with clear measurable impact metrics.',
        author: 'talentbridge_hq',
        subreddit: 'careerdevelopment',
        subreddit_name_prefixed: 'r/careerdevelopment',
        score: 142, // Viral! Score > 100
        ups: 155,
        downs: 13,
        upvote_ratio: 0.89,
        total_awards_received: 2,
        num_comments: 53,
        created_utc: now - 86400 * 5, // 5 days ago
        url: 'https://reddit.com/r/careerdevelopment/comments/1ex_post_003/top_resume_mistakes',
        permalink: '/r/careerdevelopment/comments/1ex_post_003/top_resume_mistakes',
        is_self: true,
        link_flair_text: 'Advice',
      },
    ];
  }
}

export const redditService = new RedditService();
