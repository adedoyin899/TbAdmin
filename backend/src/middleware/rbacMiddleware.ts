import type { Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/response.js';
import type { AuthenticatedRequest } from './authenticateToken.js';
import type { UserRole } from '../types/database.js';

/**
 * RBAC Enforcement Middleware
 * If RBAC_ENABLED is false, all authenticated team members can access all endpoints.
 * If RBAC_ENABLED is true, only specified roles are permitted.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If RBAC is disabled via feature flag, allow through
    if (!ENV.RBAC_ENABLED) {
      return next();
    }

    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role "${req.user.role}" does not have permission for this resource.`,
        403
      );
    }

    next();
  };
}
