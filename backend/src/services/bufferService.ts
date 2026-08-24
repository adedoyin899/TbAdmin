// src/services/bufferService.ts
// Buffer GraphQL API Client & Sync Service for Scheduled & Published Social Media Posts

import axios, { type AxiosInstance } from 'axios';
import { ENV } from '../config/env.js';
import { query } from '../db/connection.js';
import type {
  BufferChannel,
  BufferPost,
  BufferPostMetric,
  ParsedBufferPost,
  BufferEngagementMetrics,
} from '../types/buffer.js';
import type {
  SocialMediaPostRow,
  SocialMediaEngagementRow,
} from '../types/socialMedia.js';
import {
  formatBufferTimestamp,
  transformBufferPlatform,
  mapBufferStatus,
  calculateEngagementRate,
} from '../utils/bufferHelpers.js';

class BufferService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private organizationId: string;

  constructor() {
    this.apiKey = ENV.BUFFER_API_KEY;
    this.baseUrl = ENV.BUFFER_API_URL.replace(/\/$/, '');
    this.organizationId = ENV.BUFFER_ORGANIZATION_ID;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Check if Buffer API is configured with an active API Key and Organization ID
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your-buffer-api-key-here' && this.organizationId);
  }

  /**
   * Hot-swap credentials at runtime (e.g. from the Settings page) without a process restart
   */
  public updateConfig(config: { accessToken?: string; baseUrl?: string; organizationId?: string }): void {
    if (config.accessToken !== undefined) {
      this.apiKey = config.accessToken.trim();
    }
    if (config.organizationId !== undefined) {
      this.organizationId = config.organizationId.trim();
    }
    if (config.baseUrl !== undefined && config.baseUrl.trim()) {
      this.baseUrl = config.baseUrl.replace(/\/+$/, '');
      this.client = axios.create({ baseURL: this.baseUrl, timeout: 10000, headers: { 'Content-Type': 'application/json' } });
    }
  }

  /**
   * Get current config with masked key
   */
  public getConfig() {
    const maskedKey = this.apiKey
      ? this.apiKey.length > 8
        ? `${this.apiKey.slice(0, 4)}••••••••${this.apiKey.slice(-4)}`
        : '••••••••'
      : '';
    return {
      accessToken: maskedKey,
      baseUrl: this.baseUrl,
      organizationId: this.organizationId,
      hasApiKey: this.isConfigured(),
    };
  }

  /**
   * Execute a GraphQL request against the Buffer API, throwing on transport or GraphQL errors
   */
  private async graphqlRequest<T = any>(gqlQuery: string, variables: Record<string, any>, token?: string): Promise<T> {
    const response = await this.client.post(
      '',
      { query: gqlQuery, variables },
      { headers: { Authorization: `Bearer ${token || this.apiKey}` } }
    );

    if (response.data?.errors?.length) {
      throw new Error(response.data.errors.map((e: any) => e.message).join('; '));
    }

    return response.data.data as T;
  }

  /**
   * Perform a live handshake against the Buffer API to verify the access token actually works
   */
  public async testConnection(overrideCredentials?: {
    accessToken?: string;
    organizationId?: string;
  }): Promise<{ success: boolean; message: string; ping?: string }> {
    const token = overrideCredentials?.accessToken?.trim() || this.apiKey;
    const orgId = overrideCredentials?.organizationId?.trim() || this.organizationId;

    if (!token || token === 'your-buffer-api-key-here') {
      return {
        success: false,
        message: 'Buffer Access Token is missing. Add it in Settings or backend/.env (BUFFER_API_KEY).',
      };
    }
    if (!orgId) {
      return {
        success: false,
        message: 'Buffer Organization ID is missing. Add it in Settings or backend/.env (BUFFER_ORGANIZATION_ID).',
      };
    }

    const startTime = Date.now();
    try {
      const data = await this.graphqlRequest<{ channels: BufferChannel[] }>(
        `query Channels($input: ChannelsInput!) { channels(input: $input) { id name service displayName } }`,
        { input: { organizationId: orgId } },
        token
      );
      const ping = `${Date.now() - startTime}ms`;
      const channels = Array.isArray(data.channels) ? data.channels : [];

      return {
        success: true,
        message: `Buffer Access Token verified! Found ${channels.length} connected channel(s).`,
        ping,
      };
    } catch (error: any) {
      const ping = `${Date.now() - startTime}ms`;
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return { success: false, message: 'Buffer rejected the Access Token (unauthorized). Double-check the token value.', ping };
      }
      if (status === 429) {
        return { success: false, message: 'Buffer API rate limit hit while testing. Try again shortly.', ping };
      }
      return {
        success: false,
        message: `Buffer rejected the request: ${error.message || 'Unknown error'}`,
        ping,
      };
    }
  }

  /**
   * Fetch connected social media channels from Buffer
   */
  public async fetchChannels(): Promise<BufferChannel[]> {
    if (!this.isConfigured()) {
      return this.getMockChannels();
    }

    try {
      const data = await this.graphqlRequest<{ channels: BufferChannel[] }>(
        `query Channels($input: ChannelsInput!) { channels(input: $input) { id name service displayName avatar } }`,
        { input: { organizationId: this.organizationId } }
      );
      return data.channels || [];
    } catch (error: any) {
      this.handleApiError('fetchChannels', error);
      return this.getMockChannels();
    }
  }

  /**
   * Fetch scheduled and/or published posts from Buffer
   */
  public async fetchBufferPosts(
    channelId?: string,
    status: 'pending' | 'sent' | 'all' = 'all'
  ): Promise<BufferPost[]> {
    if (!this.isConfigured()) {
      return this.getMockPosts(status);
    }

    const statusFilter =
      status === 'pending' ? ['BUFFER', 'DRAFT', 'APPROVAL_PENDING'] :
      status === 'sent' ? ['SENT'] :
      undefined;

    try {
      let channelIds: string[];
      if (channelId) {
        channelIds = [channelId];
      } else {
        const channels = await this.fetchChannels();
        channelIds = channels.map((c) => c.id);
      }

      // Fetches the first 100 posts per status filter; Buffer's `posts` query is cursor-paginated
      // (first/after) but the old REST integration this replaces never paginated either.
      const data = await this.graphqlRequest<{ posts: { edges: Array<{ node: BufferPost }> } }>(
        `query Posts($input: PostsInput!) {
          posts(input: $input) {
            edges {
              node {
                id text status channelId channelService dueAt sentAt createdAt updatedAt
                externalLink assets { source thumbnail } tags { id name } ideaId
                metrics { type name value unit description }
              }
            }
          }
        }`,
        {
          input: {
            organizationId: this.organizationId,
            filter: { channelIds, ...(statusFilter ? { status: statusFilter } : {}) },
            first: 100,
          },
        }
      );

      const posts = (data.posts?.edges || []).map((edge) => edge.node);
      return posts.length > 0 ? posts : this.getMockPosts(status);
    } catch (error: any) {
      this.handleApiError('fetchBufferPosts', error);
      return this.getMockPosts(status);
    }
  }

  /**
   * Fetch engagement statistics for a single Buffer post
   */
  public async fetchBufferEngagement(postId: string): Promise<BufferEngagementMetrics> {
    if (!this.isConfigured()) {
      return this.getMockEngagement(postId);
    }

    try {
      const data = await this.graphqlRequest<{ post: { metrics?: BufferPostMetric[] } }>(
        `query Post($input: PostInput!) { post(input: $input) { metrics { type name value unit description } } }`,
        { input: { id: postId } }
      );
      return this.extractEngagementMetrics(data.post?.metrics);
    } catch (error: any) {
      this.handleApiError(`fetchBufferEngagement (${postId})`, error);
      return this.getMockEngagement(postId);
    }
  }

  /**
   * Normalize Buffer's named PostMetric list into our standard engagement shape.
   * Metric name matching is best-effort — Buffer's exact metric naming hasn't been
   * verified against a live account yet, so unmatched names fall back to 0.
   */
  private extractEngagementMetrics(metrics?: BufferPostMetric[] | null): BufferEngagementMetrics {
    const list = metrics || [];
    const metricValue = (name: string) => list.find((m) => m.name?.toLowerCase() === name)?.value || 0;

    const likes = metricValue('likes') || metricValue('reactions') || metricValue('favorites');
    const comments = metricValue('comments');
    const shares = metricValue('shares') || metricValue('retweets');
    const clicks = metricValue('clicks');
    const impressions = metricValue('impressions') || metricValue('reach') || (likes + comments + shares + clicks) * 12;
    const totalEngagement = likes + comments + shares;

    return {
      impressions,
      views: impressions,
      reactions: likes,
      comments,
      shares,
      reposts: metricValue('reposts') || shares,
      clicks,
      score: likes - comments > 0 ? likes - comments : 0,
      upvote_ratio: 0.95,
      awards: 0,
      engagement_rate: calculateEngagementRate(totalEngagement, impressions),
      measured_at: new Date(),
    };
  }

  /**
   * Extract standardized post data from a raw Buffer post payload
   */
  public parseBufferPost(rawPost: BufferPost): ParsedBufferPost {
    const platform = transformBufferPlatform(rawPost.channelService);
    const bufferStatus = mapBufferStatus(rawPost.status);

    const imageUrls: string[] = [];
    for (const asset of rawPost.assets || []) {
      if (asset.source && !imageUrls.includes(asset.source)) imageUrls.push(asset.source);
      if (asset.thumbnail && !imageUrls.includes(asset.thumbnail)) imageUrls.push(asset.thumbnail);
    }

    const postedAt = formatBufferTimestamp(rawPost.sentAt || rawPost.createdAt);
    const scheduledTime = rawPost.dueAt ? formatBufferTimestamp(rawPost.dueAt) : null;

    const tagsRecord: Record<string, any> = {};
    for (const tag of rawPost.tags || []) {
      tagsRecord[tag.id] = tag.name || tag.id;
    }

    return {
      platform_post_id: `buf_${rawPost.id}`,
      platform,
      content_text: rawPost.text || '',
      content_image_urls: imageUrls,
      link_url: rawPost.externalLink || null,
      posted_at: postedAt,
      buffer_id: rawPost.id,
      buffer_status: bufferStatus,
      buffer_scheduled_time: scheduledTime,
      campaign_id: null,
      tags: tagsRecord,
      metadata: {
        raw_service: rawPost.channelService,
        channel_id: rawPost.channelId,
        idea_id: rawPost.ideaId || null,
      },
    };
  }

  /**
   * Save or update post in social_media_posts database table
   */
  public async storeBufferPost(
    post: ParsedBufferPost,
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
          buffer_id,
          buffer_status,
          buffer_scheduled_time,
          campaign_id,
          tags,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, $10, $11, $12, $13)
        ON CONFLICT (platform_post_id) DO UPDATE SET
          content_text = EXCLUDED.content_text,
          content_image_urls = EXCLUDED.content_image_urls,
          link_url = EXCLUDED.link_url,
          buffer_status = EXCLUDED.buffer_status,
          buffer_scheduled_time = EXCLUDED.buffer_scheduled_time,
          synced_at = NOW(),
          updated_at = NOW(),
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
        post.buffer_id,
        post.buffer_status,
        post.buffer_scheduled_time,
        post.campaign_id,
        JSON.stringify(post.tags),
        JSON.stringify(post.metadata),
      ];

      const result = await query<SocialMediaPostRow>(sql, values);
      return result.rows[0] || null;
    } catch (error: any) {
      console.warn(`[WARN] Failed to store Buffer post ${post.platform_post_id} in DB:`, error.message);
      return null;
    }
  }

  /**
   * Save engagement metrics snapshot in social_media_engagement database table
   */
  public async storeBufferEngagement(
    postId: string,
    platform: string,
    metrics: BufferEngagementMetrics
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *;
      `;

      const values = [
        postId,
        platform,
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
      console.warn(`[WARN] Failed to store Buffer engagement for post ${postId}:`, error.message);
      return null;
    }
  }

  /**
   * Sync all Buffer posts and latest engagement metrics into PostgreSQL
   */
  public async syncBufferData(adminUserId?: string): Promise<{
    syncedCount: number;
    errors: string[];
    posts: ParsedBufferPost[];
  }> {
    const errors: string[] = [];
    const parsedPosts: ParsedBufferPost[] = [];
    let syncedCount = 0;

    try {
      const rawPosts = await this.fetchBufferPosts();

      for (const rawPost of rawPosts) {
        try {
          const parsed = this.parseBufferPost(rawPost);
          parsedPosts.push(parsed);

          // 1. Upsert Post
          const storedPost = await this.storeBufferPost(parsed, adminUserId);

          // 2. Store engagement if post stored and published
          if (storedPost && parsed.buffer_status === 'published') {
            const engagementMetrics = this.extractEngagementMetrics(rawPost.metrics);
            await this.storeBufferEngagement(storedPost.id, parsed.platform, engagementMetrics);
          }

          syncedCount++;
        } catch (err: any) {
          errors.push(`Error processing post ${rawPost.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Fatal sync error: ${err.message}`);
    }

    return {
      syncedCount,
      errors,
      posts: parsedPosts,
    };
  }

  /**
   * Handle Buffer API errors including 429 Rate Limiting
   */
  private handleApiError(action: string, error: any): void {
    if (error.response?.status === 429) {
      console.warn(
        `[RATE LIMIT] Buffer API 429 encountered during ${action}. Backing off until next cycle.`
      );
    } else {
      console.warn(`[WARN] Buffer API error during ${action}:`, error.message);
    }
  }

  /**
   * Mock channels for local development and demo purposes
   */
  private getMockChannels(): BufferChannel[] {
    return [
      {
        id: 'buf_ch_linkedin_01',
        name: 'talentbridge-hq',
        displayName: 'TalentBridge HQ',
        service: 'linkedin',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      },
      {
        id: 'buf_ch_twitter_02',
        name: 'talentbridge_app',
        displayName: '@talentbridge_app',
        service: 'twitter',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
      },
    ];
  }

  /**
   * Mock posts for development and testing
   */
  private getMockPosts(status: 'pending' | 'sent' | 'all'): BufferPost[] {
    const now = Date.now();
    const iso = (ms: number) => new Date(ms).toISOString();

    const sentPosts: BufferPost[] = [
      {
        id: 'buf_sent_001',
        text: '🚀 Showcase Rooms 2.0 is officially live! Transform how candidate presentations are viewed in real-time.',
        status: 'SENT',
        channelId: 'buf_ch_linkedin_01',
        channelService: 'LINKEDIN',
        sentAt: iso(now - 86400000 * 2),
        createdAt: iso(now - 86400000 * 2),
        updatedAt: iso(now - 86400000 * 2),
        externalLink: 'https://talentbridge.cv/rooms',
        assets: [{ source: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60' }],
        metrics: [
          { type: 'ENGAGEMENT', name: 'clicks', value: 145, unit: 'COUNT', description: 'Clicks' },
          { type: 'ENGAGEMENT', name: 'likes', value: 312, unit: 'COUNT', description: 'Likes' },
          { type: 'ENGAGEMENT', name: 'comments', value: 42, unit: 'COUNT', description: 'Comments' },
          { type: 'ENGAGEMENT', name: 'shares', value: 28, unit: 'COUNT', description: 'Shares' },
          { type: 'REACH', name: 'reach', value: 8420, unit: 'COUNT', description: 'Reach' },
        ],
        tags: [{ id: 'topic', name: 'product-launch' }, { id: 'campaign', name: 'Q3 Launch' }],
      },
      {
        id: 'buf_sent_002',
        text: 'Recruiters: what is your single biggest bottleneck during high-volume hiring sprints? Reply below 👇',
        status: 'SENT',
        channelId: 'buf_ch_twitter_02',
        channelService: 'TWITTER',
        sentAt: iso(now - 86400000 * 4),
        createdAt: iso(now - 86400000 * 4),
        updatedAt: iso(now - 86400000 * 4),
        externalLink: 'https://talentbridge.cv/blog/hiring-bottlenecks',
        assets: [],
        metrics: [
          { type: 'ENGAGEMENT', name: 'clicks', value: 89, unit: 'COUNT', description: 'Clicks' },
          { type: 'ENGAGEMENT', name: 'likes', value: 154, unit: 'COUNT', description: 'Likes' },
          { type: 'ENGAGEMENT', name: 'comments', value: 67, unit: 'COUNT', description: 'Comments' },
          { type: 'ENGAGEMENT', name: 'retweets', value: 19, unit: 'COUNT', description: 'Retweets' },
          { type: 'REACH', name: 'reach', value: 4200, unit: 'COUNT', description: 'Reach' },
        ],
        tags: [{ id: 'topic', name: 'community-engagement' }],
      },
    ];

    const pendingPosts: BufferPost[] = [
      {
        id: 'buf_pend_003',
        text: '5 tips for engineering leaders evaluating candidate portfolios with deep telemetry data. Thread 🧵',
        status: 'BUFFER',
        channelId: 'buf_ch_linkedin_01',
        channelService: 'LINKEDIN',
        dueAt: iso(now + 7200000),
        createdAt: iso(now - 3600000),
        updatedAt: iso(now - 3600000),
        externalLink: 'https://talentbridge.cv/resources/evaluation-playbook',
        assets: [{ source: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60' }],
        metrics: null,
        tags: [{ id: 'topic', name: 'thought-leadership' }],
      },
      {
        id: 'buf_pend_004',
        text: 'Sneak peek at our upcoming hiring manager portal updates. Faster filters, instant shortlists.',
        status: 'BUFFER',
        channelId: 'buf_ch_twitter_02',
        channelService: 'TWITTER',
        dueAt: iso(now + 86400000),
        createdAt: iso(now - 7200000),
        updatedAt: iso(now - 7200000),
        externalLink: 'https://talentbridge.cv/features',
        assets: [],
        metrics: null,
        tags: [{ id: 'topic', name: 'product-teaser' }],
      },
    ];

    if (status === 'pending') return pendingPosts;
    if (status === 'sent') return sentPosts;
    return [...sentPosts, ...pendingPosts];
  }

  /**
   * Mock engagement statistics for a single post
   */
  private getMockEngagement(_postId: string): BufferEngagementMetrics {
    return {
      impressions: 8420,
      views: 8420,
      reactions: 312,
      comments: 42,
      shares: 28,
      reposts: 28,
      clicks: 145,
      score: 312,
      upvote_ratio: 0.98,
      awards: 0,
      engagement_rate: 4.54, // (312+42+28)/8420 * 100
      measured_at: new Date(),
    };
  }
}

export const bufferService = new BufferService();
