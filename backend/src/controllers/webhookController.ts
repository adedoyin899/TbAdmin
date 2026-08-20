import crypto from 'crypto';
import type { Request, Response } from 'express';
import { pool } from '../db/connection.js';
import { ENV } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

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

    // 2. Parse event data
    const eventType = eventData.event || 'delivered';
    const emailAddress = eventData.recipient || 'unknown@example.com';
    const messageId =
      eventData.message?.headers?.['message-id'] ||
      eventData.id ||
      `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const campaignId = Array.isArray(eventData.campaigns)
      ? eventData.campaigns[0]?.id || eventData.campaigns[0]
      : eventData.campaign_id || null;
    const campaignName =
      eventData.campaign_name ||
      (eventData.tags && eventData.tags[0]) ||
      'General Campaign';
    const linkUrl = eventData.url || null;
    const eventTimestamp = eventData.timestamp
      ? new Date(eventData.timestamp * 1000)
      : new Date();

    // 3. Persist to PostgreSQL mailgun_events table (Deduplicated via ON CONFLICT)
    try {
      await pool.query(
        `
        INSERT INTO mailgun_events (
          event_type,
          email_address,
          campaign_id,
          campaign_name,
          message_id,
          link_url,
          timestamp,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (message_id) DO UPDATE
        SET event_type = EXCLUDED.event_type,
            link_url = COALESCE(EXCLUDED.link_url, mailgun_events.link_url),
            timestamp = EXCLUDED.timestamp,
            metadata = EXCLUDED.metadata;
        `,
        [
          eventType,
          emailAddress,
          campaignId,
          campaignName,
          messageId,
          linkUrl,
          eventTimestamp,
          JSON.stringify(eventData),
        ]
      );
      logger.info(`✅ Ingested Mailgun event: ${eventType} for ${emailAddress} [${messageId}]`);
    } catch (dbErr: any) {
      logger.warn('Database insert for Mailgun event failed (handled gracefully):', dbErr.message);
    }

    // 4. Return 200 OK immediately
    return sendSuccess(res, { received: true, event: eventType, messageId }, 200);
  } catch (error: any) {
    logger.error('Error handling Mailgun webhook:', error);
    return sendError(res, error.message || 'Webhook processing failed.', 500);
  }
}
