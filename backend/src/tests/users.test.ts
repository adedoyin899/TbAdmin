import { postHogService } from '../services/postHogService.js';

async function runUserLookupVerification() {
  console.log('🧪 Starting 100% Live PostHog Telemetry Verification (Zero Mockups)...\n');

  // Test 1: Fetch all live persons from PostHog
  console.log('Test 1: Fetch Live PostHog Persons');
  const allUsers = await postHogService.searchUsers('');
  if (allUsers && allUsers.results && allUsers.results.length > 0) {
    console.log(`✅ Retrieved ${allUsers.results.length} live persons from PostHog API:`);
    for (const u of allUsers.results) {
      console.log(`   - ${u.firstName} (${u.email}) [Distinct ID: ${u.distinctId}] • ${u.country} (${u.browser})`);
    }
  } else {
    throw new Error('Live PostHog persons query failed!');
  }

  // Test 2: Fetch Live Profile & Event Stream for real user "82"
  console.log('\nTest 2: Fetch Live Profile & Event Stream for Distinct ID "82"');
  const profile = await postHogService.fetchUserProfile('82');
  if (profile && profile.user && profile.events) {
    console.log(`✅ User Profile for ID 82: ${profile.user.firstName} (${profile.user.email})`);
    console.log(`   Location: ${profile.user.city}, ${profile.user.country} (${profile.user.countryCode})`);
    console.log(`   Events logged: ${profile.events.length} live events`);
    if (profile.events[0]) {
      console.log(`   Most recent event: ${profile.events[0].eventName} at ${profile.events[0].timestamp}`);
    }
    console.log(`   Session replay URL: ${profile.postHogSessionReplayUrl}`);
  } else {
    throw new Error('Live user profile lookup for ID 82 failed!');
  }

  // Test 3: Fetch Live User Overview (Lifetime & 30d & 24h)
  console.log('\nTest 3: Fetch Live User Overview Aggregations');
  const overview30d: any = await postHogService.fetchUserOverview('30d');
  const overview24h: any = await postHogService.fetchUserOverview('24h');
  if (overview30d && overview30d.lifetime && overview24h && overview24h.recent) {
    console.log(`✅ Lifetime Users: ${overview30d.lifetime.totalRegisteredUsers}`);
    console.log(`   Total Recorded Sessions: ${overview30d.lifetime.totalRecordedSessions}`);
    console.log(`   30d Signups: ${overview30d.recent.newSignups} | 24h Signups: ${overview24h.recent.newSignups}`);
    console.log(`   Acquisition Channels: ${overview30d.acquisitionChannels.map((c: any) => `${c.name}: ${c.percentage}%`).join(', ')}`);
    console.log(`   Geographic Breakdown: ${overview30d.geographicDemographics.map((g: any) => `${g.country}: ${g.users} (${g.percentage}%)`).join(', ')}`);
  } else {
    throw new Error('User overview aggregation failed!');
  }

  // Test 4: Fetch Live Session Recordings from PostHog
  console.log('\nTest 4: Fetch Live Session Recordings directly from PostHog');
  const recordings = await postHogService.fetchSessionRecordings(10);
  if (recordings && recordings.results && recordings.results.length > 0) {
    console.log(`✅ Retrieved ${recordings.results.length} session recordings from PostHog`);
    console.log(`   First recording ID: ${recordings.results[0].id}`);
    console.log(`   Duration: ${recordings.results[0].duration}s | Start URL: ${recordings.results[0].startUrl}`);
  } else {
    throw new Error('Session recordings fetch failed!');
  }

  console.log('\n🎉 ALL 100% LIVE POSTHOG DATA TESTS PASSED WITH ZERO MOCKUPS!');
}

runUserLookupVerification().catch((err) => {
  console.error('❌ Live PostHog test failed:', err);
  process.exit(1);
});
