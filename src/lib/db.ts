import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

export const db = new pg.Pool({
  connectionString,
  ssl: {
    ca: readFileSync(join(process.cwd(), 'src/lib/supabase/prod-ca-2021.crt')),
  },
  max: 1,
  connectionTimeoutMillis: 10_000,
});

db.on('error', (error) => {
  console.error('Unexpected error on idle Postgres connection:', error.message);
});

export async function withBoardTransaction<T>(
  operation: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE team_planner_app');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '10s'");
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
