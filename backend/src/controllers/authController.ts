import type { Response } from 'express';
import { pool } from '../db/connection.js';
import { comparePassword, generateToken, hashPassword } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';
import type { LoginRequest, LoginResponse, AuthUser } from '../types/auth.js';
import type { AdminUserRow } from '../types/database.js';

// Precomputed dev fallback hash for maz@talentbridge.cv (password: temp_password_123)
let DEV_MAZ_HASH: string | null = null;
(async () => {
  try {
    DEV_MAZ_HASH = await hashPassword('temp_password_123');
  } catch {}
})();

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    let userRow: AdminUserRow | null = null;

    // 1. Try querying PostgreSQL admin_users table
    try {
      const dbResult = await pool.query<AdminUserRow>(
        'SELECT * FROM admin_users WHERE LOWER(email) = $1 AND is_active = TRUE LIMIT 1',
        [normalizedEmail]
      );
      if (dbResult.rows.length > 0) {
        userRow = dbResult.rows[0];
      }
    } catch (dbErr) {
      logger.warn('Database query failed, using development auth fallback:', dbErr);
    }

    // 2. Dev fallback for seeded credentials if DB is not populated yet
    if (!userRow) {
      const VALID_DEV_ACCOUNTS: Record<string, string> = {
        'maz@talentbridge.cv': 'temp_password_123',
        'admin@talentbridge.cv': 'password123',
        'newuser@talentbridge.cv': 'password123',
        'test@example.com': 'password',
      };

      if (normalizedEmail in VALID_DEV_ACCOUNTS) {
        const expectedPassword = VALID_DEV_ACCOUNTS[normalizedEmail];
        const isMatch = password === expectedPassword;
        if (!isMatch) {
          return sendError(res, 'Invalid email or password.', 401);
        }

        const fallbackUser: AuthUser = {
          id: normalizedEmail === 'newuser@talentbridge.cv' ? 'usr_new_01' : '00000000-0000-0000-0000-000000000001',
          email: normalizedEmail,
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        const token = generateToken({
          id: fallbackUser.id,
          email: fallbackUser.email,
          role: fallbackUser.role,
        });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return sendSuccess<LoginResponse>(res, { token, user: fallbackUser }, 200, 'Login successful');
      }

      return sendError(res, 'Invalid email or password.', 401);
    }

    // 3. Verify password with bcrypt against database password_hash
    const isPasswordValid = await comparePassword(password, userRow.password_hash);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // 4. Update last_login timestamp & log audit entry asynchronously
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess<LoginResponse>(res, { token, user: authUser }, 200, 'Login successful');
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

  const authUser: AuthUser = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  };

  return sendSuccess(res, authUser, 200);
}
