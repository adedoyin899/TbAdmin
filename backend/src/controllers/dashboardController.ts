import type { Response } from 'express';
import { postHogService } from '../services/postHogService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';

/**
 * GET /api/dashboard/funnel
 * Query Params: ?dateRange=30d&signupSource=all
 */
export async function getFunnelDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const dateRange = (req.query.dateRange as string) || '30d';
    const signupSource = (req.query.signupSource as string) || 'all';

    const funnelData: any = await postHogService.fetchFunnelData(dateRange, signupSource);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const responsePayload = {
      dateRange,
      signupSource,
      totalUsers: funnelData.totalUsers,
      overallConversion: funnelData.overallConversion,
      stages: funnelData.stages,
      funnel: funnelData.stages,
      dropoff: funnelData.stages.map((s: any) => ({
        stage: s.stage,
        dropOff: s.dropOff,
      })),
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getFunnelDashboard:', error);
    return sendError(res, error.message || 'Failed to fetch funnel metrics.', 500);
  }
}
