// src/tests/socialMediaSchema.test.ts
// Verification test for Social Media Schema migration, tables, indexes, and TypeScript types

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  CampaignRow,
  SocialMediaPostRow,
  SocialMediaEngagementRow,
  EmailEngagementDetailedRow,
  CampaignPerformanceRow,
  SyncLogRow,
  SocialMediaSummaryResponse,
} from '../types/socialMedia.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSocialMediaSchemaVerification() {
  console.log('🧪 Starting Social Media Schema & Types Verification...\n');

  // Test 1: Migration file existence and contents
  console.log('Test 1: Verifying 003_create_social_media_schema.sql');
  const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '003_create_social_media_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error('Migration file 003_create_social_media_schema.sql does not exist!');
  }
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  // Verify all 5 core tables are defined
  const requiredTables = [
    'campaigns',
    'social_media_posts',
    'social_media_engagement',
    'email_engagement_detailed',
    'campaign_performance',
  ];

  for (const table of requiredTables) {
    const tablePattern = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(`, 'i');
    if (!tablePattern.test(migrationSql)) {
      throw new Error(`Table ${table} is missing in migration SQL!`);
    }
    console.log(`  ✓ Table '${table}' definition verified`);
  }

  // Test 2: Verifying required indexes
  console.log('\nTest 2: Verifying performance indexes');
  const requiredIndexes = [
    'idx_campaigns_created_by',
    'idx_campaigns_status',
    'idx_social_media_posts_platform',
    'idx_social_media_posts_posted_at',
    'idx_social_media_posts_campaign_id',
    'idx_social_media_engagement_post_id',
    'idx_social_media_engagement_measured_at',
    'idx_campaign_performance_campaign_id',
    'idx_campaign_performance_measured_at',
    'idx_email_eng_detailed_campaign',
    'idx_email_eng_detailed_email',
  ];

  for (const idx of requiredIndexes) {
    if (!migrationSql.includes(idx)) {
      throw new Error(`Index ${idx} is missing in migration SQL!`);
    }
    console.log(`  ✓ Index '${idx}' verified`);
  }

  // Test 3: Foreign Key Constraints integrity
  console.log('\nTest 3: Checking Foreign Key Constraints');
  if (!migrationSql.includes('REFERENCES admin_users(id)')) {
    throw new Error('Foreign key to admin_users missing!');
  }
  if (!migrationSql.includes('REFERENCES campaigns(id)')) {
    throw new Error('Foreign key to campaigns missing in child tables!');
  }
  if (!migrationSql.includes('REFERENCES social_media_posts(id)')) {
    throw new Error('Foreign key to social_media_posts missing in social_media_engagement!');
  }
  console.log('  ✓ All Foreign Key relationships (admin_users, campaigns, social_media_posts) verified');

  // Test 4: TypeScript Type Check with Dummy Object Instantiations
  console.log('\nTest 4: TypeScript Type Validation');
  const dummyCampaign: CampaignRow = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Q3 Product Launch',
    description: 'Launch campaigns across LinkedIn and Reddit',
    status: 'active',
    start_date: '2026-08-01',
    end_date: '2026-08-15',
    budget_usd: 1500.0,
    goal: 'signups',
    channels: ['linkedin', 'reddit', 'email'],
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const dummyPost: SocialMediaPostRow = {
    id: '22222222-2222-2222-2222-222222222222',
    platform: 'linkedin',
    platform_post_id: 'li_post_987654',
    posted_by: '00000000-0000-0000-0000-000000000001',
    content_text: 'Excited to unveil our new TalentBridge analytics features!',
    content_image_urls: ['https://example.com/asset.png'],
    link_url: 'https://talentbridge.cv/features',
    posted_at: new Date(),
    synced_at: new Date(),
    updated_at: new Date(),
    buffer_id: 'buf_123',
    buffer_status: 'published',
    buffer_scheduled_time: null,
    linkedin_post_id: 'urn:li:share:12345678',
    linkedin_urn: 'urn:li:organization:98765',
    reddit_post_id: null,
    reddit_subreddit: null,
    campaign_id: dummyCampaign.id,
    tags: { category: 'product-update' },
    metadata: { author: 'Peter' },
    created_at: new Date(),
  };

  const dummyEngagement: SocialMediaEngagementRow = {
    id: 1,
    post_id: dummyPost.id,
    platform: 'linkedin',
    impressions: 4200,
    views: 3800,
    reactions: 156,
    comments: 23,
    shares: 10,
    reposts: 5,
    clicks: 45,
    score: 0,
    upvote_ratio: 0,
    awards: 0,
    engagement_rate: 4.5,
    measured_at: new Date(),
    synced_at: new Date(),
    created_at: new Date(),
  };

  const dummyEmailDetailed: EmailEngagementDetailedRow = {
    id: 1,
    mailgun_event_id: 10,
    campaign_id: 'camp_welcome_01',
    campaign_name: 'Weekly Digest #4',
    email_address: 'user@example.com',
    event_type: 'clicked',
    link_url: 'https://talentbridge.cv/rooms',
    click_link_index: 0,
    click_link_label: 'CTA Button',
    device_type: 'desktop',
    email_client: 'Gmail',
    geolocation_country: 'United Kingdom',
    geolocation_city: 'London',
    user_agent: 'Mozilla/5.0 ...',
    ip_address: '192.168.1.1',
    opened_at: new Date(),
    clicked_at: new Date(),
    post_click_action: 'signed_up',
    post_click_action_at: new Date(),
    post_click_user_id: 'usr_abc123',
    conversion_time_seconds: 14400,
    metadata: {},
    created_at: new Date(),
  };

  const dummyPerformance: CampaignPerformanceRow = {
    id: 1,
    campaign_id: dummyCampaign.id,
    total_reach: 28000,
    total_impressions: 35000,
    total_engagement: 1200,
    engagement_rate: 4.3,
    total_clicks: 340,
    total_signups: 45,
    signup_conversion_rate: 13.24,
    channel_data: {
      email: { reach: 2400, clicks: 89, signups: 32 },
      linkedin: { reach: 18000, clicks: 201, signups: 12 },
      reddit: { reach: 7600, clicks: 50, signups: 1 },
    },
    spend_usd: 1500.0,
    cost_per_click: 4.41,
    cost_per_signup: 33.33,
    roi: 0.0,
    measured_at: new Date(),
    synced_at: new Date(),
    created_at: new Date(),
  };

  console.log(`  ✓ Instantiated types: Campaign (${dummyCampaign.name}), Post (${dummyPost.platform}), Engagement (${dummyEngagement.reactions} reactions), Email Detail (${dummyEmailDetailed.device_type}), Performance (${dummyPerformance.total_signups} signups)`);

  console.log('\n🎉 ALL SOCIAL MEDIA SCHEMA & TYPES VERIFICATIONS PASSED SUCCESSFULLY!');
}

runSocialMediaSchemaVerification().catch((err) => {
  console.error('❌ Social media schema verification failed:', err);
  process.exit(1);
});
