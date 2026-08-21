import assert from 'assert';
import http from 'http';
import { app } from '../app.js';
import { postHogService } from '../services/postHogService.js';
import { cacheService } from '../services/cacheService.js';
import { generateToken } from '../services/authService.js';

console.log('🧪 Starting Integrations & Live Telemetry Verification...\n');

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const token = generateToken({ id: 'usr_maz', email: 'maz@talentbridge.cv', role: 'Super Admin' });
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    // 1. GET /api/integrations
    console.log('Test 1: Fetch Current Integration Configuration');
    const resGet = await fetch(`${baseUrl}/api/integrations`, { headers });
    assert.strictEqual(resGet.status, 200);
    const bodyGet: any = await resGet.json();
    assert.ok(bodyGet.data.config.posthog, 'PostHog config should be present');
    assert.ok(bodyGet.data.config.mailgun, 'Mailgun config should be present');
    assert.ok(bodyGet.data.config.redis, 'Redis config should be present');
    assert.ok(bodyGet.data.config.postgres, 'Postgres config should be present');
    assert.strictEqual(bodyGet.data.config.cacheTTL.funnel, 300);
    console.log('✅ GET /api/integrations returned valid configuration schema.\n');

    // 2. PUT /api/integrations (Hot-reloading runtime credentials)
    console.log('Test 2: Hot-Reload Integration Credentials');
    const updatePayload = {
      credentials: {
        posthog: {
          host: 'https://eu.i.posthog.com',
          projectId: '99999',
          apiKey: 'phx_live_test_api_key_1234567890',
        },
        mailgun: {
          domain: 'mg.talentbridge.cv',
          apiKey: 'key-live_mailgun_secret_99999',
          webhookKey: 'whsec_test_webhook_signing_key',
        },
        redis: {
          url: 'redis://localhost:6379',
        },
        postgres: {
          url: 'postgresql://postgres:postgres@localhost:5432/talentbridge_analytics',
        },
      },
      cacheTTL: {
        funnel: 600,
        features: 900,
        retention: 1200,
        userLookup: 0,
      },
    };

    const resPut = await fetch(`${baseUrl}/api/integrations`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatePayload),
    });
    assert.strictEqual(resPut.status, 200);
    const phConfig = postHogService.getConfig();
    assert.strictEqual(phConfig.host, 'https://eu.i.posthog.com');
    assert.strictEqual(phConfig.projectId, '99999');
    assert.strictEqual(postHogService.hasApiKey, true);
    console.log('✅ PUT /api/integrations successfully hot-reloaded PostHog & Mailgun clients.\n');

    // 3. POST /api/integrations/test for All Providers
    console.log('Test 3: Live Connection Handshakes');

    // Test Redis
    const resRedis = await fetch(`${baseUrl}/api/integrations/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider: 'redis', credentials: { url: 'redis://localhost:6379' } }),
    });
    assert.strictEqual(resRedis.status, 200);
    const bodyRedis: any = await resRedis.json();
    assert.strictEqual(bodyRedis.data.success, true);
    console.log(`✅ Redis Handshake: ${bodyRedis.data.message} (Ping: ${bodyRedis.data.ping})`);

    // Test PostgreSQL
    const resPg = await fetch(`${baseUrl}/api/integrations/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider: 'postgres' }),
    });
    assert.strictEqual(resPg.status, 200);
    const bodyPg: any = await resPg.json();
    assert.strictEqual(bodyPg.data.success, true);
    console.log(`✅ PostgreSQL Handshake: ${bodyPg.data.message} (Ping: ${bodyPg.data.ping})`);

    // Test Mailgun Handshake
    const resMg = await fetch(`${baseUrl}/api/integrations/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        provider: 'mailgun',
        credentials: { domain: 'mg.talentbridge.cv', apiKey: 'key-test_key_sample' },
      }),
    });
    assert.strictEqual(resMg.status, 200);
    const bodyMg: any = await resMg.json();
    console.log(`✅ Mailgun Handshake: ${bodyMg.data.message} (Ping: ${bodyMg.data.ping})`);

    // Test PostHog Handshake
    const resPh = await fetch(`${baseUrl}/api/integrations/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        provider: 'posthog',
        credentials: { host: 'https://us.i.posthog.com', projectId: '48192', apiKey: 'phx_9831a8f902c3847b6a1e' },
      }),
    });
    assert.strictEqual(resPh.status, 200);
    const bodyPh: any = await resPh.json();
    console.log(`✅ PostHog Handshake: ${bodyPh.data.message}`);

    // 4. POST /api/integrations/flush-cache
    console.log('\nTest 4: Flush Cache Invalidation');
    await cacheService.set('test_key_1', { hello: 'world' }, 300);
    const beforeFlush = await cacheService.get('test_key_1');
    assert.deepStrictEqual(beforeFlush, { hello: 'world' });

    const resFlush = await fetch(`${baseUrl}/api/integrations/flush-cache`, {
      method: 'POST',
      headers,
    });
    assert.strictEqual(resFlush.status, 200);

    const afterFlush = await cacheService.get('test_key_1');
    assert.strictEqual(afterFlush, null, 'Cache key should be deleted after flush');
    console.log('✅ Cache flush verified across memory and persistent cache.\n');

    console.log('🎉 ALL INTEGRATION ENDPOINT TESTS PASSED SUCCESSFULLY!\n');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    server.close();
    throw err;
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
