// src/routes/socialMedia.ts
// Express router for Social Media Marketing Analytics, Posts, Engagements, and Platform breakdowns

import { Router } from 'express';
import {
  getSocialMediaSummary,
  getSocialMediaPosts,
  getPostDetails,
  getPostEngagement,
  getPlatformMetrics,
  triggerManualSync,
} from '../controllers/socialMediaController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const socialMediaRouter = Router();

// Protect all social media endpoints with JWT authentication
socialMediaRouter.use(authenticateToken);

// GET /api/social-media/summary?dateRange=7d
socialMediaRouter.get('/summary', getSocialMediaSummary);

// GET /api/social-media/posts?platform=linkedin&dateRange=30d&sort=engagement
socialMediaRouter.get('/posts', getSocialMediaPosts);

// GET /api/social-media/posts/:postId
socialMediaRouter.get('/posts/:postId', getPostDetails);

// GET /api/social-media/posts/:postId/engagement
socialMediaRouter.get('/posts/:postId/engagement', getPostEngagement);

// GET /api/social-media/platform/:platform?dateRange=7d
socialMediaRouter.get('/platform/:platform', getPlatformMetrics);

// POST /api/social-media/sync
socialMediaRouter.post('/sync', triggerManualSync);
