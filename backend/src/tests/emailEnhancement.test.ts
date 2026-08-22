// src/tests/emailEnhancement.test.ts
// Unit and integration test for User-Agent Parsing, Geolocation, Mailgun Event Enrichment, and User Journey Analytics

import { parseUserAgent } from '../utils/userAgentParser.js';
import { lookupIpLocation } from '../utils/geoipHelper.js';
import { mailgunService } from '../services/mailgunService.js';
import { userJourneyService } from '../services/userJourneyService.js';

async function runEmailEnhancementVerification() {
  console.log('🧪 Starting Email Engagement Enhancement Verification...\n');

  // Test 1: User-Agent & Client Info Parser
  console.log('Test 1: Testing parseUserAgent (Devices & Clients)');

  // 1.1 Mobile iPhone Apple Mail
  const uaIphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
  const parsedIphone = parseUserAgent(uaIphone, { 'device-type': 'mobile', 'client-name': 'Apple Mail' });
  if (parsedIphone.deviceType !== 'mobile' || parsedIphone.emailClient !== 'Apple Mail' || parsedIphone.os !== 'iOS') {
    throw new Error(`parseUserAgent failed on iPhone! Got ${JSON.stringify(parsedIphone)}`);
  }
  console.log(`  ✓ iPhone: Device=${parsedIphone.deviceType}, Client=${parsedIphone.emailClient}, OS=${parsedIphone.os}`);

  // 1.2 Desktop Windows Outlook
  const uaWindows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Outlook/16.0';
  const parsedWin = parseUserAgent(uaWindows, { 'device-type': 'desktop', 'client-name': 'Outlook' });
  if (parsedWin.deviceType !== 'desktop' || parsedWin.emailClient !== 'Outlook' || parsedWin.os !== 'Windows') {
    throw new Error(`parseUserAgent failed on Windows Outlook! Got ${JSON.stringify(parsedWin)}`);
  }
  console.log(`  ✓ Windows: Device=${parsedWin.deviceType}, Client=${parsedWin.emailClient}, OS=${parsedWin.os}`);

  // 1.3 Gmail Web Proxy
  const uaGmail = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 GoogleImageProxy';
  const parsedGmail = parseUserAgent(uaGmail);
  if (parsedGmail.emailClient !== 'Gmail' || parsedGmail.deviceType !== 'desktop') {
    throw new Error(`parseUserAgent failed on Gmail Web Proxy! Got ${JSON.stringify(parsedGmail)}`);
  }
  console.log(`  ✓ Gmail Proxy: Device=${parsedGmail.deviceType}, Client=${parsedGmail.emailClient}`);

  // 1.4 iPad Tablet
  const uaIpad = 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15';
  const parsedIpad = parseUserAgent(uaIpad, { 'device-type': 'tablet' });
  if (parsedIpad.deviceType !== 'tablet') {
    throw new Error(`parseUserAgent failed on iPad Tablet! Got ${JSON.stringify(parsedIpad)}`);
  }
  console.log(`  ✓ iPad: Device=${parsedIpad.deviceType}`);

  // Test 2: Geolocation Lookup
  console.log('\nTest 2: Testing lookupIpLocation (IP Geolocation)');
  const localGeo = await lookupIpLocation('127.0.0.1');
  if (!localGeo.country || !localGeo.city) {
    throw new Error('lookupIpLocation failed to return fallback for local IP!');
  }
  console.log(`  ✓ Local IP Geolocation: ${localGeo.city}, ${localGeo.country} (isPrivate: ${localGeo.isPrivate})`);

  // Test 3: Link Label Extraction & Mailgun Ingestion
  console.log('\nTest 3: Testing Link Labeling & Webhook Ingestion');
  const label1 = mailgunService.getLinkLabel('https://talentbridge.cv/room/new');
  const label2 = mailgunService.getLinkLabel('https://talentbridge.cv/templates');
  const label3 = mailgunService.getLinkLabel('https://talentbridge.cv/guides/creator-starter');
  if (
    !label1.includes('CTA Button') ||
    !label2.includes('Templates') ||
    !label3.includes('Guide')
  ) {
    throw new Error('getLinkLabel failed to map links to intuitive labels!');
  }
  console.log(`  ✓ Link Labels: "${label1}", "${label2}", "${label3}"`);

  const mockWebhookPayload = {
    event: 'clicked',
    recipient: 'test.user@talentbridge.cv',
    id: `msg_test_${Date.now()}`,
    campaign_name: 'Welcome Email',
    campaigns: [{ id: 'welcome-email-001' }],
    url: 'https://talentbridge.cv/room/new',
    ip: '127.0.0.1',
    timestamp: Math.floor(Date.now() / 1000) - 300,
    'client-info': {
      'device-type': 'desktop',
      'client-name': 'Chrome Webmail',
      'client-os': 'macOS',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  };

  const processRes = await mailgunService.processMailgunWebhookEvent(mockWebhookPayload);
  if (!processRes.success) {
    throw new Error('processMailgunWebhookEvent failed!');
  }
  console.log('  ✓ processMailgunWebhookEvent successfully processed and enriched webhook payload');

  // Test 4: User Journey Attribution & Click Timing Analysis
  console.log('\nTest 4: Testing User Journey Tracking & Click Timing Analysis');
  const actionRes = await userJourneyService.recordPostClickAction(
    'test.user@talentbridge.cv',
    'signed_up',
    'usr_test_123',
    new Date()
  );
  console.log(`  ✓ recordPostClickAction: linked=${actionRes.linked}`);

  const timingAnalysis = await userJourneyService.getClickTimingAnalysis('welcome-email-001');
  if (!timingAnalysis.timing || timingAnalysis.timing.length === 0) {
    throw new Error('getClickTimingAnalysis returned empty timing buckets!');
  }
  console.log(`  ✓ getClickTimingAnalysis: ${timingAnalysis.timing.length} timing buckets generated`);
  console.log(`     - Peak Recommendation: "${timingAnalysis.peakRecommendation}"`);

  const deviceBreakdown = await userJourneyService.getDeviceBreakdown();
  console.log(`  ✓ Device Breakdown: Desktop=${deviceBreakdown.find((d) => d.device === 'Desktop')?.openPercentage}%, Mobile=${deviceBreakdown.find((d) => d.device === 'Mobile')?.openPercentage}%`);

  const clientBreakdown = await userJourneyService.getClientBreakdown();
  console.log(`  ✓ Client Breakdown: Gmail=${clientBreakdown.find((c) => c.client === 'Gmail')?.percentage}%, Outlook=${clientBreakdown.find((c) => c.client === 'Outlook')?.percentage}%`);

  const linkHeatmap = await userJourneyService.getLinkLocationHeatmap();
  console.log(`  ✓ Link Heatmap: ${linkHeatmap.length} links tracked (Top: "${linkHeatmap[0].linkLabel}" with ${linkHeatmap[0].clicks} clicks)`);

  const journeyMetrics = await userJourneyService.getUserJourneyMetrics();
  console.log(`  ✓ User Journey Metrics: Total Clicks=${journeyMetrics.totalClicks}, Signups=${journeyMetrics.signups}, Conversion Rate=${journeyMetrics.signupConversionRate}%, Avg Time to Signup=${journeyMetrics.avgTimeToSignupHours}h`);

  const detailedAnalytics = await userJourneyService.getDetailedEmailAnalytics('welcome-email-001');
  if (!detailedAnalytics.campaign || !detailedAnalytics.userJourney) {
    throw new Error('getDetailedEmailAnalytics returned incomplete payload!');
  }
  console.log(`  ✓ Complete Detailed Email Analytics payload assembled for "${detailedAnalytics.campaign.name}"`);

  console.log('\n🎉 ALL EMAIL ENGAGEMENT ENHANCEMENT TESTS PASSED SUCCESSFULLY!');
}

runEmailEnhancementVerification().catch((err) => {
  console.error('❌ Email enhancement verification failed:', err);
  process.exit(1);
});
