import { Router } from 'express';
import { handleMailgunEvent } from '../controllers/webhookController.js';

export const webhookRouter = Router();

// POST /api/webhooks/mailgun (Server-to-server, HMAC authenticated, no JWT required)
webhookRouter.post('/mailgun', handleMailgunEvent);
