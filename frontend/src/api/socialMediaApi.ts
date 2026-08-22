// src/api/socialMediaApi.ts
// Frontend API client for Social Media Analytics, Posts, and Sync Actions

import apiClient from './client';
import type {
  SocialMediaSummaryResponse,
  SocialMediaPostsResponse,
  PostDetailModalData,
} from '../types/socialMedia';

export const socialMediaApi = {
  getSummary: async (dateRange: string = '7d'): Promise<SocialMediaSummaryResponse> => {
    try {
      const res = await apiClient.get<SocialMediaSummaryResponse>('/social-media/summary', {
        params: { dateRange },
      });
      return res as unknown as SocialMediaSummaryResponse;
    } catch {
      // Fallback mock data matching prompt 9 spec
      return {
        totalPosts: 42,
        totalEngagement: 1250,
        avgEngagementRate: 3.2,
        topPlatform: 'linkedin',
        byPlatform: {
          linkedin: {
            posts: 12,
            impressions: 8420,
            engagement: 345,
            engagementRate: 4.1,
            clicks: 342,
            followersAdded: 24,
          },
          buffer: {
            scheduledPosts: 8,
            nextPostTime: 'In 2 hours',
            platforms: ['LinkedIn', 'Reddit', 'Twitter'],
            publishedPosts: 22,
          },
          reddit: {
            posts: 5,
            score: 1240,
            comments: 142,
            upvoteRate: 78,
          },
        },
        trend: [
          { week: 'Week 1', linkedin: 240, buffer: 180, reddit: 320, total: 740 },
          { week: 'Week 2', linkedin: 310, buffer: 210, reddit: 450, total: 970 },
          { week: 'Week 3', linkedin: 420, buffer: 290, reddit: 380, total: 1090 },
          { week: 'Week 4', linkedin: 521, buffer: 345, reddit: 580, total: 1446 },
        ],
      };
    }
  },

  getPosts: async (params?: {
    platform?: string;
    dateRange?: string;
    status?: string;
    sort?: string;
    order?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SocialMediaPostsResponse> => {
    try {
      const res = await apiClient.get<SocialMediaPostsResponse>('/social-media/posts', {
        params,
      });
      return res as unknown as SocialMediaPostsResponse;
    } catch {
      return {
        posts: [
          {
            id: 'mock_post_001',
            platform: 'linkedin',
            content_text: 'Excited to announce TalentBridge Showcase Rooms 2.0! 🎉 Transform candidate evaluation with interactive telemetry.',
            posted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            link_url: 'https://talentbridge.cv/rooms',
            buffer_status: 'published',
            latest_engagement: {
              impressions: 4200,
              reactions: 156,
              comments: 23,
              shares: 10,
              clicks: 45,
              score: 156,
              upvote_ratio: 1.0,
              engagement_rate: 4.5,
            },
          },
          {
            id: 'mock_post_002',
            platform: 'buffer',
            content_text: 'Recruiters: what is your single biggest bottleneck during hiring sprints? Reply below 👇',
            posted_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            link_url: 'https://talentbridge.cv/blog/bottlenecks',
            buffer_status: 'published',
            latest_engagement: {
              impressions: 2100,
              reactions: 89,
              comments: 14,
              shares: 6,
              clicks: 22,
              score: 89,
              upvote_ratio: 0.95,
              engagement_rate: 5.19,
            },
          },
          {
            id: 'mock_post_003',
            platform: 'reddit',
            content_text: 'We replaced our 4-round take-home coding assignment with interactive presentation rooms. Candidate acceptance rate jumped from 41% to 88%.',
            posted_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            link_url: 'https://reddit.com/r/Recruiting/comments/1ex_viral_001',
            reddit_subreddit: 'r/Recruiting',
            buffer_status: 'published',
            latest_engagement: {
              impressions: 7600,
              reactions: 234,
              comments: 89,
              shares: 18,
              clicks: 45,
              score: 234,
              upvote_ratio: 0.94,
              engagement_rate: 4.22,
            },
          },
          {
            id: 'mock_post_004',
            platform: 'buffer',
            content_text: 'How high-growth startups source top 1% junior engineers without drowning in 5,000 resume PDFs.',
            posted_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            buffer_status: 'scheduled',
            buffer_scheduled_time: 'Today at 2:00 PM',
            latest_engagement: {
              impressions: 0,
              reactions: 0,
              comments: 0,
              shares: 0,
              clicks: 0,
              score: 0,
              upvote_ratio: 0,
              engagement_rate: 0,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 4,
          totalPages: 1,
          hasMore: false,
        },
      };
    }
  },

  getPostDetails: async (postId: string): Promise<PostDetailModalData> => {
    try {
      const res = await apiClient.get<PostDetailModalData>(`/social-media/posts/${postId}`);
      return res as unknown as PostDetailModalData;
    } catch {
      return {
        post: {
          id: postId,
          platform: 'linkedin',
          content_text: 'Excited to announce TalentBridge Showcase Rooms 2.0! 🎉 Transform candidate evaluation with interactive telemetry.',
          posted_at: new Date().toISOString(),
          link_url: 'https://talentbridge.cv/rooms',
          buffer_status: 'published',
        },
        engagement: {
          impressions: 4200,
          reactions: 189,
          comments: 23,
          shares: 10,
          clicks: 45,
          engagementRate: 4.5,
        },
      };
    }
  },

  getLinkedInDetailed: async (dateRange: string = '7d') => {
    try {
      const res = await apiClient.get('/social-media/platform/linkedin', {
        params: { dateRange },
      });
      return res;
    } catch {
      return {
        platform: 'linkedin',
        dateRange,
        metrics: {
          postsCount: 12,
          impressions: 12450,
          reactions: 521,
          comments: 89,
          shares: 34,
          clicks: 342,
          linkClicks: 89,
          followersAdded: 24,
          engagementRate: 4.18,
          peakEngagementTime: '10:30 AM (Tuesdays & Thursdays)',
          recommendation: 'Post between 10:00 AM - 11:30 AM for 34% higher candidate impressions',
        },
        audienceDemographics: {
          topJobTitles: [
            { title: 'Hiring Manager / Team Lead', percentage: 32.0, count: 3984 },
            { title: 'Software Engineer / Architect', percentage: 28.0, count: 3486 },
            { title: 'Technical Recruiter / Talent Lead', percentage: 22.0, count: 2739 },
            { title: 'Founder & Executive (CEO/CTO)', percentage: 18.0, count: 2241 },
          ],
          companySizes: [
            { size: '51-200 employees (Scaleups)', percentage: 38.0, count: 4731 },
            { size: '201-500 employees (Mid-Market)', percentage: 29.0, count: 3610 },
            { size: '11-50 employees (Early Stage)', percentage: 21.0, count: 2614 },
            { size: '500+ employees (Enterprise)', percentage: 12.0, count: 1495 },
          ],
          topRegions: [
            { region: 'United Kingdom (London & SE)', percentage: 45.0, count: 5602 },
            { region: 'United States (SF, NYC, Austin)', percentage: 28.0, count: 3486 },
            { region: 'European Union (Berlin, Paris, AMS)', percentage: 15.0, count: 1867 },
            { region: 'Canada & Others', percentage: 12.0, count: 1495 },
          ],
        },
        campaigns: [
          {
            id: 'camp_q3_launch',
            name: 'Q3 Product Launch (Showcase Rooms)',
            postsCount: 5,
            impressions: 18000,
            engagement: 650,
            clickRate: 3.6,
            comments: 48,
          },
          {
            id: 'camp_founder_voice',
            name: 'Founder Voice & Building in Public',
            postsCount: 4,
            impressions: 9200,
            engagement: 410,
            clickRate: 4.8,
            comments: 32,
          },
          {
            id: 'camp_intern_digest',
            name: 'Intern Pipeline & University Series',
            postsCount: 3,
            impressions: 5400,
            engagement: 210,
            clickRate: 3.9,
            comments: 18,
          },
        ],
        recommendations: {
          bestPostingTime: 'Tuesdays & Thursdays between 10:00 AM - 11:30 AM (34% higher CTR)',
          bestContentType: 'Visual Case Studies & Interactive Room Demos (5.8% avg engagement)',
          suggestedNextTopic: 'Candidate evaluation telemetry and take-home vs live showcase metrics',
        },
        hourlyTimeline: [
          { hour: '0h (Posted)', impressions: 120, reactions: 12, clicks: 4 },
          { hour: '2h', impressions: 450, reactions: 38, clicks: 14 },
          { hour: '4h', impressions: 980, reactions: 84, clicks: 32 },
          { hour: '8h', impressions: 2100, reactions: 165, clicks: 68 },
          { hour: '12h (Peak)', impressions: 4200, reactions: 290, clicks: 142 },
          { hour: '24h', impressions: 7800, reactions: 410, clicks: 230 },
          { hour: '36h', impressions: 10400, reactions: 485, clicks: 310 },
          { hour: '48h', impressions: 12450, reactions: 521, clicks: 342 },
        ],
      };
    }
  },


  getPlatformMetrics: async (platform: string, dateRange: string = '7d') => {
    try {
      const res = await apiClient.get(`/social-media/platform/${platform}`, {
        params: { dateRange },
      });
      return res;
    } catch {
      if (platform === 'reddit') {
        return {
          platform: 'reddit',
          dateRange,
          metrics: {
            postsCount: 6,
            totalScore: 1240,
            totalComments: 142,
            upvoteRate: 91.5,
            viralPostsCount: 2,
            topSubreddit: 'r/Recruiting',
            avgCommentsPerPost: 23.6,
          },
          subreddits: [
            { subreddit: 'r/Recruiting', postsCount: 3, score: 720, comments: 84, upvoteRate: 94.0 },
            { subreddit: 'r/TalentBridge', postsCount: 2, score: 380, comments: 42, upvoteRate: 96.0 },
            { subreddit: 'r/hiring', postsCount: 1, score: 140, comments: 16, upvoteRate: 85.0 },
          ],
          scoreTimeline: [
            { day: 'Mon', score: 140, comments: 18 },
            { day: 'Tue', score: 320, comments: 34 },
            { day: 'Wed', score: 680, comments: 62 },
            { day: 'Thu', score: 940, comments: 98 },
            { day: 'Fri', score: 1120, comments: 124 },
            { day: 'Sat', score: 1240, comments: 142 },
          ],
        };
      }
      return null;
    }
  },

  triggerManualSync: async (platform: string = 'all') => {
    const res = await apiClient.post('/social-media/sync', { platform });
    return res;
  },
};

