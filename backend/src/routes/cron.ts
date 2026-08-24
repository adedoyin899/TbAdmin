import { Router } from 'express';
import { verifyCronSecret } from '../middleware/verifyCronSecret.js';
import {
  handleBufferCron,
  handleLinkedInCron,
  handleRedditCron,
  handleCampaignCron,
} from '../controllers/cronController.js';

export const cronRouter = Router();

// Vercel Cron only — secured via CRON_SECRET bearer token, not JWT
cronRouter.use(verifyCronSecret);

cronRouter.get('/buffer', handleBufferCron);
cronRouter.get('/linkedin', handleLinkedInCron);
cronRouter.get('/reddit', handleRedditCron);
cronRouter.get('/campaign', handleCampaignCron);
