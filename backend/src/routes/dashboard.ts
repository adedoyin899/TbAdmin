import { Router } from 'express';
import { getFunnelDashboard } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const dashboardRouter = Router();

// Protect all dashboard routes with JWT authentication
dashboardRouter.use(authenticateToken);

// GET /api/dashboard/funnel
dashboardRouter.get('/funnel', getFunnelDashboard);
