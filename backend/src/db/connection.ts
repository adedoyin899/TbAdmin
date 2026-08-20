import pg from 'pg';
import { ENV } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (ENV.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
  }
  return res;
}
