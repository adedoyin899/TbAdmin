import { Router } from 'express';
import { searchUsers, getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const userRouter = Router();

// Protect all user routes with JWT authentication
userRouter.use(authenticateToken);

// GET /api/users/search?q=alice or ?email=...
userRouter.get('/search', searchUsers);

// GET /api/users (alias for search with no query)
userRouter.get('/', searchUsers);

// GET /api/users/:userId
userRouter.get('/:userId', getUserProfile);
