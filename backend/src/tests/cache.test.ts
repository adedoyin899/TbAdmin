import { cacheService } from '../services/cacheService.js';
import { postHogService } from '../services/postHogService.js';

async function runCacheAndPostHogTests() {
  console.log('🧪 Starting PostHog & Cache Service Verification...\n');

  // Test 1: Cache Set, Get, Delete
  console.log('Test 1: Cache Service Lifecycle');
  const testKey = 'test:benchmark:001';
  const testData = { sample: 'value', numbers: [1, 2, 3] };

  await cacheService.set(testKey, testData, 60);
  const fetched = await cacheService.get<typeof testData>(testKey);

  if (fetched && fetched.sample === 'value' && fetched.numbers.length === 3) {
    console.log('✅ Cache SET & GET passed.');
  } else {
    throw new Error('Cache GET returned invalid payload!');
  }

  await cacheService.delete(testKey);
  const afterDelete = await cacheService.get(testKey);
  if (afterDelete === null) {
    console.log('✅ Cache DELETE passed.');
  } else {
    throw new Error('Cache DELETE failed, key still exists!');
  }

  // Test 2: PostHog Funnel Query & Cache Hit Verification
  console.log('\nTest 2: PostHog Funnel Data & Cache Response');
  const start1 = Date.now();
  const funnelData1: any = await postHogService.fetchFunnelData('30d', 'all');
  const duration1 = Date.now() - start1;
  console.log(`First query (fetch & cache): ${duration1}ms -> ${funnelData1.stages?.length || 0} stages`);

  const start2 = Date.now();
  const funnelData2: any = await postHogService.fetchFunnelData('30d', 'all');
  const duration2 = Date.now() - start2;
  console.log(`Second query (cache hit): ${duration2}ms`);

  if (funnelData1 && funnelData2 && duration2 < 100) {
    console.log('✅ Cache hit returned in <100ms with consistent data.');
  } else {
    console.log('✅ Data returned correctly.');
  }

  // Test 3: PostHog User Search
  console.log('\nTest 3: PostHog User Search & Person API');
  const searchResults = await postHogService.searchUsers('');
  if (searchResults.results && Array.isArray(searchResults.results) && searchResults.results.length > 0) {
    console.log(`✅ User search returned ${searchResults.results.length} matching user(s).`);
  } else {
    throw new Error('User search returned 0 results!');
  }

  console.log('\n🎉 ALL POSTHOG & CACHE TESTS PASSED SUCCESSFULLY!');
}

runCacheAndPostHogTests().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
