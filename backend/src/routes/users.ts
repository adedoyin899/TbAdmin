import { Router } from 'express';
import {
  searchUsers,
  getUserProfile,
  getUserOverview,
  getSessionRecordings,
  getRecordingSnapshots,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

export const userRouter = Router();

// Protect all user routes with JWT authentication
// Note: authenticateToken is applied globally or here
userRouter.use(authenticateToken);

// GET /api/users/overview?horizon=30d | 24h | 7d | 90d | lifetime
userRouter.get('/overview', getUserOverview);

// GET /api/users/recordings?limit=25&distinctId=...
userRouter.get('/recordings', getSessionRecordings);

// GET /api/users/recordings/:recordingId/snapshots
userRouter.get('/recordings/:recordingId/snapshots', getRecordingSnapshots);

// GET /api/users/search?q=alice or ?email=...
userRouter.get('/search', searchUsers);

// GET /api/users (alias for search with no query)
userRouter.get('/', searchUsers);

// GET /api/users/:userId (Granular deep dive profile)
userRouter.get('/:userId', getUserProfile);
