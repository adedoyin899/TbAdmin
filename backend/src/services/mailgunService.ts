// src/services/mailgunService.ts
// Enhanced Mailgun Webhook Processor with Device, Client, Geolocation, and Link Attribution

import { pool } from '../db/connection.js';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { lookupIpLocation } from '../utils/geoipHelper.js';
import { logger } from '../utils/logger.js';
import type { EmailEngagementDetailedRow } from '../types/socialMedia.js';

class MailgunService {
  /**
   * Derive user-friendly link label from target URL
   */
  public getLinkLabel(url?: string | null): string {
    if (!url) return 'Unknown Link';
    const lower = url.toLowerCase();

    if (lower.includes('/room/new') || lower.includes('/build') || lower.includes('/signup') || lower.includes('/start')) {
      return 'Start Building Your Room (CTA Button)';
    }
    if (lower.includes('/templates')) {
      return 'Explore Showcase Room Templates';
    }
    if (lower.includes('/guides') || lower.includes('/docs')) {
      return 'Creator Quickstart Guide';
    }
    if (lower.includes('/blog')) {
      return 'Blog & Case Studies';
    }
    if (lower.includes('linkedin.com') || lower.includes('twitter.com') || lower.includes('reddit.com')) {
      return 'Social Media Channel Link';
    }

    try {
      const parsed = new URL(url);
      return `${parsed.pathname.replace(/^\//, '') || parsed.hostname} Link`;
    } catch {
      return 'Website Link';
    }
  }

  /**
   * Ingest and enrich Mailgun event with device, client, geo, and link index data
   */
  public async processMailgunWebhookEvent(eventData: any): Promise<{
    success: boolean;
    mailgunEventId?: number;
    detailedRecordId?: number;
  }> {
    if (!eventData) {
      return { success: false };
    }

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
    const ip = eventData.ip || null;
    const clientInfo = eventData['client-info'] || {};
    const rawUserAgent = clientInfo['user-agent'] || eventData['user-agent'] || null;
    const eventTimestamp = eventData.timestamp
      ? new Date(eventData.timestamp * 1000)
      : new Date();

    // 1. Parse device, email client, and OS
    const { deviceType, emailClient } = parseUserAgent(rawUserAgent, clientInfo);

    // 2. Resolve Geolocation from IP
    const geo = await lookupIpLocation(ip);

    // 3. Determine Link index & label
    const linkLabel = linkUrl ? this.getLinkLabel(linkUrl) : null;
    const linkIndex = eventData.link_index !== undefined ? Number(eventData.link_index) : 0;

    // 4. Determine timestamps and device columns for mailgun_events
    const isClick = eventType === 'clicked';
    const isOpen = eventType === 'opened';

    let mailgunEventId: number | undefined;

    try {
      // 5. Upsert into mailgun_events table
      const eventRes = await pool.query(
        `
        INSERT INTO mailgun_events (
          event_type,
          email_address,
          campaign_id,
          campaign_name,
          message_id,
          link_url,
          timestamp,
          clicked_device,
          click_client,
          click_geolocation_country,
          click_geolocation_city,
          opened_device,
          opened_client,
          opened_geolocation_country,
          opened_at,
          first_clicked_at,
          click_link_index,
          click_link_label,
          metadata
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19
        )
        ON CONFLICT (message_id) DO UPDATE
        SET event_type = EXCLUDED.event_type,
            link_url = COALESCE(EXCLUDED.link_url, mailgun_events.link_url),
            timestamp = EXCLUDED.timestamp,
            clicked_device = COALESCE(EXCLUDED.clicked_device, mailgun_events.clicked_device),
            click_client = COALESCE(EXCLUDED.click_client, mailgun_events.click_client),
            click_geolocation_country = COALESCE(EXCLUDED.click_geolocation_country, mailgun_events.click_geolocation_country),
            click_geolocation_city = COALESCE(EXCLUDED.click_geolocation_city, mailgun_events.click_geolocation_city),
            opened_device = COALESCE(EXCLUDED.opened_device, mailgun_events.opened_device),
            opened_client = COALESCE(EXCLUDED.opened_client, mailgun_events.opened_client),
            opened_geolocation_country = COALESCE(EXCLUDED.opened_geolocation_country, mailgun_events.opened_geolocation_country),
            opened_at = COALESCE(EXCLUDED.opened_at, mailgun_events.opened_at),
            first_clicked_at = COALESCE(EXCLUDED.first_clicked_at, mailgun_events.first_clicked_at),
            click_link_index = COALESCE(EXCLUDED.click_link_index, mailgun_events.click_link_index),
            click_link_label = COALESCE(EXCLUDED.click_link_label, mailgun_events.click_link_label),
            metadata = EXCLUDED.metadata
        RETURNING id;
        `,
        [
          eventType,
          emailAddress,
          campaignId,
          campaignName,
          messageId,
          linkUrl,
          eventTimestamp,
          isClick ? deviceType : null,
          isClick ? emailClient : null,
          isClick ? geo.country : null,
          isClick ? geo.city : null,
          isOpen ? deviceType : null,
          isOpen ? emailClient : null,
          isOpen ? geo.country : null,
          isOpen ? eventTimestamp : null,
          isClick ? eventTimestamp : null,
          isClick ? linkIndex : null,
          isClick ? linkLabel : null,
          JSON.stringify(eventData),
        ]
      );

      if (eventRes.rows?.[0]) {
        mailgunEventId = Number(eventRes.rows[0].id);
      }

      // 6. Insert detailed record into email_engagement_detailed table
      const detailedRes = await pool.query<EmailEngagementDetailedRow>(
        `
        INSERT INTO email_engagement_detailed (
          mailgun_event_id,
          campaign_id,
          campaign_name,
          email_address,
          event_type,
          link_url,
          click_link_index,
          click_link_label,
          device_type,
          email_client,
          geolocation_country,
          geolocation_city,
          user_agent,
          ip_address,
          opened_at,
          clicked_at,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id;
        `,
        [
          mailgunEventId || null,
          campaignId,
          campaignName,
          emailAddress,
          eventType,
          linkUrl,
          linkIndex,
          linkLabel,
          deviceType,
          emailClient,
          geo.country,
          geo.city,
          rawUserAgent,
          ip && !geo.isPrivate ? ip : null,
          isOpen ? eventTimestamp : null,
          isClick ? eventTimestamp : null,
          JSON.stringify(eventData),
        ]
      );

      const detailedRecordId = detailedRes.rows?.[0] ? Number(detailedRes.rows[0].id) : undefined;
      logger.info(`✅ Ingested detailed email telemetry: ${eventType} (${deviceType}, ${emailClient}, ${geo.country}) for ${emailAddress}`);

      return {
        success: true,
        mailgunEventId,
        detailedRecordId,
      };
    } catch (err: any) {
      logger.warn('[WARN] Error storing enhanced email event in DB (handled gracefully):', err.message);
      return { success: true };
    }
  }
}

export const mailgunService = new MailgunService();
