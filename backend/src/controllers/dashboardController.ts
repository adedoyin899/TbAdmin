import type { Response } from 'express';
import { postHogService } from '../services/postHogService.js';
import { emailService } from '../services/emailService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';

/**
 * 1. GET /api/dashboard/funnel
 * Query Params: ?dateRange=30d&signupSource=all
 */
export async function getFunnelDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const signupSource = (req.query.signupSource as string) || 'all';

    const funnelData: any = await postHogService.fetchFunnelData(dateRange, signupSource);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const stages = funnelData.stages || [];
    const dropoff = stages.slice(1).map((s: any, idx: number) => ({
      from: stages[idx]?.stage || '',
      to: s.stage || '',
      percentage: Number(s.dropOff || 0),
    }));

    const responsePayload = {
      dateRange,
      signupSource,
      totalUsers: funnelData.totalUsers || 0,
      overallConversion: funnelData.overallConversion || 0,
      stages,
      funnel: stages,
      dropoff,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getFunnelDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch funnel metrics.', 500);
  }
}

/**
 * 2. GET /api/dashboard/features
 * Query Params: ?dateRange=30d
 */
export async function getFeatureDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const featureData: any = await postHogService.fetchFeatureAdoptionData(dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      dateRange,
      totalRoomsCreated: featureData.totalRoomsCreated,
      topBlocks: featureData.topBlocks,
      blockAdoption: featureData.blockAdoption || featureData.topBlocks,
      templateAdoption: featureData.templateAdoption || [],
      themeDistribution: featureData.themeDistribution,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getFeatureDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch feature metrics.', 500);
  }
}

/**
 * 3. GET /api/dashboard/retention
 * Query Params: ?signupSource=all
 */
export async function getRetentionDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const signupSource = (req.query.signupSource as string) || 'all';
    const dateRange = (req.query.dateRange as string) || 'all';
    const retentionData: any = await postHogService.fetchRetentionData(signupSource, dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      dateRange,
      signupSource,
      retention7d: retentionData.retention7d,
      retention30d: retentionData.retention30d,
      trend: retentionData.trend,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getRetentionDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch retention metrics.', 500);
  }
}

/**
 * 4. GET /api/dashboard/email
 * Query Params: ?dateRange=30d
 */
export async function getEmailDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const emailData: any = await emailService.fetchEmailDashboardData(dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      dateRange,
      campaigns: emailData.campaigns,
      topPerformers: emailData.topPerformers,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getEmailDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch email metrics.', 500);
  }
}

/**
 * 5. GET /api/dashboard/rooms
 * Query Params: ?dateRange=30d
 */
export async function getRoomsDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const roomsData: any = await postHogService.fetchRoomsAnalytics(dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      ...roomsData,
      dateRange,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getRoomsDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch rooms metrics.', 500);
  }
}

/**
 * 6. GET /api/dashboard/website
 * Query Params: ?dateRange=30d
 */
export async function getWebsiteDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const websiteData: any = await postHogService.fetchWebsiteAnalytics(dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      ...websiteData,
      dateRange,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getWebsiteDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch website analytics.', 500);
  }
}

/**
 * 7. GET /api/dashboard/channels
 * Returns acquisition channel breakdown from PostHog person properties.
 * Visible to ALL authenticated roles — this is how we know where signups are coming from.
 * Query Params: ?horizon=30d (24h | 7d | 30d | 90d | lifetime)
 */
export async function getChannelsDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const horizon = (req.query.horizon as string) || '30d';
    const overview: any = await postHogService.fetchUserOverview(horizon);

    const now = new Date();

    // Channel color palette — consistent branding across all chart types
    const CHANNEL_COLORS: Record<string, string> = {
      'LinkedIn': '#0A66C2',
      'WhatsApp': '#25D366',
      'Direct Link': '#0D9488',
      'Direct Traffic': '#0D9488',
      'Organic Search (Google)': '#4285F4',
      'Organic Search (Bing)': '#00809D',
      'Organic Search (DuckDuckGo)': '#DE5833',
      'Organic Search & Social': '#8B5CF6',
      'Twitter / X': '#000000',
      'Facebook': '#1877F2',
      'Instagram': '#E1306C',
      'Reddit': '#FF4500',
      'Telegram': '#229ED9',
      'Slack': '#4A154B',
      'GitHub': '#181717',
      'YouTube': '#FF0000',
      'TikTok': '#010101',
      'Product Hunt': '#DA552F',
      'Email Campaigns': '#F59E0B',
      'Paid Ads': '#EC4899',
      'Creator Referrals': '#10B981',
      'Google Ads (Paid)': '#4285F4',
      'LinkedIn Ads (Paid)': '#0A66C2',
      'Meta Ads (Facebook/Instagram)': '#1877F2',
    };

    const DEFAULT_COLORS = ['#0D9488', '#2DD4BF', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#FA520F', '#6366F1'];

    const rawChannels: { name: string; count: string | number; percentage: number }[] = overview.acquisitionChannels || [];
    const totalUsers = overview.lifetime?.totalRegisteredUsers || 0;

    const channels = rawChannels.map((ch, idx) => ({
      name: ch.name,
      count: Number(ch.count),
      percentage: ch.percentage,
      color: CHANNEL_COLORS[ch.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));

    // Categorize into groups for high-level view
    const socialPlatforms = channels.filter(c =>
      ['LinkedIn', 'WhatsApp', 'Twitter / X', 'Facebook', 'Instagram', 'Reddit',
       'Telegram', 'Slack', 'TikTok', 'YouTube', 'GitHub', 'Product Hunt'].includes(c.name)
    );
    const searchChannels = channels.filter(c => c.name.startsWith('Organic Search'));
    const paidChannels = channels.filter(c =>
      c.name.includes('Paid') || c.name.includes('Ads')
    );
    const directChannels = channels.filter(c =>
      c.name.includes('Direct') || c.name.includes('Referral') || c.name.includes('Email')
    );

    const responsePayload = {
      horizon,
      postHogConnected: overview.postHogConnected,
      totalUsers,
      totalChannels: channels.length,
      channels,
      groups: {
        social: {
          label: 'Social & Messaging',
          count: socialPlatforms.reduce((sum, c) => sum + c.count, 0),
          percentage: socialPlatforms.reduce((sum, c) => sum + c.percentage, 0),
          channels: socialPlatforms,
        },
        search: {
          label: 'Organic Search',
          count: searchChannels.reduce((sum, c) => sum + c.count, 0),
          percentage: searchChannels.reduce((sum, c) => sum + c.percentage, 0),
          channels: searchChannels,
        },
        paid: {
          label: 'Paid Campaigns',
          count: paidChannels.reduce((sum, c) => sum + c.count, 0),
          percentage: paidChannels.reduce((sum, c) => sum + c.percentage, 0),
          channels: paidChannels,
        },
        direct: {
          label: 'Direct, Referral & Email',
          count: directChannels.reduce((sum, c) => sum + c.count, 0),
          percentage: directChannels.reduce((sum, c) => sum + c.percentage, 0),
          channels: directChannels,
        },
      },
      lastSynced: overview.lastSynced || now.toISOString(),
      cachedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getChannelsDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch channel breakdown.', 500);
  }
}

/**
 * 8. GET /api/dashboard/errors
 * Query Params: ?dateRange=30d
 */
export async function getErrorMonitoringDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const errorData: any = await postHogService.fetchErrorMonitoring(dateRange);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const responsePayload = {
      ...errorData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getErrorMonitoringDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch error monitoring data.', 500);
  }
}
