// src/jobs/scheduleJobs.ts
// Background Job Scheduler for Continuous Platform Synchronization and Data Aggregation

import { runBufferSyncJob } from './bufferSyncJob.js';
import { runLinkedInSyncJob } from './linkedInSyncJob.js';
import { runRedditSyncJob } from './redditSyncJob.js';
import { runCampaignAggregationJob } from './campaignAggregationJob.js';
import { logger } from '../utils/logger.js';

export interface ScheduledJobInfo {
  name: string;
  service: 'buffer' | 'linkedin' | 'reddit' | 'email' | 'campaign';
  intervalDescription: string;
  intervalMs: number;
  lastRun: Date | null;
  nextRun: Date | null;
  isRunning: boolean;
}

class JobScheduler {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private jobState: Map<string, ScheduledJobInfo> = new Map();

  constructor() {
    this.registerJob('buffer', 'Buffer Posts & Engagement Sync', 'Every 1 hour', 60 * 60 * 1000);
    this.registerJob('linkedin', 'LinkedIn Organic Posts & Engagement Sync', 'Every 4 hours', 4 * 60 * 60 * 1000);
    this.registerJob('reddit', 'Reddit Community Posts & Scoring Sync', 'Every 2 hours', 2 * 60 * 60 * 1000);
    this.registerJob('email', 'Email Webhook Aggregation & Timing', 'Every 15 minutes', 15 * 60 * 1000);
    this.registerJob('campaign', 'Cross-Platform Campaign ROI Aggregation', 'Every 6 hours', 6 * 60 * 60 * 1000);
  }

  private registerJob(
    service: 'buffer' | 'linkedin' | 'reddit' | 'email' | 'campaign',
    name: string,
    intervalDescription: string,
    intervalMs: number
  ) {
    this.jobState.set(service, {
      name,
      service,
      intervalDescription,
      intervalMs,
      lastRun: null,
      nextRun: null,
      isRunning: false,
    });
  }

  /**
   * Start all background sync schedules
   */
  public initScheduledJobs(runInitialSync: boolean = false): void {
    logger.info('⏰ Initializing Social Media & Marketing background job schedulers...');

    for (const [service, info] of this.jobState.entries()) {
      // Clear any existing timer
      if (this.timers.has(service)) {
        clearInterval(this.timers.get(service)!);
      }

      info.nextRun = new Date(Date.now() + info.intervalMs);

      const timer = setInterval(async () => {
        await this.runJob(service);
      }, info.intervalMs);

      this.timers.set(service, timer);
      logger.info(`  • Registered [${info.name}]: ${info.intervalDescription}`);
    }

    if (runInitialSync) {
      logger.info('🚀 Triggering initial background sync cycle...');
      this.runAllJobs().catch((err) => {
        logger.warn('[WARN] Initial background sync cycle had errors (non-blocking):', err.message);
      });
    }
  }

  /**
   * Stop all active intervals during shutdown
   */
  public stopScheduledJobs(): void {
    logger.info('🛑 Stopping all background sync intervals...');
    for (const [service, timer] of this.timers.entries()) {
      clearInterval(timer);
      this.timers.delete(service);
    }
  }

  /**
   * Run a specific job by service identifier
   */
  public async runJob(service: string): Promise<boolean> {
    const info = this.jobState.get(service);
    if (!info) {
      logger.warn(`[WARN] Unknown sync service requested: ${service}`);
      return false;
    }

    if (info.isRunning) {
      logger.warn(`[WARN] Job [${info.name}] is already running. Skipping overlapping execution.`);
      return false;
    }

    info.isRunning = true;
    info.lastRun = new Date();

    try {
      switch (service) {
        case 'buffer':
          await runBufferSyncJob();
          break;
        case 'linkedin':
          await runLinkedInSyncJob();
          break;
        case 'reddit':
          await runRedditSyncJob();
          break;
        case 'campaign':
        case 'email':
          await runCampaignAggregationJob();
          break;
        default:
          break;
      }
      return true;
    } catch (err: any) {
      logger.error(`[ERROR] Job [${info.name}] threw an unhandled error:`, err.message);
      return false;
    } finally {
      info.isRunning = false;
      info.nextRun = new Date(Date.now() + info.intervalMs);
    }
  }

  /**
   * Trigger all sync jobs in sequence
   */
  public async runAllJobs(): Promise<void> {
    await this.runJob('buffer');
    await this.runJob('linkedin');
    await this.runJob('reddit');
    await this.runJob('campaign');
  }

  /**
   * Get telemetry status of all scheduled sync jobs
   */
  public getJobStatuses(): ScheduledJobInfo[] {
    return Array.from(this.jobState.values());
  }
}

export const jobScheduler = new JobScheduler();
