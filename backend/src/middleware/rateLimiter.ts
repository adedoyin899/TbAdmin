import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  // 5-minute rolling window — shorter so users aren't locked out for 15 min
  windowMs: 5 * 60 * 1000,
  // 30 attempts per 5 min in dev (avoids self-lockout during testing),
  // 10 attempts per 5 min in production (sufficient for legitimate use)
  max: isDev ? 30 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req: Request) => {
    if (isDev) {
      const ip = req.ip || req.socket?.remoteAddress || '';
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  },
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again in a few minutes.',
  },
});
