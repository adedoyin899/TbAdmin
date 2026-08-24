import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/response.js';

export function verifyCronSecret(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!ENV.CRON_SECRET || authHeader !== `Bearer ${ENV.CRON_SECRET}`) {
    return sendError(res, 'Unauthorized', 401);
  }
  next();
}
