// src/utils/userAgentParser.ts
// User-Agent & Client-Info parser to detect device types, email clients, and operating systems

import type { DeviceType } from '../types/socialMedia.js';

export interface ParsedUserAgent {
  deviceType: DeviceType;
  emailClient: string;
  os: string;
  browser: string;
  rawUserAgent: string;
}

/**
 * Parse user-agent string and/or Mailgun client-info to extract device type and email client.
 */
export function parseUserAgent(
  userAgent?: string | null,
  clientInfo?: {
    'client-type'?: string;
    'client-name'?: string;
    'client-os'?: string;
    'device-type'?: string;
    'user-agent'?: string;
  }
): ParsedUserAgent {
  const ua = (userAgent || clientInfo?.['user-agent'] || '').trim();
  const uaLower = ua.toLowerCase();

  // 1. Determine Device Type
  let deviceType: DeviceType = 'unknown';

  if (clientInfo?.['device-type']) {
    const dt = clientInfo['device-type'].toLowerCase();
    if (dt.includes('mobile') || dt.includes('phone')) {
      deviceType = 'mobile';
    } else if (dt.includes('tablet') || dt.includes('ipad')) {
      deviceType = 'tablet';
    } else if (dt.includes('desktop') || dt.includes('pc') || dt.includes('mac')) {
      deviceType = 'desktop';
    }
  }

  if (deviceType === 'unknown') {
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/windows nt|macintosh|mac os x|linux|cros|x11/i.test(ua)) {
      deviceType = 'desktop';
    } else if (ua.length > 0) {
      deviceType = 'desktop';
    }
  }

  // 2. Determine Email Client
  let emailClient = 'Other';

  if (clientInfo?.['client-name']) {
    emailClient = clientInfo['client-name'];
  } else if (uaLower.includes('googleimageproxy') || uaLower.includes('gmail')) {
    emailClient = 'Gmail';
  } else if (uaLower.includes('outlook') || uaLower.includes('office365') || uaLower.includes('microsoft')) {
    emailClient = 'Outlook';
  } else if (uaLower.includes('apple mail') || uaLower.includes('mail/ios') || uaLower.includes('cfnetwork') || uaLower.includes('darwin')) {
    emailClient = 'Apple Mail';
  } else if (uaLower.includes('yahoo') || uaLower.includes('yahoomail')) {
    emailClient = 'Yahoo Mail';
  } else if (uaLower.includes('thunderbird')) {
    emailClient = 'Thunderbird';
  } else if (uaLower.includes('chrome') || uaLower.includes('safari') || uaLower.includes('firefox') || uaLower.includes('edge')) {
    emailClient = 'Webmail';
  }

  // 3. Determine Operating System
  let os = 'Unknown';
  if (clientInfo?.['client-os']) {
    os = clientInfo['client-os'];
  } else if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ios')) {
    os = 'iOS';
  } else if (uaLower.includes('mac os x') || uaLower.includes('macintosh')) {
    os = 'macOS';
  } else if (uaLower.includes('android')) {
    os = 'Android';
  } else if (uaLower.includes('windows')) {
    os = 'Windows';
  } else if (uaLower.includes('linux')) {
    os = 'Linux';
  }

  // 4. Determine Browser
  let browser = 'Unknown';
  if (uaLower.includes('edg/')) browser = 'Edge';
  else if (uaLower.includes('chrome/')) browser = 'Chrome';
  else if (uaLower.includes('safari/')) browser = 'Safari';
  else if (uaLower.includes('firefox/')) browser = 'Firefox';

  return {
    deviceType,
    emailClient,
    os,
    browser,
    rawUserAgent: ua,
  };
}
