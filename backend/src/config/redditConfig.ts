// src/config/redditConfig.ts
// Configuration for Reddit Subreddits to Track, API Endpoints, and Scoring Thresholds

export const REDDIT_SUBREDDITS = [
  'r/TalentBridge', // Primary brand subreddit
  'r/Recruiting', // Talent acquisition & recruiting community
  'r/hiring', // Job & hiring discussions
  'r/careerdevelopment', // Professional & career growth
];

export const REDDIT_CONFIG = {
  OAUTH_BASE_URL: 'https://www.reddit.com/api/v1',
  API_BASE_URL: 'https://oauth.reddit.com',
  VIRAL_SCORE_THRESHOLD: 100, // Posts with score >= 100 marked as viral
  DEFAULT_POST_LIMIT: 25,
  SYNC_INTERVAL_HOURS: 2,
};
