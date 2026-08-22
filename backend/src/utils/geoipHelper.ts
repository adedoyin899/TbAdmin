// src/utils/geoipHelper.ts
// IP Address to Geolocation lookup with in-memory caching & graceful fallbacks

import axios from 'axios';

export interface GeoLocationResult {
  country: string;
  city: string;
  region?: string;
  countryCode?: string;
  isPrivate?: boolean;
}

const geoCache = new Map<string, { data: GeoLocationResult; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if IP is private/local/reserved
 */
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '').trim();
  return (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === 'localhost' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  );
}

/**
 * Lookup Geolocation (Country, City, Region) for given IP address
 */
export async function lookupIpLocation(ip?: string | null): Promise<GeoLocationResult> {
  const defaultLocation: GeoLocationResult = {
    country: 'United Kingdom',
    city: 'London',
    region: 'England',
    countryCode: 'GB',
  };

  if (!ip) {
    return defaultLocation;
  }

  const cleanIp = ip.replace(/^::ffff:/, '').trim();

  if (isPrivateIp(cleanIp)) {
    return {
      ...defaultLocation,
      isPrivate: true,
    };
  }

  // Check cache
  const cached = geoCache.get(cleanIp);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${cleanIp}`, {
      timeout: 3000,
    });

    if (response.data && response.data.status === 'success') {
      const result: GeoLocationResult = {
        country: response.data.country || 'United Kingdom',
        city: response.data.city || 'London',
        region: response.data.regionName || 'England',
        countryCode: response.data.countryCode || 'GB',
      };

      geoCache.set(cleanIp, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return result;
    }
  } catch (error: any) {
    // Graceful fallback without throwing
  }

  return defaultLocation;
}
