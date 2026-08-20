import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, status);
}
