// src/utils/bufferHelpers.ts
// Helper utilities for formatting timestamps, standardizing platform names, and calculating metrics for Buffer

import type { SocialPlatform, BufferStatus } from '../types/socialMedia.js';

/**
 * Format Buffer epoch timestamps (seconds or milliseconds) or strings into standard UTC Date objects.
 */
export function formatBufferTimestamp(timestamp?: number | string | Date | null): Date {
  if (!timestamp) {
    return new Date();
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (typeof timestamp === 'number') {
    // Buffer API returns epoch timestamps in seconds (10 digits) rather than milliseconds (13 digits)
    if (timestamp < 10000000000) {
      return new Date(timestamp * 1000);
    }
    return new Date(timestamp);
  }

  const parsed = new Date(timestamp);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Transform Buffer service/platform identifiers into standardized SocialPlatform values.
 */
export function transformBufferPlatform(serviceName?: string | null): SocialPlatform {
  if (!serviceName) {
    return 'buffer';
  }

  const normalized = serviceName.trim().toLowerCase();

  if (normalized.includes('linkedin')) {
    return 'linkedin';
  }
  if (normalized.includes('reddit')) {
    return 'reddit';
  }
  if (normalized.includes('twitter') || normalized === 'x') {
    return 'twitter';
  }
  if (normalized.includes('facebook')) {
    return 'facebook';
  }
  if (normalized.includes('buffer')) {
    return 'buffer';
  }

  return 'other';
}

/**
 * Map Buffer update status strings to standardized BufferStatus.
 */
export function mapBufferStatus(status?: string | null): BufferStatus {
  if (!status) {
    return 'scheduled';
  }

  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case 'sent':
    case 'published':
      return 'published';
    case 'buffer':
    case 'pending':
    case 'scheduled':
      return 'scheduled';
    case 'draft':
      return 'draft';
    case 'error':
    case 'failed':
      return 'failed';
    default:
      return 'scheduled';
  }
}

/**
 * Calculate engagement rate percentage: (totalEngagement / totalImpressions) * 100
 * Returns rate rounded to 2 decimal places.
 */
export function calculateEngagementRate(engagement: number, impressions: number): number {
  if (!impressions || impressions <= 0 || !engagement || engagement <= 0) {
    return 0.0;
  }

  const rate = (engagement / impressions) * 100;
  return Math.round(rate * 100) / 100;
}
