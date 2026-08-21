import { Router } from 'express';
import {
  getIntegrationsConfig,
  updateIntegrationsConfig,
  testIntegration,
  flushAllCache,
} from '../controllers/integrationsController.js';

export const integrationRouter = Router();

// GET /api/integrations - Fetch active integration credentials & cache TTLs
integrationRouter.get('/', getIntegrationsConfig);

// PUT /api/integrations - Save & hot-reload live credentials across services
integrationRouter.put('/', updateIntegrationsConfig);

// POST /api/integrations/test - Run live API handshake test against external provider
integrationRouter.post('/test', testIntegration);

// POST /api/integrations/flush-cache - Invalidate and flush all cache layers
integrationRouter.post('/flush-cache', flushAllCache);
