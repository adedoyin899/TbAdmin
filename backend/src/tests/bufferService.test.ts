// src/tests/bufferService.test.ts
// Unit and integration test for Buffer API Service, post parsing, helper calculations, and engagement metrics

import { bufferService } from '../services/bufferService.js';
import {
  formatBufferTimestamp,
  transformBufferPlatform,
  mapBufferStatus,
  calculateEngagementRate,
} from '../utils/bufferHelpers.js';
import type { BufferPost } from '../types/buffer.js';

async function runBufferServiceVerification() {
  console.log('🧪 Starting Buffer Service Verification...\n');

  // Test 1: Helper functions (formatBufferTimestamp, transformBufferPlatform, mapBufferStatus, calculateEngagementRate)
  console.log('Test 1: Testing Buffer Helper Functions');

  // 1.1 Timestamp formatting
  const epochSec = 1724320000;
  const dateFromEpoch = formatBufferTimestamp(epochSec);
  if (!(dateFromEpoch instanceof Date) || isNaN(dateFromEpoch.getTime())) {
    throw new Error('formatBufferTimestamp failed to convert epoch seconds to Date!');
  }
  console.log(`  ✓ formatBufferTimestamp correctly converted ${epochSec} to ${dateFromEpoch.toISOString()}`);

  // 1.2 Platform transformation
  const p1 = transformBufferPlatform('linkedin');
  const p2 = transformBufferPlatform('twitter');
  const p3 = transformBufferPlatform('x');
  const p4 = transformBufferPlatform('reddit');
  const p5 = transformBufferPlatform('unknown_channel');
  if (p1 !== 'linkedin' || p2 !== 'twitter' || p3 !== 'twitter' || p4 !== 'reddit' || p5 !== 'other') {
    throw new Error('transformBufferPlatform returned unexpected platform mapping!');
  }
  console.log('  ✓ transformBufferPlatform correctly standardized platform names');

  // 1.3 Status mapping
  const s1 = mapBufferStatus('sent');
  const s2 = mapBufferStatus('buffer');
  const s3 = mapBufferStatus('pending');
  const s4 = mapBufferStatus('draft');
  const s5 = mapBufferStatus('error');
  if (s1 !== 'published' || s2 !== 'scheduled' || s3 !== 'scheduled' || s4 !== 'draft' || s5 !== 'failed') {
    throw new Error('mapBufferStatus returned unexpected status mapping!');
  }
  console.log('  ✓ mapBufferStatus correctly mapped Buffer status values');

  // 1.4 Engagement rate calculation
  const er1 = calculateEngagementRate(382, 8420); // (382 / 8420) * 100 = 4.5368... -> 4.54
  const er2 = calculateEngagementRate(0, 5000);
  const er3 = calculateEngagementRate(100, 0);
  if (er1 !== 4.54 || er2 !== 0.0 || er3 !== 0.0) {
    throw new Error(`calculateEngagementRate failed calculation! Got ${er1}, ${er2}, ${er3}`);
  }
  console.log(`  ✓ calculateEngagementRate calculated rate correctly: 382 interactions / 8,420 impressions = ${er1}%`);

  // Test 2: fetchChannels & fetchBufferPosts
  console.log('\nTest 2: Testing fetchChannels & fetchBufferPosts');
  const channels = await bufferService.fetchChannels();
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error('fetchChannels failed to return channels!');
  }
  console.log(`  ✓ fetchChannels returned ${channels.length} connected channels:`, channels.map((c) => `${c.displayName || c.name} (${c.service})`).join(', '));

  const posts = await bufferService.fetchBufferPosts();
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('fetchBufferPosts failed to return updates!');
  }
  console.log(`  ✓ fetchBufferPosts returned ${posts.length} total posts (scheduled + published)`);

  const pendingPosts = await bufferService.fetchBufferPosts(undefined, 'pending');
  const sentPosts = await bufferService.fetchBufferPosts(undefined, 'sent');
  console.log(`  ✓ Filtered posts: ${pendingPosts.length} pending/scheduled, ${sentPosts.length} sent/published`);

  // Test 3: parseBufferPost
  console.log('\nTest 3: Testing parseBufferPost Extraction');
  const sampleUpdate: BufferPost = {
    id: 'test_upd_123',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    status: 'SENT',
    channelService: 'LINKEDIN',
    channelId: 'ch_li_1',
    text: 'Test post for TalentBridge candidate analytics! Check out the showcase demo.',
    externalLink: 'https://talentbridge.cv/demo',
    assets: [
      { source: 'https://example.com/demo.png', thumbnail: 'https://example.com/thumb.png' },
    ],
    metrics: [
      { type: 'ENGAGEMENT', name: 'clicks', value: 45, unit: 'COUNT', description: 'Clicks' },
      { type: 'ENGAGEMENT', name: 'likes', value: 120, unit: 'COUNT', description: 'Likes' },
      { type: 'ENGAGEMENT', name: 'comments', value: 15, unit: 'COUNT', description: 'Comments' },
      { type: 'ENGAGEMENT', name: 'shares', value: 8, unit: 'COUNT', description: 'Shares' },
      { type: 'REACH', name: 'reach', value: 3500, unit: 'COUNT', description: 'Reach' },
    ],
    tags: [{ id: 'campaign', name: 'Summer Hiring Sprint' }],
  };

  const parsed = bufferService.parseBufferPost(sampleUpdate);
  if (
    parsed.platform_post_id !== 'buf_test_upd_123' ||
    parsed.platform !== 'linkedin' ||
    parsed.buffer_status !== 'published' ||
    parsed.link_url !== 'https://talentbridge.cv/demo' ||
    parsed.content_image_urls.length !== 2 ||
    !(parsed.posted_at instanceof Date)
  ) {
    throw new Error('parseBufferPost failed to extract expected fields!');
  }
  console.log('  ✓ parseBufferPost successfully extracted structured post data:');
  console.log(`     - Platform: ${parsed.platform}`);
  console.log(`     - Status: ${parsed.buffer_status}`);
  console.log(`     - Link: ${parsed.link_url}`);
  console.log(`     - Images: ${parsed.content_image_urls.length} urls`);
  console.log(`     - Posted At: ${parsed.posted_at.toISOString()}`);

  // Test 4: fetchBufferEngagement
  console.log('\nTest 4: Testing fetchBufferEngagement');
  const engagement = await bufferService.fetchBufferEngagement('buf_sent_001');
  if (
    typeof engagement.impressions !== 'number' ||
    typeof engagement.reactions !== 'number' ||
    typeof engagement.comments !== 'number' ||
    typeof engagement.shares !== 'number' ||
    typeof engagement.clicks !== 'number' ||
    typeof engagement.engagement_rate !== 'number'
  ) {
    throw new Error('fetchBufferEngagement returned invalid metrics structure!');
  }
  console.log('  ✓ fetchBufferEngagement returned structured metrics:');
  console.log(`     - Impressions: ${engagement.impressions.toLocaleString()}`);
  console.log(`     - Reactions: ${engagement.reactions}`);
  console.log(`     - Comments: ${engagement.comments}`);
  console.log(`     - Shares: ${engagement.shares}`);
  console.log(`     - Clicks: ${engagement.clicks}`);
  console.log(`     - Engagement Rate: ${engagement.engagement_rate}%`);

  // Test 5: Full Sync Orchestration (Mock / Fallback)
  console.log('\nTest 5: Testing Full Sync Orchestration');
  const syncResult = await bufferService.syncBufferData();
  console.log(`  ✓ syncBufferData completed: ${syncResult.syncedCount} posts processed, ${syncResult.errors.length} errors`);
  if (syncResult.syncedCount === 0) {
    throw new Error('syncBufferData processed 0 posts!');
  }

  console.log('\n🎉 ALL BUFFER SERVICE TESTS PASSED SUCCESSFULLY!');
}

runBufferServiceVerification().catch((err) => {
  console.error('❌ Buffer service verification failed:', err);
  process.exit(1);
});
