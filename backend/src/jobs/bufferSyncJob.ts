// src/jobs/bufferSyncJob.ts
// Automated Sync Job for Buffer Scheduled & Published Posts with Retry Logic and Sync Logs

import { bufferService } from '../services/bufferService.js';
import { query } from '../db/connection.js';
import { logger } from '../utils/logger.js';

export async function logSync(
  service: string,
  status: 'success' | 'failed' | 'partial' | 'retrying',
  syncCount: number = 0,
  errorMessage: string | null = null
): Promise<void> {
  try {
    await query(
      `
      INSERT INTO sync_logs (service, status, sync_count, error_message, synced_at)
      VALUES ($1, $2, $3, $4, NOW());
      `,
      [service, status, syncCount, errorMessage]
    );
  } catch (err: any) {
    logger.warn(`[WARN] Failed to write to sync_logs for ${service}:`, err.message);
  }
}

/**
 * Execute Buffer Sync with exponential backoff retry (max 3 attempts)
 */
export async function runBufferSyncJob(maxRetries: number = 3): Promise<{
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
      logger.info(`🔄 [Buffer Sync Job] Starting sync attempt ${attempt}/${maxRetries}...`);
      const result = await bufferService.syncBufferData();

      if (result.errors.length > 0 && result.syncedCount === 0) {
        throw new Error(result.errors.join('; '));
      }

      const status = result.errors.length > 0 ? 'partial' : 'success';
      const errorMsg = result.errors.length > 0 ? result.errors.join('; ') : null;

      await logSync('buffer', status, result.syncedCount, errorMsg);
      logger.info(`✅ [Buffer Sync Job] Completed successfully on attempt ${attempt}: ${result.syncedCount} posts synced.`);

      return {
        success: true,
        syncedCount: result.syncedCount,
        attempts: attempt,
      };
    } catch (err: any) {
      lastError = err.message || 'Unknown Buffer sync error';
      logger.warn(`⚠️ [Buffer Sync Job] Attempt ${attempt} failed: ${lastError}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await logSync('buffer', 'retrying', 0, `Attempt ${attempt} failed: ${lastError}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  await logSync('buffer', 'failed', 0, `All ${maxRetries} attempts failed: ${lastError}`);
  logger.error(`❌ [Buffer Sync Job] All ${maxRetries} retry attempts failed: ${lastError}`);

  return {
    success: false,
    syncedCount: 0,
    attempts: attempt,
    error: lastError,
  };
}
