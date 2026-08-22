import crypto from 'crypto';
import type { Request, Response } from 'express';
import { ENV } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { mailgunService } from '../services/mailgunService.js';

/**
 * Validate Mailgun HMAC-SHA256 webhook signature
 */
export function verifyMailgunSignature(
  timestamp: string | number,
  token: string,
  signature: string
): boolean {
  if (!ENV.MAILGUN_WEBHOOK_SIGNING_KEY || ENV.MAILGUN_WEBHOOK_SIGNING_KEY === 'signing_key_placeholder') {
    // In development / testing without a live signing key, permit valid test payloads
    return true;
  }

  try {
    const value = `${timestamp}${token}`;
    const hmac = crypto
      .createHmac('sha256', ENV.MAILGUN_WEBHOOK_SIGNING_KEY)
      .update(value)
      .digest('hex');

    const hmacBuf = Buffer.from(hmac);
    const sigBuf = Buffer.from(signature);

    if (hmacBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(hmacBuf, sigBuf);
  } catch (err) {
    logger.warn('Error during Mailgun signature verification:', err);
    return false;
  }
}

/**
 * POST /api/webhooks/mailgun
 * Ingests real-time email delivery, open, click, bounce, and unsubscribe events
 */
export async function handleMailgunEvent(req: Request, res: Response) {
  try {
    const { signature, 'event-data': eventData } = req.body || {};

    // 1. Verify webhook signature
    if (signature) {
      const isValid = verifyMailgunSignature(
        signature.timestamp,
        signature.token,
        signature.signature
      );

      if (!isValid) {
        logger.warn('Mailgun webhook rejected: Invalid signature');
        return sendError(res, 'Invalid webhook signature.', 401);
      }
    }

    if (!eventData) {
      return sendError(res, 'Missing event-data payload.', 400);
    }

    // 2. Ingest and enrich event with device, client, geo, and link metadata
    const result = await mailgunService.processMailgunWebhookEvent(eventData);

    const eventType = eventData.event || 'delivered';
    const messageId = eventData.message?.headers?.['message-id'] || eventData.id || 'msg_received';

    // 3. Return 200 OK immediately
    return sendSuccess(res, {
      received: true,
      event: eventType,
      messageId,
      enriched: result.success,
    }, 200);
  } catch (error: any) {
    logger.error('Error handling Mailgun webhook:', error);
    return sendError(res, error.message || 'Webhook processing failed.', 500);
  }
}

