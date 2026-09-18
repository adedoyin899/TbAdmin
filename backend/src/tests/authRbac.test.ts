import { adminAccountService } from '../services/adminAccountService.js';

async function runAuthRbacTest() {
  console.log('🧪 Starting Admin RBAC & Credential Management Test...\n');

  // Test 1: Authenticate Super Admin (Maz)
  console.log('Test 1: Super Admin Authentication (maz@talentbridge.cv)');
  const mazAuth = await adminAccountService.authenticate('maz@talentbridge.cv', 'temp_password_123');
  if (!mazAuth.success || mazAuth.account?.role !== 'Super Admin') {
    throw new Error('Failed to authenticate Super Admin Maz: ' + JSON.stringify(mazAuth));
  }
  console.log('✅ Super Admin authenticated:', mazAuth.account.name, '| Role:', mazAuth.account.role);

  // Test 2: Authenticate Marketing user (marketing@tb.com)
  console.log('\nTest 2: Marketing Lead Authentication (marketing@tb.com)');
  const mktAuth = await adminAccountService.authenticate('marketing@tb.com', 'marketing123');
  if (!mktAuth.success || mktAuth.account?.role !== 'Marketing') {
    throw new Error('Failed to authenticate Marketing lead: ' + JSON.stringify(mktAuth));
  }
  console.log('✅ Marketing lead authenticated:', mktAuth.account.name, '| Role:', mktAuth.account.role);

  // Test 3: Master Admin Password Visibility Check
  console.log('\nTest 3: Password Visibility by Role');
  const superAdminView = adminAccountService.getAccounts('Super Admin');
  const viewerView = adminAccountService.getAccounts('Viewer');
  const mktInSuper = superAdminView.find((a) => a.email === 'marketing@tb.com');
  const mktInViewer = viewerView.find((a) => a.email === 'marketing@tb.com');
  if (mktInSuper?.password !== 'marketing123') {
    throw new Error('Super Admin was unable to view plain password: ' + mktInSuper?.password);
  }
  if (mktInViewer?.password !== '••••••••') {
    throw new Error('Viewer was able to view plain password, should be masked: ' + mktInViewer?.password);
  }
  console.log('✅ Super Admin can view plaintext credentials, other roles receive masked passwords.');

  // Test 4: Master Admin Changes Password
  console.log('\nTest 4: Master Admin Changes Password for marketing@tb.com');
  await adminAccountService.changePassword('marketing@tb.com', 'newpass2026');
  console.log('Password updated to: newpass2026');

  // Attempt with old password -> MUST fail
  const oldAttempt = await adminAccountService.authenticate('marketing@tb.com', 'marketing123');
  if (oldAttempt.success) {
    throw new Error('Security failure: Old password was accepted after change!');
  }
  console.log('✅ Attempt with old password "marketing123" was correctly rejected.');

  // Attempt with new password -> MUST succeed
  const newAttempt = await adminAccountService.authenticate('marketing@tb.com', 'newpass2026');
  if (!newAttempt.success) {
    throw new Error('Failed to authenticate with newly updated password!');
  }
  console.log('✅ Attempt with new password "newpass2026" succeeded.');

  // Test 5: Account Suspension
  console.log('\nTest 5: Account Suspension');
  adminAccountService.toggleStatus('marketing@tb.com');
  const suspendedAttempt = await adminAccountService.authenticate('marketing@tb.com', 'newpass2026');
  if (suspendedAttempt.success || !suspendedAttempt.message?.includes('suspended')) {
    throw new Error('Suspended user was allowed to authenticate!');
  }
  console.log('✅ Suspended user was correctly blocked:', suspendedAttempt.message);

  // Restore active status and default password
  adminAccountService.toggleStatus('marketing@tb.com');
  await adminAccountService.changePassword('marketing@tb.com', 'marketing123');
  console.log('✅ Account restored to Active and reset to default password "marketing123".');

  console.log('\n🎉 ALL ADMIN RBAC & CREDENTIAL MANAGEMENT TESTS PASSED SUCCESSFULLY!');
}

runAuthRbacTest().catch((err) => {
  console.error('❌ RBAC test failed:', err);
  process.exit(1);
});
