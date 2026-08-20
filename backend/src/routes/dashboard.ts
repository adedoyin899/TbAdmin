import { Router } from 'express';
import {
  getFunnelDashboard,
  getFeatureDashboard,
  getRetentionDashboard,
  getEmailDashboard,
  getRoomsDashboard,
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const dashboardRouter = Router();

// Protect all dashboard routes with JWT authentication
dashboardRouter.use(authenticateToken);

// GET /api/dashboard/funnel
dashboardRouter.get('/funnel', getFunnelDashboard);

// GET /api/dashboard/features
dashboardRouter.get('/features', getFeatureDashboard);

// GET /api/dashboard/retention
dashboardRouter.get('/retention', getRetentionDashboard);

// GET /api/dashboard/email
dashboardRouter.get('/email', getEmailDashboard);

// GET /api/dashboard/rooms
dashboardRouter.get('/rooms', getRoomsDashboard);
