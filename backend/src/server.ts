import { app } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(ENV.PORT, 10) || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 TalentBridge Analytics API running on http://localhost:${PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
