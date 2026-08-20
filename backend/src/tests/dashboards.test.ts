import { postHogService } from '../services/postHogService.js';
import { emailService } from '../services/emailService.js';

async function runDashboardsVerification() {
  console.log('🧪 Starting Dashboard Endpoints Verification...\n');

  // Test 1: Feature Adoption
  console.log('Test 1: Feature Adoption Metrics (30d)');
  const features: any = await postHogService.fetchFeatureAdoptionData('30d');
  if (features && features.topBlocks && features.themeDistribution) {
    console.log(`✅ Features returned ${features.topBlocks.length} block types.`);
    console.log(`   Top block: ${features.topBlocks[0].blockType} (${features.topBlocks[0].percentage}%)`);
    console.log(`   Themes: Dark ${features.themeDistribution.dark}% / Light ${features.themeDistribution.light}%`);
  } else {
    throw new Error('Features data mismatch!');
  }

  // Test 2: Retention Metrics
  console.log('\nTest 2: Retention Metrics (all sources)');
  const retention: any = await postHogService.fetchRetentionData('all');
  if (retention && retention.retention7d && retention.retention30d) {
    console.log(`✅ Retention: 7d=${retention.retention7d.percentage}% (+${retention.retention7d.change}%), 30d=${retention.retention30d.percentage}%`);
    console.log(`   Trend entries: ${retention.trend.length} weeks`);
  } else {
    throw new Error('Retention data mismatch!');
  }

  // Test 3: Email Campaign Metrics
  console.log('\nTest 3: Email Campaign Metrics (30d)');
  const emailData: any = await emailService.fetchEmailDashboardData('30d');
  if (emailData && emailData.campaigns && emailData.campaigns.length > 0) {
    console.log(`✅ Email returned ${emailData.campaigns.length} campaigns.`);
    console.log(`   First campaign: "${emailData.campaigns[0].campaignName}" (${emailData.campaigns[0].openPercentage}% open, ${emailData.campaigns[0].clickPercentage}% click)`);
    console.log(`   Top performers: ${emailData.topPerformers.length}`);
  } else {
    throw new Error('Email data mismatch!');
  }

  console.log('\n🎉 ALL DASHBOARD ENDPOINTS VERIFIED SUCCESSFULLY!');
}

runDashboardsVerification().catch((err) => {
  console.error('❌ Dashboard verification failed:', err);
  process.exit(1);
});
