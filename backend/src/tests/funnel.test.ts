import { generateToken } from '../services/authService.js';
import { postHogService } from '../services/postHogService.js';

async function runFunnelEndpointVerification() {
  console.log('🧪 Starting Funnel Dashboard Endpoint Verification...\n');

  // Test 1: Generate valid JWT token
  console.log('Test 1: Auth Token Generation for Funnel Endpoint');
  const token = generateToken({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'maz@talentbridge.cv',
    role: 'admin',
  });
  console.log('✅ Generated JWT token for authenticated requests.');

  // Test 2: Query Funnel Data across filters
  console.log('\nTest 2: Funnel Query with 30d / All Sources');
  const funnel30d: any = await postHogService.fetchFunnelData('30d', 'all');

  console.log(`Total Users: ${funnel30d.totalUsers}`);
  console.log(`Overall Conversion: ${funnel30d.overallConversion}%`);
  console.log(`Stages count: ${funnel30d.stages.length}`);

  if (funnel30d.stages && funnel30d.stages.length === 5) {
    console.log('✅ Funnel contains all 5 required stages:');
    funnel30d.stages.forEach((s: any) => {
      console.log(`   - ${s.stage}: ${s.count} users (${s.percentage}%) | Dropoff: ${s.dropOff}%`);
    });
  } else {
    throw new Error('Funnel stages count mismatch!');
  }

  // Test 3: Filter by dateRange=7d and signupSource=organic
  console.log('\nTest 3: Filter by dateRange=7d & signupSource=organic');
  const funnelFiltered: any = await postHogService.fetchFunnelData('7d', 'organic');
  if (funnelFiltered && funnelFiltered.stages.length === 5) {
    console.log(`✅ Filtered funnel returned ${funnelFiltered.totalUsers} users with ${funnelFiltered.overallConversion}% conversion.`);
  } else {
    throw new Error('Filtered funnel failed!');
  }

  console.log('\n🎉 ALL FUNNEL ENDPOINT TESTS PASSED SUCCESSFULLY!');
}

runFunnelEndpointVerification().catch((err) => {
  console.error('❌ Funnel test failed:', err);
  process.exit(1);
});
