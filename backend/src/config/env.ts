import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://tbadmin.vercel.app').split(','),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talentbridge_analytics',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_min32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RBAC_ENABLED: process.env.RBAC_ENABLED === 'true',
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',
  POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID || '',
  POSTHOG_HOST: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'mg.talentbridge.io',
  MAILGUN_WEBHOOK_SIGNING_KEY: process.env.MAILGUN_WEBHOOK_SIGNING_KEY || '',
  BUFFER_API_KEY: process.env.BUFFER_API_KEY || '',
  BUFFER_API_URL: process.env.BUFFER_API_URL || 'https://api.bufferapp.com/1',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || '',
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || '',
  LINKEDIN_COMPANY_URN: process.env.LINKEDIN_COMPANY_URN || 'urn:li:organization:12345',
  LINKEDIN_REFRESH_TOKEN: process.env.LINKEDIN_REFRESH_TOKEN || '',
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || '',
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || '',
  REDDIT_REFRESH_TOKEN: process.env.REDDIT_REFRESH_TOKEN || '',
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || 'TalentBridge Analytics (by /u/talentbridge_admin)',
};



