import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, error: string, statusCode = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
  });
}
