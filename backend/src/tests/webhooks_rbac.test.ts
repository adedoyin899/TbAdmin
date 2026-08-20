import crypto from 'crypto';
import { hasPermission } from '../config/rbacConfig.js';
import type { UserRole } from '../types/database.js';

function safeVerifySignature(
  timestamp: string | number,
  token: string,
  signature: string,
  key: string
): boolean {
  try {
    const value = `${timestamp}${token}`;
    const hmac = crypto
      .createHmac('sha256', key)
      .update(value)
      .digest('hex');

    const hmacBuf = Buffer.from(hmac);
    const sigBuf = Buffer.from(signature);

    if (hmacBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(hmacBuf, sigBuf);
  } catch {
    return false;
  }
}

async function runWebhooksAndRBACTests() {
  console.log('🧪 Starting Mailgun Webhooks & RBAC Verification...\n');

  // Test 1: RBAC Permission Matrix Checks
  console.log('Test 1: Role-Based Access Permissions');
  const rolesToTest: UserRole[] = ['admin', 'product', 'marketing', 'operations', 'intern'];

  const adminCanManage = hasPermission('admin', 'manage_team');
  const internCanManage = hasPermission('intern', 'manage_team');
  const marketingCanViewEmail = hasPermission('marketing', 'view_email');
  const internCanViewEmail = hasPermission('intern', 'view_email');

  if (adminCanManage && !internCanManage && marketingCanViewEmail && !internCanViewEmail) {
    console.log('✅ RBAC permissions matrix correctly differentiated roles:');
    console.log('   - Admin has full access (manage_team = true)');
    console.log('   - Marketing can view email campaigns (view_email = true)');
    console.log('   - Intern cannot view email or manage team');
  } else {
    throw new Error('RBAC permissions check failed!');
  }

  // Test 2: Mailgun HMAC Signature Verification Logic
  console.log('\nTest 2: Mailgun Cryptographic HMAC Signature Validation');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const token = crypto.randomBytes(16).toString('hex');
  const signingKey = 'test_secret_key_12345';

  const validSignature = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp + token)
    .digest('hex');

  const isValidMatch = safeVerifySignature(timestamp, token, validSignature, signingKey);
  const isForgedMatch = safeVerifySignature(timestamp, token, '0'.repeat(64), signingKey);
  const isWrongKeyMatch = safeVerifySignature(timestamp, token, validSignature, 'wrong_key');

  if (isValidMatch && !isForgedMatch && !isWrongKeyMatch) {
    console.log('✅ HMAC-SHA256 signature verification validated valid tokens and rejected forged tokens.');
  } else {
    throw new Error('HMAC signature verification failed!');
  }

  console.log('\n🎉 ALL WEBHOOK & RBAC TESTS PASSED SUCCESSFULLY!');
}

runWebhooksAndRBACTests().catch((err) => {
  console.error('❌ Webhook/RBAC tests failed:', err);
  process.exit(1);
});
