import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations(direction: 'up' | 'down' = 'up') {
  const client = await pool.connect();
  try {
    console.log(`Starting database migration: ${direction}...`);
    await client.query('BEGIN');

    if (direction === 'up') {
      const migrationsDir = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        console.log(`Executing migration ${file}...`);
        await client.query(sql);
      }

      console.log('✅ All migrations applied successfully!');
    } else {
      console.log('Rolling back tables and indexes in dependency order...');
      await client.query(`
        DROP TABLE IF EXISTS sync_logs CASCADE;
        DROP TABLE IF EXISTS campaign_performance CASCADE;
        DROP TABLE IF EXISTS social_media_engagement CASCADE;
        DROP TABLE IF EXISTS social_media_posts CASCADE;
        DROP TABLE IF EXISTS email_engagement_detailed CASCADE;
        DROP TABLE IF EXISTS campaigns CASCADE;
        DROP TABLE IF EXISTS audit_log CASCADE;
        DROP TABLE IF EXISTS dashboard_cache CASCADE;
        DROP TABLE IF EXISTS mailgun_events CASCADE;
        DROP TABLE IF EXISTS admin_users CASCADE;
      `);

      console.log('✅ Rollback completed successfully!');
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const direction = (process.argv[2] === 'down' ? 'down' : 'up') as 'up' | 'down';
runMigrations(direction);

