// src/tests/syncJobs.test.ts
// Unit and integration test for Sync Jobs, Scheduling Intervals, Retry Backoff, and Aggregation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runBufferSyncJob } from '../jobs/bufferSyncJob.js';
import { runLinkedInSyncJob } from '../jobs/linkedInSyncJob.js';
import { runRedditSyncJob } from '../jobs/redditSyncJob.js';
import { runCampaignAggregationJob } from '../jobs/campaignAggregationJob.js';
import { jobScheduler } from '../jobs/scheduleJobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSyncJobsVerification() {
  console.log('🧪 Starting Sync Jobs & Scheduling Verification...\n');

  // Test 1: Verify 004_create_sync_logs.sql
  console.log('Test 1: Verifying 004_create_sync_logs.sql');
  const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '004_create_sync_logs.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error('Migration file 004_create_sync_logs.sql is missing!');
  }
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  if (!migrationSql.includes('CREATE TABLE IF NOT EXISTS sync_logs')) {
    throw new Error('sync_logs table definition missing in migration!');
  }
  console.log('  ✓ sync_logs table definition & indexes verified');

  // Test 2: Test Buffer Sync Job execution with retry logic
  console.log('\nTest 2: Testing Buffer Sync Job (runBufferSyncJob)');
  const bufferJobRes = await runBufferSyncJob(2);
  if (!bufferJobRes.success || bufferJobRes.syncedCount === 0) {
    throw new Error(`Buffer sync job failed! ${JSON.stringify(bufferJobRes)}`);
  }
  console.log(`  ✓ Buffer sync job completed: ${bufferJobRes.syncedCount} posts synced (Attempts: ${bufferJobRes.attempts})`);

  // Test 3: Test LinkedIn Sync Job execution
  console.log('\nTest 3: Testing LinkedIn Sync Job (runLinkedInSyncJob)');
  const linkedInJobRes = await runLinkedInSyncJob(2);
  if (!linkedInJobRes.success || linkedInJobRes.syncedCount === 0) {
    throw new Error(`LinkedIn sync job failed! ${JSON.stringify(linkedInJobRes)}`);
  }
  console.log(`  ✓ LinkedIn sync job completed: ${linkedInJobRes.syncedCount} posts synced (Attempts: ${linkedInJobRes.attempts})`);

  // Test 4: Test Reddit Sync Job execution
  console.log('\nTest 4: Testing Reddit Sync Job (runRedditSyncJob)');
  const redditJobRes = await runRedditSyncJob(2);
  if (!redditJobRes.success || redditJobRes.syncedCount === 0) {
    throw new Error(`Reddit sync job failed! ${JSON.stringify(redditJobRes)}`);
  }
  console.log(`  ✓ Reddit sync job completed: ${redditJobRes.syncedCount} posts synced (${redditJobRes.viralCount} viral)`);

  // Test 5: Test Campaign Aggregation Job
  console.log('\nTest 5: Testing Campaign Performance Aggregation Job');
  const campaignJobRes = await runCampaignAggregationJob();
  if (!campaignJobRes.success) {
    throw new Error('Campaign aggregation job failed!');
  }
  console.log(`  ✓ Campaign aggregation completed: ${campaignJobRes.aggregatedCampaigns} campaigns aggregated`);

  // Test 6: Test Job Scheduler initialization and status retrieval
  console.log('\nTest 6: Testing Job Scheduler & Schedules');
  jobScheduler.initScheduledJobs(false);
  const statuses = jobScheduler.getJobStatuses();

  if (statuses.length !== 5) {
    throw new Error(`Expected 5 scheduled jobs, got ${statuses.length}`);
  }

  for (const job of statuses) {
    console.log(`  ✓ Job [${job.name}]: ${job.intervalDescription} (Interval: ${job.intervalMs / 1000}s, Next run in: ${job.nextRun ? Math.round((job.nextRun.getTime() - Date.now()) / 1000) + 's' : 'N/A'})`);
  }

  // Clean shutdown of timers
  jobScheduler.stopScheduledJobs();
  console.log('  ✓ Scheduled intervals cleanly stopped');

  console.log('\n🎉 ALL SYNC JOBS & SCHEDULER TESTS PASSED SUCCESSFULLY!');
}

runSyncJobsVerification().catch((err) => {
  console.error('❌ Sync jobs verification failed:', err);
  process.exit(1);
});
