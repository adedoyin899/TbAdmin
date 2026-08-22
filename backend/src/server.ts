import { app } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import { jobScheduler } from './jobs/scheduleJobs.js';

const PORT = parseInt(ENV.PORT, 10) || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 TalentBridge Analytics API running on http://localhost:${PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);

  // Initialize automated background synchronization jobs
  jobScheduler.initScheduledJobs(false);
});

const handleShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  jobScheduler.stopScheduledJobs();
  server.close(() => {
    logger.info('Process terminated.');
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

