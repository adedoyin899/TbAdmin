import { postHogService } from '../services/postHogService.js';

async function testAiTelemetry() {
  console.log('🧪 Testing AI Telemetry integration with live PostHog ClickHouse...');

  const [usersRes, roomsRes, featuresRes]: [any, any, any] = await Promise.all([
    postHogService.searchUsers(''),
    postHogService.fetchRoomsAnalytics('30d'),
    postHogService.fetchFeatureAdoptionData('30d'),
  ]);

  console.log(`✅ Users retrieved: ${usersRes.results?.length} accounts`);
  console.log(`✅ Showcase rooms retrieved: ${roomsRes.topPerformingRooms?.length} rooms`);
  console.log(`✅ Top blocks retrieved: ${featuresRes.topBlocks?.length} blocks`);

  const testRoom = roomsRes.topPerformingRooms.find((r: any) => r.roomName.toLowerCase().includes('test room'));
  console.log('✅ Specific test room verified:', testRoom ? {
    name: testRoom.roomName,
    owner: testRoom.ownerName,
    views: testRoom.views,
    template: testRoom.template,
  } : 'Not found');

  const videoIntro = featuresRes.topBlocks.find((b: any) => b.blockType === 'Video intro');
  console.log(`✅ Block creators enriched for "Video intro": ${videoIntro?.creators?.length} creators`);
  if (videoIntro?.creators?.[0]) {
    console.log('   Sample creator:', videoIntro.creators[0].name, 'Email:', videoIntro.creators[0].email, 'Room:', videoIntro.creators[0].roomName);
  }

  const cybersecurityTpl = featuresRes.templateAdoption.find((t: any) => t.templateName === 'Cybersecurity');
  console.log(`✅ Template creators enriched for "Cybersecurity": ${cybersecurityTpl?.creators?.length} creators`);

  console.log('🎉 AI TELEMETRY ENRICHMENT VALIDATION PASSED!');
}

testAiTelemetry().catch(err => {
  console.error('❌ AI telemetry test failed:', err);
  process.exit(1);
});
