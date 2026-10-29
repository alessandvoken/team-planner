import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { mock } from 'node:test';

import { moveWorkItemInDB } from '../src/features/board/mutations.ts';
import { db } from '../src/lib/db.ts';

const client = await db.connect();
const seed = (
  await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8')
).replaceAll('public.', 'pg_temp.');

try {
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SET LOCAL statement_timeout = '10s'");
  await client.query('CREATE TEMP TABLE move_check_bootstrap (id integer)');
  const migrations = new URL('../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(migrations))
    .filter((file) => file.endsWith('.sql'))
    .sort()) {
    const sql = await readFile(new URL(file, migrations), 'utf8');
    await client.query(sql.replaceAll('public.', 'pg_temp.'));
  }
  await client.query(seed);

  // Exercise the real SQL against temporary tables. Keep every move inside the
  // outer rollback, checking deferred constraints at each simulated COMMIT.
  mock.method(db, 'connect', async () => ({
    async query(sql, values) {
      if (sql === 'BEGIN') return client.query('SAVEPOINT checked_move');
      if (sql === 'COMMIT') {
        await client.query(
          'SET CONSTRAINTS work_items_state_position_key IMMEDIATE',
        );
        return client.query('RELEASE SAVEPOINT checked_move');
      }
      if (sql === 'ROLLBACK') {
        await client.query('ROLLBACK TO SAVEPOINT checked_move');
        return client.query('RELEASE SAVEPOINT checked_move');
      }
      return client.query(
        sql
          .replaceAll('public.', 'pg_temp.')
          .replace('team-planner:work-item-order', 'team-planner:move-check'),
        values,
      );
    },
    release() {},
  }));

  async function snapshot() {
    const items = await client.query(
      'SELECT id, state, position, version, updated_at FROM pg_temp.work_items ORDER BY id',
    );
    const comments = await client.query(
      'SELECT work_item_id, author_id, body FROM pg_temp.comments ORDER BY id',
    );
    return { items: items.rows, comments: comments.rows };
  }

  async function move(id, columnState, extra = {}) {
    const {
      rows: [item],
    } = await client.query(
      'SELECT version FROM pg_temp.work_items WHERE id = $1',
      [id],
    );
    return moveWorkItemInDB({
      id,
      columnState,
      expectedVersion: item?.version ?? 1,
      ...extra,
    });
  }

  async function order(state) {
    const { rows } = await client.query(
      'SELECT id, position FROM pg_temp.work_items WHERE state = $1 ORDER BY position',
      [state],
    );
    assert.deepEqual(
      rows.map((item) => item.position),
      rows.map((_, index) => index),
    );
    return rows.map((item) => item.id);
  }

  async function reset() {
    await client.query(
      'TRUNCATE pg_temp.comments, pg_temp.work_items, pg_temp.teammates RESTART IDENTITY',
    );
    await client.query(seed);
  }

  const initial = await snapshot();
  for (const invalid of [
    { id: '0' },
    { id: '9223372036854775808' },
    { id: '1; DROP TABLE work_items' },
    { columnState: 'invalid' },
    { expectedVersion: 0 },
    { expectedVersion: 1.5 },
    { insertion: { targetId: '1', position: 'before' } },
    { insertion: { targetId: '2', position: 'on' } },
  ]) {
    await assert.rejects(
      moveWorkItemInDB({
        id: '1',
        columnState: 'active',
        expectedVersion: 1,
        ...invalid,
      }),
    );
  }
  await assert.rejects(move('999', 'active'), /not found/);
  await assert.rejects(move('1', 'active', { expectedVersion: 2 }), /changed/);
  await assert.rejects(
    move('1', 'active', {
      insertion: { targetId: '999', position: 'before' },
    }),
    /Insertion target/,
  );
  await assert.rejects(
    move('1', 'active', {
      insertion: { targetId: '3', position: 'before' },
    }),
    /Insertion target/,
  );
  assert.deepEqual(await snapshot(), initial);

  const unchanged = await move('1', 'new');
  assert.equal(unchanged.changed, false);
  assert.deepEqual(await snapshot(), initial);

  const moved = await move('1', 'active');
  assert.deepEqual(moved, {
    item: { id: '1', state: 'active', position: 2, version: 2 },
    changed: true,
  });
  assert.deepEqual(await order('new'), ['5']);
  assert.deepEqual(await order('active'), ['2', '4', '1']);
  assert.equal(
    (await snapshot()).items.find((item) => item.id === '5').version,
    2,
  );
  await assert.rejects(move('1', 'closed', { expectedVersion: 1 }), /changed/);

  // Both reorder directions and both insertion gestures; adjacent moves are no-ops.
  for (const [id, targetId, position, expected] of [
    ['1', '2', 'before', ['1', '2', '4']],
    ['1', '2', 'after', ['2', '1', '4']],
    ['2', '1', 'before', ['4', '2', '1']],
    ['2', '1', 'after', ['4', '1', '2']],
  ]) {
    await reset();
    await move('1', 'active');
    const before = await snapshot();
    const result = await move(id, 'active', {
      insertion: { targetId, position },
    });
    assert.equal(result.changed, true);
    assert.deepEqual(await order('active'), expected);
    const after = await snapshot();
    for (const item of before.items) {
      const current = after.items.find((row) => row.id === item.id);
      assert.equal(
        current.version,
        item.version + (current.position !== item.position ? 1 : 0),
      );
    }
    const stable = await snapshot();
    assert.equal(
      (await move(id, 'active', { insertion: { targetId, position } })).changed,
      false,
    );
    assert.deepEqual(await snapshot(), stable);
  }

  for (const [position, expected] of [
    ['before', ['2', '1', '4']],
    ['after', ['2', '4', '1']],
  ]) {
    await reset();
    await move('1', 'active', { insertion: { targetId: '4', position } });
    assert.deepEqual(await order('new'), ['5']);
    assert.deepEqual(await order('active'), expected);
  }

  await reset();
  const beforeBlocked = await snapshot();
  await assert.rejects(move('1', 'blocked'), /reason/);
  for (const body of [' '.repeat(20), 'Too short', 'x'.repeat(2001)]) {
    await assert.rejects(
      move('1', 'blocked', { blockedReason: { body, authorId: 'nora' } }),
      /reason/,
    );
  }
  await assert.rejects(
    move('1', 'blocked', {
      blockedReason: {
        body: 'Waiting for the shared API contract.',
        authorId: 'missing',
      },
    }),
    { code: '23503' },
  );
  assert.deepEqual(
    await snapshot(),
    beforeBlocked,
    'Failed comment must roll back state, order and versions',
  );

  await move('1', 'blocked', {
    blockedReason: {
      body: '  Waiting for the shared API contract.  ',
      authorId: 'nora',
    },
  });
  assert.deepEqual(await order('blocked'), ['1']);
  assert.deepEqual((await snapshot()).comments, [
    {
      work_item_id: '1',
      author_id: 'nora',
      body: 'Waiting for the shared API contract.',
    },
  ]);
  await move('5', 'blocked', {
    blockedReason: {
      body: 'Waiting for an approved design review.',
      authorId: 'emil',
    },
  });
  await move('5', 'blocked', {
    insertion: { targetId: '1', position: 'before' },
  });
  assert.deepEqual(await order('blocked'), ['5', '1']);
  assert.equal(
    (await snapshot()).comments.length,
    2,
    'Reordering Blocked must not add a reason',
  );
  await assert.rejects(
    move('1', 'active', {
      blockedReason: {
        body: 'Waiting for the shared API contract.',
        authorId: 'nora',
      },
    }),
    /only accepted/,
  );
  await move('1', 'active');
  assert.deepEqual(await order('blocked'), ['5']);
  assert.deepEqual(await order('active'), ['2', '4', '1']);

  console.log(
    'Move SQL OK: insertion, reorder, no-ops, validation, version conflicts and atomic Blocked reason. Temporary data rolled back.',
  );
} finally {
  mock.restoreAll();
  try {
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}
