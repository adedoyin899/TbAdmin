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
      blockAdoption: featureData.topBlocks,
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
    const retentionData: any = await postHogService.fetchRetentionData(signupSource);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      dateRange,
      summary: {
        totalViews: { count: 142850, change: 16.2 },
        uniqueViews: { count: 108922, change: -2.4 },
        avgTimeSpent: { value: '7m 24s', change: '+2 min' },
        engagementQuality: { percentage: 68.5, change: 3.2 },
      },
      viewsTrend: [
        { month: 'Jan', desktop: 14000, mobile: 8000, tablet: 2000 },
        { month: 'Feb', desktop: 18000, mobile: 11000, tablet: 3000 },
        { month: 'Mar', desktop: 24000, mobile: 15000, tablet: 4500 },
        { month: 'Apr', desktop: 21000, mobile: 14000, tablet: 4000 },
        { month: 'May', desktop: 31000, mobile: 20000, tablet: 6000 },
        { month: 'Jun', desktop: 38000, mobile: 26000, tablet: 7500 },
      ],
      trafficSources: [
        { name: 'Direct Link', percentage: 42, count: 59997 },
        { name: 'LinkedIn Share', percentage: 31, count: 44283 },
        { name: 'Twitter / X', percentage: 15, count: 21427 },
        { name: 'Talent Directory', percentage: 12, count: 17142 },
      ],
      devices: [
        { name: 'Desktop (macOS / Win)', value: 58, color: '#0D1F1E' },
        { name: 'Mobile (iOS / Android)', value: 34, color: '#2DD4BF' },
        { name: 'Tablet (iPad / Android)', value: 8, color: '#0F766E' },
      ],
      geoTraffic: [
        { country: 'United States', code: 'US', flag: '🇺🇸', views: 54200, percentage: 38.0 },
        { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', views: 35700, percentage: 25.0 },
        { country: 'Germany', code: 'DE', flag: '🇩🇪', views: 17100, percentage: 12.0 },
        { country: 'Canada', code: 'CA', flag: '🇨🇦', views: 14300, percentage: 10.0 },
        { country: 'Ghana', code: 'GH', flag: '🇬🇭', views: 11400, percentage: 8.0 },
        { country: 'India', code: 'IN', flag: '🇮🇳', views: 9950, percentage: 7.0 },
      ],
      topRecommendations: [
        {
          id: 'rec-01',
          type: 'peak_time',
          title: 'Peak Recruiter Traffic on Tuesdays & Thursdays 14:00–18:00 UTC',
          description: 'Share new showcase updates on Tuesday mornings to maximize first-day recruiter impressions.',
          impact: 'high',
        },
      ],
      topPerformingRooms: [
        { roomId: 'room_alice_01', roomName: "Alice's Portfolio", ownerName: 'Alice Chen', ownerEmail: 'alice@example.com', views: 1247, uniqueViews: 1092, engagement: 68.5 },
        { roomId: 'room_kwame_01', roomName: 'Kwame Asante — Dev', ownerName: 'Kwame Asante', ownerEmail: 'kwame@example.com', views: 2840, uniqueViews: 1845, engagement: 82.4 },
        { roomId: 'room_priya_01', roomName: 'Priya Sharma — UX', ownerName: 'Priya Sharma', ownerEmail: 'priya@example.com', views: 980, uniqueViews: 720, engagement: 74.1 },
      ],
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getRoomsDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch rooms metrics.', 500);
  }
}
