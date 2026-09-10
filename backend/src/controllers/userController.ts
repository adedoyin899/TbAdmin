import type { Response } from 'express';
import { postHogService } from '../services/postHogService.js';
import { pool } from '../db/connection.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ENV } from '../config/env.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';
import type { MailgunEventRow } from '../types/database.js';

/**
 * GET /api/users/search
 * Query Params: ?q=alice or ?email=alice@example.com
 * Behavior: NO CACHING - Fresh PostHog Person API queries
 */
export async function searchUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const query = (req.query.q as string) || (req.query.email as string) || (req.query.search as string) || '';

    const usersData = await postHogService.searchUsers(query);

    return sendSuccess(res, usersData, 200);
  } catch (error: any) {
    logger.error('Error in searchUsers:', error);
    return sendError(res, error.message || 'Failed to search users.', 500);
  }
}

/**
 * GET /api/users/:userId
 * Params: :userId
 * Behavior: NO CACHING - Fresh PostHog person events & mailgun_events table lookup
 */
export async function getUserProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.params.userId as string;

    if (!userId) {
      return sendError(res, 'User ID is required.', 400);
    }

    // 1. Fetch raw user profile and events from PostHog
    const profile = await postHogService.fetchUserProfile(userId);

    if (!profile) {
      return sendError(res, `User profile '${userId}' was not found in PostHog.`, 404);
    }

    // 2. Query real-time email engagement from PostgreSQL mailgun_events table
    let emailEngagement: any[] = profile.emailEngagement || [];
    if (profile.user && profile.user.email) {
      try {
        const mailEvents = await pool.query<MailgunEventRow>(
          `
          SELECT campaign_name, event_type, timestamp
          FROM mailgun_events
          WHERE email_address = $1
          ORDER BY timestamp DESC
          LIMIT 20
          `,
          [profile.user.email]
        );

        if (mailEvents.rows.length > 0) {
          // Group by campaign name
          const campaignMap = new Map<string, any>();
          for (const ev of mailEvents.rows) {
            const cName = ev.campaign_name || 'System Email';
            if (!campaignMap.has(cName)) {
              campaignMap.set(cName, {
                campaignName: cName,
                sent: ev.timestamp.toISOString(),
                opened: null,
                clicked: null,
              });
            }
            const c = campaignMap.get(cName);
            if (ev.event_type === 'opened') c.opened = ev.timestamp.toISOString();
            if (ev.event_type === 'clicked') c.clicked = ev.timestamp.toISOString();
          }
          emailEngagement = Array.from(campaignMap.values());
        }
      } catch (dbErr) {
        logger.warn('Failed querying mailgun_events for user, using telemetry defaults:', dbErr);
      }
    }

    // 3. Construct direct PostHog Session Replay URL (respecting configured PostHog host)
    const postHogSessionReplayUrl =
      profile.postHogSessionReplayUrl ||
      `${ENV.POSTHOG_HOST || 'https://eu.i.posthog.com'}/project/${ENV.POSTHOG_PROJECT_ID || '120100'}/replay/${userId}`;

    // 4. Real per-user Room Insights — resolves which room(s) actually belong to this person
    // from live PostHog room events, instead of a single hardcoded object returned identically
    // for every user requested.
    const personName = profile.properties?.name || profile.properties?.$name || undefined;
    let roomInsights: any[] = [];
    try {
      roomInsights = (await postHogService.fetchUserRoomInsights(profile.user?.distinctId || userId, personName)) as any[];
    } catch (roomErr) {
      logger.warn('Failed fetching room insights for user, returning empty list:', roomErr);
    }

    const responsePayload = {
      user: profile.user,
      events: profile.events || [],
      properties: profile.properties || {},
      distinctIds: profile.distinctIds || [userId],
      rawPerson: profile.rawPerson || null,
      emailEngagement,
      roomInsights,
      postHogSessionReplayUrl: profile.postHogSessionReplayUrl || postHogSessionReplayUrl,
      postHogPersonUrl:
        profile.postHogPersonUrl ||
        `${ENV.POSTHOG_HOST || 'https://eu.i.posthog.com'}/project/${ENV.POSTHOG_PROJECT_ID || '120100'}/person/${encodeURIComponent(profile.user?.distinctId || userId)}`,
      postHogEventsUrl:
        profile.postHogEventsUrl ||
        `${ENV.POSTHOG_HOST || 'https://eu.i.posthog.com'}/project/${ENV.POSTHOG_PROJECT_ID || '120100'}/events?distinct_id=${encodeURIComponent(profile.user?.distinctId || userId)}`,
    };

    return sendSuccess(res, responsePayload, 200);
  } catch (error: any) {
    logger.error('Error in getUserProfile:', error);
    return sendError(res, error.message || 'Failed to fetch user profile.', 500);
  }
}

/**
 * GET /api/users/overview
 * Query Params: ?horizon=30d | 24h | 7d | 90d | lifetime
 * Behavior: Aggregates lifetime vs horizon metrics from real PostHog data
 */
export async function getUserOverview(req: AuthenticatedRequest, res: Response) {
  try {
    const horizon = (req.query.horizon as string) || '30d';
    const overview = await postHogService.fetchUserOverview(horizon);
    return sendSuccess(res, overview, 200);
  } catch (error: any) {
    logger.error('Error in getUserOverview:', error);
    return sendError(res, error.message || 'Failed to fetch user overview.', 500);
  }
}

/**
 * GET /api/users/recordings
 * Query Params: ?limit=25&distinctId=82
 * Behavior: Retrieves live session recordings list from PostHog
 */
export async function getSessionRecordings(req: AuthenticatedRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 25;
    const distinctId = (req.query.distinctId as string) || undefined;
    const recordings = await postHogService.fetchSessionRecordings(limit, distinctId);
    return sendSuccess(res, recordings, 200);
  } catch (error: any) {
    logger.error('Error in getSessionRecordings:', error);
    return sendError(res, error.message || 'Failed to fetch session recordings.', 500);
  }
}

/**
 * GET /api/users/recordings/:recordingId/snapshots
 * Params: :recordingId
 * Behavior: Retrieves recording snapshot sources for in-app player
 */
export async function getRecordingSnapshots(req: AuthenticatedRequest, res: Response) {
  try {
    const recordingId = req.params.recordingId as string;
    if (!recordingId) {
      return sendError(res, 'Recording ID is required.', 400);
    }
    const snapshots = await postHogService.fetchRecordingSnapshots(recordingId);
    return sendSuccess(res, snapshots, 200);
  } catch (error: any) {
    logger.error('Error in getRecordingSnapshots:', error);
    return sendError(res, error.message || 'Failed to fetch recording snapshots.', 500);
  }
}
