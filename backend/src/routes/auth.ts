import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticateToken, getMe);
