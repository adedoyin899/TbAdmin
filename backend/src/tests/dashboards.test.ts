import { postHogService } from '../services/postHogService.js';

async function runDashboardIntegrationVerification() {
  console.log('🧪 Starting 100% Live PostHog Dashboards Verification...\n');

  // Test 1: Rooms Intelligence Analytics
  console.log('Test 1: Live Showcase Rooms Analytics (PostHog)');
  const rooms: any = await postHogService.fetchRoomsAnalytics('30d');
  if (rooms && rooms.summary && rooms.topPerformingRooms && rooms.geoTraffic) {
    console.log(`✅ Total Views: ${rooms.summary.totalViews.count} | Unique Visitors: ${rooms.summary.uniqueViews.count}`);
    console.log(`   Avg Dwell Time: ${rooms.summary.avgTimeSpent.value} | Quality: ${rooms.summary.engagementQuality.percentage}%`);
    console.log(`   Top Performing Showcase Rooms Count: ${rooms.topPerformingRooms.length}`);
    if (rooms.topPerformingRooms[0]) {
      console.log(`   First Room: ${rooms.topPerformingRooms[0].roomName} (${rooms.topPerformingRooms[0].views} views) - ${rooms.topPerformingRooms[0].ownerName}`);
    }
    console.log(`   Geo Breakdown: ${rooms.geoTraffic.map((g: any) => `${g.country}: ${g.views}`).join(', ')}`);
  } else {
    throw new Error('Live rooms analytics fetch failed!');
  }

  // Test 2: Funnel Conversion Analytics
  console.log('\nTest 2: Live Funnel Conversion Telemetry (PostHog)');
  const funnel: any = await postHogService.fetchFunnelData('30d', 'all');
  if (funnel && funnel.stages && funnel.stages.length > 0) {
    console.log(`✅ Funnel Total Inbound: ${funnel.totalUsers} | Overall Conversion: ${funnel.overallConversion}%`);
    for (const s of funnel.stages) {
      console.log(`   - ${s.stage}: ${s.count} users (${s.percentage}%) [Dropoff: ${s.dropOff}%]`);
    }
  } else {
    throw new Error('Live funnel conversion fetch failed!');
  }

  // Test 3: Retention & Cohort Analytics
  console.log('\nTest 3: Live Retention Metrics (PostHog)');
  const retention: any = await postHogService.fetchRetentionData('all');
  if (retention && retention.retention7d && retention.retention30d) {
    console.log(`✅ 7-Day Retention: ${retention.retention7d.percentage}% | 30-Day Retention: ${retention.retention30d.percentage}%`);
    console.log(`   Cohort Trend: ${retention.trend.map((t: any) => `${t.period}: ${t['7d']}%`).join(', ')}`);
  } else {
    throw new Error('Live retention metrics fetch failed!');
  }

  // Test 4: Feature & Block Adoption Analytics
  console.log('\nTest 4: Live Feature & Block Adoption Analytics (PostHog)');
  const features: any = await postHogService.fetchFeatureAdoptionData('30d');
  if (features && features.topBlocks && features.topBlocks.length > 0) {
    console.log(`✅ Top Blocks Tracked: ${features.topBlocks.length}`);
    for (const b of features.topBlocks) {
      console.log(`   - ${b.blockType}: ${b.count} interactions (${b.percentage}%)`);
    }
  } else {
    throw new Error('Live feature adoption fetch failed!');
  }

  console.log('\n🎉 ALL LIVE POSTHOG DASHBOARDS VERIFIED SUCCESSFULLY WITH ZERO MOCKUPS!');
}

runDashboardIntegrationVerification().catch((err) => {
  console.error('❌ Dashboard verification failed:', err);
  process.exit(1);
});
