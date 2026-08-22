// src/routes/campaigns.ts
// Express router for Marketing Campaigns, Performance ROI, and Tagged Posts

import { Router } from 'express';
import {
  createCampaign,
  listCampaigns,
  getCampaignDetails,
  getCampaignPerformance,
  updateCampaign,
  getCampaignPosts,
} from '../controllers/campaignController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const campaignRouter = Router();

// Protect all campaign routes with JWT authentication
campaignRouter.use(authenticateToken);

// POST /api/campaigns
campaignRouter.post('/', createCampaign);

// GET /api/campaigns
campaignRouter.get('/', listCampaigns);

// GET /api/campaigns/:campaignId
campaignRouter.get('/:campaignId', getCampaignDetails);

// GET /api/campaigns/:campaignId/performance
campaignRouter.get('/:campaignId/performance', getCampaignPerformance);

// PATCH /api/campaigns/:campaignId
campaignRouter.patch('/:campaignId', updateCampaign);

// GET /api/campaigns/:campaignId/posts
campaignRouter.get('/:campaignId/posts', getCampaignPosts);
