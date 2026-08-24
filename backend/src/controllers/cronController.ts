import type { Request, Response } from 'express';
import { runBufferSyncJob } from '../jobs/bufferSyncJob.js';
import { runLinkedInSyncJob } from '../jobs/linkedInSyncJob.js';
import { runRedditSyncJob } from '../jobs/redditSyncJob.js';
import { runCampaignAggregationJob } from '../jobs/campaignAggregationJob.js';
import { logger } from '../utils/logger.js';

export async function handleBufferCron(_req: Request, res: Response) {
  try {
    const result = await runBufferSyncJob();
    res.status(200).json({ success: true, job: 'buffer', result });
  } catch (err: any) {
    logger.error('[Cron] Buffer job threw:', err.message);
    res.status(500).json({ success: false, job: 'buffer', error: err.message });
  }
}

export async function handleLinkedInCron(_req: Request, res: Response) {
  try {
    const result = await runLinkedInSyncJob();
    res.status(200).json({ success: true, job: 'linkedin', result });
  } catch (err: any) {
    logger.error('[Cron] LinkedIn job threw:', err.message);
    res.status(500).json({ success: false, job: 'linkedin', error: err.message });
  }
}

export async function handleRedditCron(_req: Request, res: Response) {
  try {
    const result = await runRedditSyncJob();
    res.status(200).json({ success: true, job: 'reddit', result });
  } catch (err: any) {
    logger.error('[Cron] Reddit job threw:', err.message);
    res.status(500).json({ success: false, job: 'reddit', error: err.message });
  }
}

export async function handleCampaignCron(_req: Request, res: Response) {
  try {
    const result = await runCampaignAggregationJob();
    res.status(200).json({ success: true, job: 'campaign', result });
  } catch (err: any) {
    logger.error('[Cron] Campaign aggregation job threw:', err.message);
    res.status(500).json({ success: false, job: 'campaign', error: err.message });
  }
}
