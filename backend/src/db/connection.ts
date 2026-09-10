import pg from 'pg';
import { ENV } from '../config/env.js';

const { Pool } = pg;

// We set TLS behavior explicitly via `ssl` below, so a `sslmode=...` query param on the
// connection string (as Neon's DATABASE_URL includes) is redundant — pg-connection-string
// still parses it and logs a SECURITY WARNING about prefer/require/verify-ca aliasing on
// every cold start. Stripping it avoids the noise without changing actual TLS behavior.
function withoutSslModeParam(connectionString: string): string {
  const queryIndex = connectionString.indexOf('?');
  if (queryIndex === -1) return connectionString;
  const base = connectionString.slice(0, queryIndex);
  const params = new URLSearchParams(connectionString.slice(queryIndex + 1));
  params.delete('sslmode');
  const rest = params.toString();
  return rest ? `${base}?${rest}` : base;
}

export const pool = new Pool({
  connectionString: withoutSslModeParam(ENV.DATABASE_URL),
  max: ENV.NODE_ENV === 'production' ? 5 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
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

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

