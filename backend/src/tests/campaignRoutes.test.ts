// src/tests/campaignRoutes.test.ts
// Unit and HTTP route integration tests for Campaign Management API endpoints

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

async function runCampaignRoutesVerification() {
  console.log('🧪 Starting Campaign Routes & Controller Verification...\n');
  await startTestServer();

  try {
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // Test 1: Auth Rejection for unauthenticated request
    console.log('Test 1: Testing Auth Middleware Protection');
    try {
      await axios.get(`${baseUrl}/api/campaigns`);
      throw new Error('Endpoint did not reject unauthenticated request!');
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log('  ✓ Correctly rejected unauthenticated request with HTTP 401');
      } else {
        throw err;
      }
    }

    // Test 2: POST /api/campaigns (Create campaign)
    console.log('\nTest 2: Testing POST /api/campaigns (Campaign Creation)');
    const newCampPayload = {
      name: 'Autumn Graduate Hiring Sprint',
      description: 'Campus outreach and viral showcases for university engineering grads',
      status: 'planning',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      budgetUsd: 2000,
      goal: 'signups',
      channels: ['linkedin', 'reddit', 'email'],
    };

    const createRes = await axios.post(`${baseUrl}/api/campaigns`, newCampPayload, {
      headers: authHeaders,
    });

    if (createRes.status !== 201 || !createRes.data?.data?.id) {
      throw new Error(`Create campaign endpoint failed! ${JSON.stringify(createRes.data)}`);
    }

    const createdCamp = createRes.data.data;
    console.log(`  ✓ Created campaign "${createdCamp.name}" [ID: ${createdCamp.id}, Status: ${createdCamp.status}, Budget: $${createdCamp.budget_usd || createdCamp.budgetUsd}]`);

    // Test 3: GET /api/campaigns (List campaigns)
    console.log('\nTest 3: Testing GET /api/campaigns (List & Metrics)');
    const listRes = await axios.get(`${baseUrl}/api/campaigns?status=all`, {
      headers: authHeaders,
    });

    if (listRes.status !== 200 || !Array.isArray(listRes.data?.data?.campaigns)) {
      throw new Error('List campaigns endpoint failed!');
    }

    const campaigns = listRes.data.data.campaigns;
    console.log(`  ✓ Retrieved ${campaigns.length} campaigns:`);
    for (const c of campaigns) {
      console.log(`     • [${c.status.toUpperCase()}] "${c.name}" - Goal: ${c.goal}, Budget: $${c.budgetUsd}`);
    }

    // Test 4: GET /api/campaigns/:campaignId (Single details)
    console.log('\nTest 4: Testing GET /api/campaigns/:campaignId');
    const sampleId = campaigns[0].id;
    const detailRes = await axios.get(`${baseUrl}/api/campaigns/${sampleId}`, {
      headers: authHeaders,
    });

    if (detailRes.status !== 200 || !detailRes.data?.data?.name) {
      throw new Error('Get campaign details failed!');
    }
    console.log(`  ✓ Campaign details for "${detailRes.data.data.name}": Creator=${detailRes.data.data.creatorEmail || 'Admin'}`);

    // Test 5: GET /api/campaigns/:campaignId/performance (Detailed ROI & Breakdown)
    console.log('\nTest 5: Testing GET /api/campaigns/:campaignId/performance (ROI & Breakdown)');
    const perfRes = await axios.get(`${baseUrl}/api/campaigns/${sampleId}/performance`, {
      headers: authHeaders,
    });

    if (perfRes.status !== 200 || !perfRes.data?.data?.byChannel) {
      throw new Error('Campaign performance endpoint failed!');
    }

    const perf = perfRes.data.data;
    console.log(`  ✓ Performance Metrics for "${perf.campaign.name}":`);
    console.log(`     - Total Reach: ${perf.totalReach.toLocaleString()}`);
    console.log(`     - Total Impressions: ${perf.totalImpressions.toLocaleString()}`);
    console.log(`     - Total Engagement: ${perf.totalEngagement.toLocaleString()} (Rate: ${perf.engagementRate}%)`);
    console.log(`     - Total Clicks: ${perf.totalClicks}`);
    console.log(`     - Total Signups: ${perf.totalSignups}`);
    console.log(`     - Signup Conversion Rate: ${perf.conversionRate}%`);
    console.log(`     - Spend: $${perf.spendUsd}, CPC: $${perf.costPerClick}, CPS: $${perf.costPerSignup}, ROI: ${perf.roi}`);
    console.log(`     - Channels: Email (Rate: ${perf.byChannel.email?.conversionRate}%), LinkedIn (${perf.byChannel.linkedin?.reach} reach), Reddit (${perf.byChannel.reddit?.reach} reach)`);
    console.log(`     - Timeline Days: ${perf.timeline.length}`);

    // Test 6: PATCH /api/campaigns/:campaignId (Update campaign)
    console.log('\nTest 6: Testing PATCH /api/campaigns/:campaignId (Update status & budget)');
    const patchRes = await axios.patch(
      `${baseUrl}/api/campaigns/${sampleId}`,
      { status: 'active', budgetUsd: 2500 },
      { headers: authHeaders }
    );

    if (patchRes.status !== 200) {
      throw new Error('Update campaign failed!');
    }
    console.log(`  ✓ Updated campaign status: ${patchRes.data.data.status}`);

    // Test 7: GET /api/campaigns/:campaignId/posts (Tagged posts)
    console.log('\nTest 7: Testing GET /api/campaigns/:campaignId/posts');
    const postsRes = await axios.get(`${baseUrl}/api/campaigns/${sampleId}/posts`, {
      headers: authHeaders,
    });

    if (postsRes.status !== 200 || !Array.isArray(postsRes.data?.data?.posts)) {
      throw new Error('Get campaign posts failed!');
    }
    console.log(`  ✓ Retrieved ${postsRes.data.data.posts.length} posts tagged to campaign "${sampleId}"`);

    console.log('\n🎉 ALL CAMPAIGN ROUTES & CONTROLLER TESTS PASSED SUCCESSFULLY!');
  } finally {
    await stopTestServer();
  }
}

runCampaignRoutesVerification().catch((err) => {
  console.error('❌ Campaign routes verification failed:', err);
  process.exit(1);
});
