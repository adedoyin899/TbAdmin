// src/jobs/linkedInSyncJob.ts
// Automated Sync Job for LinkedIn Organic Company Posts & Engagement with Retry Logic

import { linkedInService } from '../services/linkedInService.js';
import { logSync } from './bufferSyncJob.js';
import { logger } from '../utils/logger.js';

/**
 * Execute LinkedIn Sync with exponential backoff retry (max 3 attempts)
 */
export async function runLinkedInSyncJob(maxRetries: number = 3): Promise<{
  success: boolean;
  syncedCount: number;
  attempts: number;
  error?: string;
}> {
  let attempt = 0;
  let lastError: string | undefined;

  while (attempt < maxRetries) {
    attempt++;
    try {
      logger.info(`🔄 [LinkedIn Sync Job] Starting sync attempt ${attempt}/${maxRetries}...`);
      const result = await linkedInService.syncLinkedInData();

      if (result.errors.length > 0 && result.syncedCount === 0) {
        throw new Error(result.errors.join('; '));
      }

      const status = result.errors.length > 0 ? 'partial' : 'success';
      const errorMsg = result.errors.length > 0 ? result.errors.join('; ') : null;

      await logSync('linkedin', status, result.syncedCount, errorMsg);
      logger.info(`✅ [LinkedIn Sync Job] Completed successfully on attempt ${attempt}: ${result.syncedCount} posts synced.`);

      return {
        success: true,
        syncedCount: result.syncedCount,
        attempts: attempt,
      };
    } catch (err: any) {
      lastError = err.message || 'Unknown LinkedIn sync error';
      logger.warn(`⚠️ [LinkedIn Sync Job] Attempt ${attempt} failed: ${lastError}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await logSync('linkedin', 'retrying', 0, `Attempt ${attempt} failed: ${lastError}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  await logSync('linkedin', 'failed', 0, `All ${maxRetries} attempts failed: ${lastError}`);
  logger.error(`❌ [LinkedIn Sync Job] All ${maxRetries} retry attempts failed: ${lastError}`);

  return {
    success: false,
    syncedCount: 0,
    attempts: attempt,
    error: lastError,
  };
}
