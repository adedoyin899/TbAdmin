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
