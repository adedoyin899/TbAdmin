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
      const sql1Path = path.join(__dirname, 'migrations', '001_create_analytics_schema.sql');
      const sql2Path = path.join(__dirname, 'migrations', '002_create_indexes.sql');

      const sql1 = fs.readFileSync(sql1Path, 'utf-8');
      const sql2 = fs.readFileSync(sql2Path, 'utf-8');

      console.log('Executing 001_create_analytics_schema.sql...');
      await client.query(sql1);

      console.log('Executing 002_create_indexes.sql...');
      await client.query(sql2);

      console.log('✅ Migrations applied successfully!');
    } else {
      console.log('Rolling back tables and indexes...');
      await client.query(`
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
