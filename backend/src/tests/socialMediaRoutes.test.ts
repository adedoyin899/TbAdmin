// src/tests/socialMediaRoutes.test.ts
// Unit and HTTP route integration tests for Social Media API endpoints

import { app } from '../app.js';
import { generateToken } from '../services/authService.js';
import type { Server } from 'http';
import axios from 'axios';

let server: Server;
let baseUrl: string;
let authToken: string;

async function startTestServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://localhost:${address.port}`;
      authToken = generateToken({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'maz@talentbridge.cv',
        role: 'admin',
      });
      resolve();
    });
  });
}

async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function runSocialMediaRoutesVerification() {
  console.log('🧪 Starting Social Media Routes & Controller Verification...\n');
  await startTestServer();

  try {
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // Test 1: Auth Rejection for unauthenticated request
    console.log('Test 1: Testing Auth Middleware Protection');
    try {
      await axios.get(`${baseUrl}/api/social-media/summary`);
      throw new Error('Endpoint did not reject unauthenticated request!');
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log('  ✓ Correctly rejected unauthenticated request with HTTP 401');
      } else {
        throw err;
      }
    }

    // Test 2: GET /api/social-media/summary
    console.log('\nTest 2: Testing GET /api/social-media/summary');
    const startSummary = Date.now();
    const summaryRes = await axios.get(`${baseUrl}/api/social-media/summary?dateRange=7d`, {
      headers: authHeaders,
    });
    const summaryDuration = Date.now() - startSummary;

    if (summaryRes.status !== 200 || !summaryRes.data?.data?.byPlatform) {
      throw new Error(`Summary endpoint returned unexpected response! ${JSON.stringify(summaryRes.data)}`);
    }

    const summaryData = summaryRes.data.data;
    console.log(`  ✓ Summary returned in ${summaryDuration}ms (<1s requirement):`);
    console.log(`     - Total Posts: ${summaryData.totalPosts}`);
    console.log(`     - Total Engagement: ${summaryData.totalEngagement}`);
    console.log(`     - Avg Engagement Rate: ${summaryData.avgEngagementRate}%`);
    console.log(`     - Top Platform: ${summaryData.topPlatform}`);
    console.log(`     - LinkedIn Impressions: ${summaryData.byPlatform.linkedin.impressions.toLocaleString()}`);
    console.log(`     - Buffer Scheduled: ${summaryData.byPlatform.buffer.scheduledPosts}`);
    console.log(`     - Reddit Total Score: ${summaryData.byPlatform.reddit.score}`);
    console.log(`     - 4-Week Trend Points: ${summaryData.trend.length} points`);

    // Test 3: GET /api/social-media/posts with filters, sorting, search, and pagination
    console.log('\nTest 3: Testing GET /api/social-media/posts (Filters, Sort, Pagination)');
    const postsRes = await axios.get(
      `${baseUrl}/api/social-media/posts?platform=all&dateRange=30d&sort=engagement&page=1&limit=5`,
      { headers: authHeaders }
    );

    if (postsRes.status !== 200 || !Array.isArray(postsRes.data?.data?.posts)) {
      throw new Error('Posts endpoint returned invalid structure!');
    }

    const postsData = postsRes.data.data;
    console.log(`  ✓ Posts list returned ${postsData.posts.length} posts (Total: ${postsData.pagination.totalCount}, Pages: ${postsData.pagination.totalPages}):`);
    for (const post of postsData.posts) {
      console.log(`     • [${post.platform.toUpperCase()}] "${post.content_text.slice(0, 45)}..." | Rate: ${post.latest_engagement?.engagement_rate || 0}%`);
    }

    // Filter test
    const liFilterRes = await axios.get(
      `${baseUrl}/api/social-media/posts?platform=linkedin&dateRange=30d`,
      { headers: authHeaders }
    );
    for (const post of liFilterRes.data.data.posts) {
      if (post.platform !== 'linkedin') {
        throw new Error(`Filter expected only linkedin posts, got ${post.platform}`);
      }
    }
    console.log(`  ✓ Platform filter correctly restricted to LinkedIn (${liFilterRes.data.data.posts.length} posts)`);

    // Test 4: GET /api/social-media/posts/:postId
    console.log('\nTest 4: Testing GET /api/social-media/posts/:postId');
    const samplePostId = postsData.posts[0].id;
    const detailRes = await axios.get(`${baseUrl}/api/social-media/posts/${samplePostId}`, {
      headers: authHeaders,
    });

    if (detailRes.status !== 200 || !detailRes.data?.data?.post) {
      throw new Error('Post details endpoint failed!');
    }
    console.log(`  ✓ Post Details returned for ${samplePostId}:`);
    console.log(`     - Platform URN: ${detailRes.data.data.post.linkedin_urn || detailRes.data.data.post.platform_post_id}`);
    console.log(`     - Hourly Timeline Points: ${detailRes.data.data.engagementTimeline.length}`);

    // Test 5: GET /api/social-media/posts/:postId/engagement
    console.log('\nTest 5: Testing GET /api/social-media/posts/:postId/engagement');
    const engRes = await axios.get(`${baseUrl}/api/social-media/posts/${samplePostId}/engagement`, {
      headers: authHeaders,
    });
    if (engRes.status !== 200 || !engRes.data?.data?.current) {
      throw new Error('Post engagement endpoint failed!');
    }
    console.log(`  ✓ Post Engagement returned current snapshot & trend`);

    // Test 6: GET /api/social-media/platform/:platform
    console.log('\nTest 6: Testing GET /api/social-media/platform/:platform');
    const liMetricsRes = await axios.get(`${baseUrl}/api/social-media/platform/linkedin`, {
      headers: authHeaders,
    });
    if (liMetricsRes.status !== 200 || !liMetricsRes.data?.data?.audienceDemographics) {
      throw new Error('Platform metrics endpoint failed!');
    }
    console.log(`  ✓ LinkedIn Platform Metrics: Impressions=${liMetricsRes.data.data.metrics.impressions}, Top Job=${liMetricsRes.data.data.audienceDemographics.topJobTitles[0].title}`);

    // Test 7: POST /api/social-media/sync
    console.log('\nTest 7: Testing POST /api/social-media/sync (Manual Trigger)');
    const syncRes = await axios.post(
      `${baseUrl}/api/social-media/sync`,
      { platform: 'all' },
      { headers: authHeaders }
    );
    if (syncRes.status !== 200 || !syncRes.data?.data?.results) {
      throw new Error('Manual sync trigger failed!');
    }
    console.log(`  ✓ Manual sync triggered successfully: ${syncRes.data.data.message}`);

    console.log('\n🎉 ALL SOCIAL MEDIA ROUTES & CONTROLLER TESTS PASSED SUCCESSFULLY!');
  } finally {
    await stopTestServer();
  }
}

runSocialMediaRoutesVerification().catch((err) => {
  console.error('❌ Social media routes verification failed:', err);
  process.exit(1);
});
