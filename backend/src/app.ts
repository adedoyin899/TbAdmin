import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';

export const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ENV.CORS_ORIGIN.includes(origin) || ENV.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development/preview
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'TalentBridge Analytics API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Dashboard Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dashboards', dashboardRouter);
app.use('/dashboard', dashboardRouter);

// Global Error Handler
app.use(errorHandler);
