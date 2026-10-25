import assert from 'node:assert/strict';

import { db } from '../src/lib/db.ts';

try {
  const client = await db.connect();
  try {
    const { rows } = await client.query('select $1::integer as result', [1]);
    assert.equal(rows[0].result, 1);
    assert.equal(client.connection.stream.encrypted, true);
    assert.equal(client.connection.stream.authorized, true);
    console.log(
      'Postgres connection OK: parameterized query and verified TLS.',
    );
  } finally {
    client.release();
  }
} catch (error) {
  console.error('Postgres connection check failed:', error.code ?? error.name);
  process.exitCode = 1;
} finally {
  await db.end();
}
