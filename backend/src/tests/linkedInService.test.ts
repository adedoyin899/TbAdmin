// src/tests/linkedInService.test.ts
// Unit and integration test for LinkedIn API Service, OAuth management, post parsing, and engagement metrics

import { linkedInService } from '../services/linkedInService.js';
import { linkedInAuth } from '../services/linkedInAuth.js';
import type { LinkedInUGCPost } from '../types/linkedin.js';

async function runLinkedInServiceVerification() {
  console.log('🧪 Starting LinkedIn Service Verification...\n');

  // Test 1: LinkedIn OAuth Token Manager & Refresh Flow
  console.log('Test 1: Testing LinkedIn OAuth 2.0 Auth Service');
  const token = await linkedInAuth.getLinkedInAccessToken();
  if (!token || typeof token !== 'string') {
    throw new Error('getLinkedInAccessToken failed to return a valid access token!');
  }
  console.log(`  ✓ getLinkedInAccessToken returned token: ${token.slice(0, 25)}...`);

  const authUrl = linkedInAuth.generateAuthorizationUrl('https://tbadmin.talentbridge.cv/api/auth/linkedin/callback');
  if (!authUrl.includes('response_type=code') || !authUrl.includes('scope=r_organization_social')) {
    throw new Error('generateAuthorizationUrl did not generate valid OAuth authorization URL!');
  }
  console.log('  ✓ generateAuthorizationUrl created valid OAuth URL with required scopes');

  const refreshed = await linkedInAuth.refreshAccessToken();
  if (!refreshed.access_token || !refreshed.refresh_token) {
    throw new Error('refreshAccessToken failed to return fresh token pair!');
  }
  console.log(`  ✓ refreshAccessToken returned fresh access token (expires in: ${refreshed.expires_in}s)`);

  const status = linkedInAuth.getTokenStatus();
  console.log(`  ✓ getTokenStatus: hasToken=${status.hasToken}, expiresIn=${status.expiresInSeconds}s`);

  // Test 2: fetchLinkedInPosts
  console.log('\nTest 2: Testing fetchLinkedInPosts');
  const posts = await linkedInService.fetchLinkedInPosts(90);
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('fetchLinkedInPosts failed to return posts!');
  }
  console.log(`  ✓ fetchLinkedInPosts returned ${posts.length} organic company posts for the last 90 days`);

  // Test 3: parseLinkedInPost
  console.log('\nTest 3: Testing parseLinkedInPost');
  const sampleRawPost: LinkedInUGCPost = posts[0];
  const parsed = linkedInService.parseLinkedInPost(sampleRawPost);

  if (
    !parsed.platform_post_id.startsWith('li_') ||
    parsed.platform !== 'linkedin' ||
    !parsed.content_text ||
    !(parsed.posted_at instanceof Date) ||
    !parsed.linkedin_urn
  ) {
    throw new Error('parseLinkedInPost failed to correctly extract fields!');
  }
  console.log('  ✓ parseLinkedInPost successfully extracted:');
  console.log(`     - Platform: ${parsed.platform}`);
  console.log(`     - Platform Post ID: ${parsed.platform_post_id}`);
  console.log(`     - LinkedIn URN: ${parsed.linkedin_urn}`);
  console.log(`     - Content Preview: "${parsed.content_text.slice(0, 60)}..."`);
  console.log(`     - Images Attached: ${parsed.content_image_urls.length}`);
  console.log(`     - Posted At: ${parsed.posted_at.toISOString()}`);

  // Test 4: fetchLinkedInPostEngagement
  console.log('\nTest 4: Testing fetchLinkedInPostEngagement');
  const engagement = await linkedInService.fetchLinkedInPostEngagement(parsed.linkedin_urn);

  if (
    typeof engagement.impressions !== 'number' ||
    typeof engagement.reactions !== 'number' ||
    typeof engagement.comments !== 'number' ||
    typeof engagement.shares !== 'number' ||
    typeof engagement.clicks !== 'number' ||
    typeof engagement.engagement_rate !== 'number'
  ) {
    throw new Error('fetchLinkedInPostEngagement returned invalid metrics structure!');
  }
  console.log('  ✓ fetchLinkedInPostEngagement returned metrics:');
  console.log(`     - Impressions: ${engagement.impressions.toLocaleString()}`);
  console.log(`     - Reactions: ${engagement.reactions} (Likes: ${engagement.reaction_breakdown?.likes}, Celebrates: ${engagement.reaction_breakdown?.celebrates})`);
  console.log(`     - Comments: ${engagement.comments}`);
  console.log(`     - Shares: ${engagement.shares}`);
  console.log(`     - Clicks: ${engagement.clicks}`);
  console.log(`     - Engagement Rate: ${engagement.engagement_rate}%`);

  // Test 5: Audience Demographics
  console.log('\nTest 5: Testing Audience Demographics');
  const demographics = linkedInService.getAudienceDemographics();
  if (!demographics.topJobTitles.length || !demographics.topLocations.length) {
    throw new Error('getAudienceDemographics returned empty demographics!');
  }
  console.log(`  ✓ Audience Demographics: Top Job Title=${demographics.topJobTitles[0].title} (${demographics.topJobTitles[0].percentage}%), Top Region=${demographics.topLocations[0].country} (${demographics.topLocations[0].percentage}%)`);

  // Test 6: Full Sync Orchestration
  console.log('\nTest 6: Testing Full Sync Orchestration (syncLinkedInData)');
  const syncResult = await linkedInService.syncLinkedInData();
  console.log(`  ✓ syncLinkedInData completed: ${syncResult.syncedCount} posts processed, ${syncResult.errors.length} errors`);
  if (syncResult.syncedCount === 0) {
    throw new Error('syncLinkedInData processed 0 posts!');
  }

  console.log('\n🎉 ALL LINKEDIN SERVICE TESTS PASSED SUCCESSFULLY!');
}

runLinkedInServiceVerification().catch((err) => {
  console.error('❌ LinkedIn service verification failed:', err);
  process.exit(1);
});
