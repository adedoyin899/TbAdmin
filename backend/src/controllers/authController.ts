import type { Response } from 'express';
import { pool } from '../db/connection.js';
import { comparePassword, generateToken } from '../services/authService.js';
import { adminAccountService } from '../services/adminAccountService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';
import type { LoginRequest, LoginResponse, AuthUser } from '../types/auth.js';
import type { AdminUserRow } from '../types/database.js';

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. First authenticate against persistent admin accounts service
    const authResult = await adminAccountService.authenticate(normalizedEmail, password);
    if (authResult.success && authResult.account) {
      const acc = authResult.account;
      const authUser: AuthUser = {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        isOwner: acc.isOwner,
        createdAt: acc.createdAt,
        lastLogin: new Date().toISOString(),
      };

      const token = generateToken({
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess<LoginResponse>(res, { token, user: authUser }, 200, 'Login successful');
    }

    if (authResult.message && authResult.message.includes('suspended')) {
      return sendError(res, authResult.message, 403);
    }

    // 2. Secondary fallback: PostgreSQL admin_users table
    let userRow: AdminUserRow | null = null;
    try {
      const dbResult = await pool.query<AdminUserRow>(
        'SELECT * FROM admin_users WHERE LOWER(email) = $1 AND is_active = TRUE LIMIT 1',
        [normalizedEmail]
      );
      if (dbResult.rows.length > 0) {
        userRow = dbResult.rows[0];
      }
    } catch (dbErr) {
      logger.warn('Database query failed:', dbErr);
    }

    if (userRow) {
      const isPasswordValid = await comparePassword(password, userRow.password_hash);
      if (isPasswordValid) {
        pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [userRow.id]).catch(() => {});
        pool.query(
          'INSERT INTO audit_log (admin_user_id, action, resource, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
          [userRow.id, 'login', 'auth', req.ip, req.headers['user-agent'] || 'unknown']
        ).catch(() => {});

        const authUser: AuthUser = {
          id: userRow.id,
          email: userRow.email,
          role: userRow.role,
          createdAt: userRow.created_at.toISOString(),
          lastLogin: new Date().toISOString(),
        };

        const token = generateToken({
          id: authUser.id,
          email: authUser.email,
          role: authUser.role,
        });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return sendSuccess<LoginResponse>(res, { token, user: authUser }, 200, 'Login successful');
      }
    }

    return sendError(res, 'Invalid email or password.', 401);
  } catch (error: any) {
    logger.error('Login error:', error);
    return sendError(res, error.message || 'Login failed.', 500);
  }
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return sendSuccess(res, { loggedOut: true }, 200, 'Logged out successfully');
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return sendError(res, 'Unauthorized.', 401);
  }

  const account = adminAccountService.findByEmail(req.user.email);

  const authUser: AuthUser = {
    id: req.user.id,
    name: account?.name,
    email: req.user.email,
    role: account?.role || req.user.role,
    isOwner: account?.isOwner,
  };

  return sendSuccess(res, authUser, 200);
}

// ── Team & Credential Management Endpoints (Master Admin) ───────

export async function getTeamAccounts(req: AuthenticatedRequest, res: Response) {
  try {
    const callerRole = req.user?.role || 'Super Admin';
    const accounts = adminAccountService.getAccounts(callerRole);
    return sendSuccess(res, accounts, 200);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve team accounts.', 500);
  }
}

export async function changeUserPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const email = String(req.params.email || '');
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return sendError(res, 'Password must be at least 4 characters.', 400);
    }

    const updated = await adminAccountService.changePassword(email, newPassword);
    return sendSuccess(
      res,
      updated,
      200,
      `Password for ${email} has been changed successfully. Previous password is no longer valid.`
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to change password.', 400);
  }
}

export async function addTeamAccount(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email) {
      return sendError(res, 'Name and email are required.', 400);
    }

    const newAcc = await adminAccountService.createAccount({
      name,
      email,
      role: role || 'Admin',
      password: password || 'password123',
    });

    return sendSuccess(res, newAcc, 201, `Account for ${name} provisioned successfully.`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to add administrator account.', 400);
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const email = String(req.params.email || '');
    const { role } = req.body;
    if (!role) {
      return sendError(res, 'Role is required.', 400);
    }

    const updated = adminAccountService.updateRole(email, role);
    return sendSuccess(res, updated, 200, `Role for ${email} updated to ${role}.`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update user role.', 400);
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const email = String(req.params.email || '');
    const updated = adminAccountService.toggleStatus(email);
    return sendSuccess(res, updated, 200, `Account status for ${email} changed to ${updated.status}.`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update account status.', 400);
  }
}

export async function deleteTeamAccount(req: AuthenticatedRequest, res: Response) {
  try {
    const email = String(req.params.email || '');
    adminAccountService.deleteAccount(email);
    return sendSuccess(res, { deleted: true }, 200, `Administrator account ${email} deleted.`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete account.', 400);
  }
}
