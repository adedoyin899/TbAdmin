import { notificationService } from '../services/notificationService.js';

async function runNotificationsTest() {
  console.log('🧪 Starting Event-Driven Notification System Verification...\n');

  // Test 1: Fetch dynamic notifications from live telemetry
  console.log('Test 1: Fetch live event-driven notifications');
  const notifs = await notificationService.getNotifications({
    funnelDropoffThreshold: 40,
    enableRoomLeadAlerts: true,
    enableRetentionMilestones: true,
    enableSystemHealthAlerts: true,
  });

  console.log(`✅ Retrieved ${notifs.length} dynamic event notifications.`);
  for (const n of notifs) {
    console.log(`   [${n.severity.toUpperCase()}] ${n.title} (${n.category})`);
    console.log(`     Message: ${n.message}`);
    console.log(`     Trigger: ${n.triggerRule} | Link: ${n.link || 'none'}`);
  }

  // Verify no fake Spotify dummy items or redis cache fallback noise
  const hasSpotifyFake = notifs.some(n => n.message.toLowerCase().includes('spotify'));
  const hasCachePlumbing = notifs.some(n => n.message.toLowerCase().includes('in-memory cache fallback operational'));

  if (hasSpotifyFake) {
    throw new Error('Found legacy fake Spotify notification!');
  }
  if (hasCachePlumbing) {
    throw new Error('Found unwanted internal cache fallback debug noise!');
  }
  console.log('✅ Verified zero fake dummy data and zero internal cache plumbing noise.');

  // Test 2: Mark as read
  if (notifs.length > 0) {
    const target = notifs[0];
    console.log(`\nTest 2: Mark notification "${target.id}" as read`);
    notificationService.markAsRead(target.id);
    const updated = await notificationService.getNotifications();
    const checked = updated.find(n => n.id === target.id);
    if (!checked?.isRead) {
      throw new Error(`Notification ${target.id} was not marked as read!`);
    }
    console.log(`✅ Notification ${target.id} isRead is now true.`);
  }

  // Test 3: Dismissal
  if (notifs.length > 0) {
    const target = notifs[0];
    console.log(`\nTest 3: Dismiss notification "${target.id}"`);
    notificationService.dismiss(target.id);
    const updated = await notificationService.getNotifications();
    const exists = updated.some(n => n.id === target.id);
    if (exists) {
      throw new Error(`Dismissed notification ${target.id} still present!`);
    }
    console.log(`✅ Notification ${target.id} was successfully dismissed.`);
  }

  console.log('\n🎉 ALL EVENT-DRIVEN NOTIFICATION TESTS PASSED SUCCESSFULLY!');
}

runNotificationsTest().catch((err) => {
  console.error('❌ Notification test failed:', err);
  process.exit(1);
});
