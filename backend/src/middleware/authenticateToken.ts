import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';
import { sendError } from '../utils/response.js';
import type { JWTPayload } from '../types/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback to httpOnly cookie if present
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 'Authentication token required.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }

  req.user = decoded;
  next();
}
