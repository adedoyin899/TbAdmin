// src/jobs/redditSyncJob.ts
// Automated Sync Job for Reddit Subreddit Posts & Engagement with Retry Logic

import { redditService } from '../services/redditService.js';
import { logSync } from './bufferSyncJob.js';
import { logger } from '../utils/logger.js';

/**
 * Execute Reddit Sync with exponential backoff retry (max 3 attempts)
 */
export async function runRedditSyncJob(maxRetries: number = 3): Promise<{
  success: boolean;
  syncedCount: number;
  viralCount: number;
  attempts: number;
  error?: string;
}> {
  let attempt = 0;
  let lastError: string | undefined;

  while (attempt < maxRetries) {
    attempt++;
    try {
      logger.info(`🔄 [Reddit Sync Job] Starting sync attempt ${attempt}/${maxRetries}...`);
      const result = await redditService.syncRedditData();

      if (result.errors.length > 0 && result.syncedCount === 0) {
        throw new Error(result.errors.join('; '));
      }

      const status = result.errors.length > 0 ? 'partial' : 'success';
      const errorMsg = result.errors.length > 0 ? result.errors.join('; ') : null;

      await logSync('reddit', status, result.syncedCount, errorMsg);
      logger.info(`✅ [Reddit Sync Job] Completed successfully on attempt ${attempt}: ${result.syncedCount} posts synced (${result.viralCount} viral).`);

      return {
        success: true,
        syncedCount: result.syncedCount,
        viralCount: result.viralCount,
        attempts: attempt,
      };
    } catch (err: any) {
      lastError = err.message || 'Unknown Reddit sync error';
      logger.warn(`⚠️ [Reddit Sync Job] Attempt ${attempt} failed: ${lastError}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await logSync('reddit', 'retrying', 0, `Attempt ${attempt} failed: ${lastError}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  await logSync('reddit', 'failed', 0, `All ${maxRetries} attempts failed: ${lastError}`);
  logger.error(`❌ [Reddit Sync Job] All ${maxRetries} retry attempts failed: ${lastError}`);

  return {
    success: false,
    syncedCount: 0,
    viralCount: 0,
    attempts: attempt,
    error: lastError,
  };
}
