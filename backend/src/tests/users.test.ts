import { postHogService } from '../services/postHogService.js';

async function runUserLookupVerification() {
  console.log('🧪 Starting User Lookup Endpoints Verification (Uncached / Real-time)...\n');

  // Test 1: User Search by Name
  console.log('Test 1: User Search by Name ("alice")');
  const searchName = await postHogService.searchUsers('alice');
  if (searchName && searchName.results && searchName.results.length > 0) {
    console.log(`✅ Found ${searchName.results.length} user(s) matching "alice":`);
    console.log(`   - ${searchName.results[0].firstName} ${searchName.results[0].lastName} (${searchName.results[0].email}) - ${searchName.results[0].country}`);
  } else {
    throw new Error('User search by name failed!');
  }

  // Test 2: User Search by Email
  console.log('\nTest 2: User Search by Email ("kwame.asante@example.com")');
  const searchEmail = await postHogService.searchUsers('kwame.asante@example.com');
  if (searchEmail && searchEmail.results && searchEmail.results.length > 0) {
    console.log(`✅ Found user: ${searchEmail.results[0].firstName} ${searchEmail.results[0].lastName} (${searchEmail.results[0].userId})`);
  } else {
    throw new Error('User search by email failed!');
  }

  // Test 3: Fetch Granular User Profile + Timeline + Session Replay URL
  console.log('\nTest 3: Fetch Granular Profile for "usr_alice_01"');
  const profile = await postHogService.fetchUserProfile('usr_alice_01');

  if (profile && profile.user && profile.events && profile.postHogSessionReplayUrl) {
    console.log(`✅ User Profile: ${profile.user.firstName} ${profile.user.lastName} (${profile.user.email})`);
    console.log(`   Events logged: ${profile.events.length} events`);
    console.log(`   First event: ${profile.events[0].eventName} at ${profile.events[0].timestamp}`);
    console.log(`   Email engagement: ${profile.emailEngagement?.length || 0} campaigns`);
    console.log(`   Session replay URL: ${profile.postHogSessionReplayUrl}`);
  } else {
    throw new Error('User profile fetch failed!');
  }

  // Test 4: Fetch Live User Overview (Lifetime vs Horizon)
  console.log('\nTest 4: Fetch Live User Overview (Lifetime & 30d)');
  const overview = await postHogService.fetchUserOverview('30d');
  if (overview && overview.lifetime && overview.recent && overview.acquisitionChannels) {
    console.log(`✅ Overview Lifetime Users: ${overview.lifetime.totalRegisteredUsers}`);
    console.log(`   Overview Recent (30d) Signups: ${overview.recent.newSignups}`);
    console.log(`   Top Acquisition Channel: ${overview.acquisitionChannels[0]?.name} (${overview.acquisitionChannels[0]?.percentage}%)`);
    console.log(`   Geographic demographics count: ${overview.geographicDemographics.length} countries`);
  } else {
    throw new Error('User overview aggregation failed!');
  }

  // Test 5: Fetch Live Session Recordings
  console.log('\nTest 5: Fetch Live Session Recordings from PostHog');
  const recordings = await postHogService.fetchSessionRecordings(10);
  if (recordings && recordings.results && recordings.results.length > 0) {
    console.log(`✅ Retrieved ${recordings.results.length} session recordings from PostHog`);
    console.log(`   First recording ID: ${recordings.results[0].id}`);
    console.log(`   Duration: ${recordings.results[0].duration}s | Visited URL: ${recordings.results[0].startUrl}`);
  } else {
    throw new Error('Session recordings fetch failed!');
  }

  console.log('\n🎉 ALL USER LOOKUP & POSTHOG SUITE TESTS PASSED SUCCESSFULLY!');
}

runUserLookupVerification().catch((err) => {
  console.error('❌ User lookup test failed:', err);
  process.exit(1);
});
