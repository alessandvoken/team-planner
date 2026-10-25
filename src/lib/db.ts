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
