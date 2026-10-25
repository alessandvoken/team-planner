import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { MOCK_WORK_ITEMS } from '../src/features/board/mock-work-items.ts';
import { db } from '../src/lib/db.ts';

const client = await db.connect();
try {
  await client.query('begin');
  await client.query("set local lock_timeout = '5s'");
  await client.query("set local statement_timeout = '10s'");
  const { rows: existing } = await client.query(
    "select tablename from pg_tables where schemaname = 'public' and tablename in ('teammates', 'work_items', 'comments')",
  );
  assert.equal(
    existing.length,
    0,
    'Schema check needs a database without board tables',
  );
  await client.query(
    await readFile(
      new URL(
        '../supabase/migrations/202610250001_initial_board.sql',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  await client.query(
    await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8'),
  );

  const { rows: items } = await client.query(`
    select w.id, w.title, w.kind, w.state, w.description, w.priority,
      case when t.id is null then null else json_build_object('id', t.id, 'name', t.name) end as assignee
    from public.work_items w
    left join public.teammates t on t.id = w.assignee_id
    order by w.id
  `);
  assert.equal(items.length, 8);
  assert.deepEqual(items.slice(0, MOCK_WORK_ITEMS.length), MOCK_WORK_ITEMS);
  const { rows: teammates } = await client.query(
    'select id, name from public.teammates order by id',
  );
  assert.deepEqual(teammates, [
    { id: 'alessandro', name: 'Alessandro Perchiazzi' },
    { id: 'emil', name: 'Emil Berg' },
    { id: 'nora', name: 'Nora Lind' },
  ]);
  assert.deepEqual(
    items
      .filter((item) => item.assignee?.id === 'alessandro')
      .map((item) => item.id),
    ['5', '7'],
  );

  async function rejects(sql, values, code) {
    await client.query('savepoint invalid_input');
    try {
      await assert.rejects(client.query(sql, values), { code });
    } finally {
      await client.query('rollback to savepoint invalid_input');
      await client.query('release savepoint invalid_input');
    }
  }

  for (const title of ['', ' \t\n', 'x'.repeat(201)]) {
    await rejects(
      'update public.work_items set title = $1 where id = 1',
      [title],
      '23514',
    );
  }
  for (const column of ['state', 'kind', 'priority']) {
    await rejects(
      `update public.work_items set ${column} = 'invalid' where id = 1`,
      [],
      '23514',
    );
  }
  await rejects(
    'update public.work_items set position = -1 where id = 1',
    [],
    '23514',
  );
  await rejects(
    'update public.work_items set version = 0 where id = 1',
    [],
    '23514',
  );
  await rejects(
    "update public.work_items set assignee_id = 'missing' where id = 1",
    [],
    '23503',
  );
  await rejects(
    'update public.work_items set position = 0 where id = 4',
    [],
    '23505',
  );
  for (const body of ['', ' \t\n', 'x'.repeat(2001)]) {
    await rejects(
      "insert into public.comments (work_item_id, author_id, body) values (1, 'nora', $1)",
      [body],
      '23514',
    );
  }
  await rejects(
    "insert into public.comments (work_item_id, author_id, body) values (999, 'nora', 'Context')",
    [],
    '23503',
  );
  await rejects(
    "insert into public.comments (work_item_id, author_id, body) values (1, 'missing', 'Context')",
    [],
    '23503',
  );

  // Swapping positions is valid within one transaction, not as duplicate final order.
  await client.query('set constraints work_items_state_position_key deferred');
  await client.query(
    'update public.work_items set position = 1 - position where state = $1',
    ['active'],
  );
  await client.query('set constraints work_items_state_position_key immediate');
  const { rows: order } = await client.query(
    "select id from public.work_items where state = 'active' order by position",
  );
  assert.deepEqual(
    order.map((item) => item.id),
    ['4', '2'],
  );

  const insert = await client.query(
    "insert into public.work_items (title, kind, position) values ('Check identity', 'task', 2) returning id, state, version",
  );
  assert.deepEqual(insert.rows[0], { id: '9', state: 'new', version: 1 });
  const id = insert.rows[0].id;
  await client.query(
    "insert into public.comments (work_item_id, author_id, body) values ($1, 'alessandro', 'Saved context')",
    [id],
  );
  await client.query('delete from public.work_items where id = $1', [id]);
  const { rows: comments } = await client.query(
    'select id from public.comments where work_item_id = $1',
    [id],
  );
  assert.equal(comments.length, 0);

  const { rows: tables } = await client.query(
    "select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ('teammates', 'work_items', 'comments')",
  );
  assert.equal(tables.length, 3);
  assert.ok(tables.every((table) => table.rowsecurity));
  const { rows: permissions } = await client.query(`
    select has_table_privilege(r.role, 'public.' || t.name, p.privilege) as allowed
    from (values ('anon'), ('authenticated'), ('service_role')) r(role)
    cross join (values ('teammates'), ('work_items'), ('comments')) t(name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) p(privilege)
  `);
  assert.ok(permissions.every((permission) => !permission.allowed));
  console.log(
    'Schema OK: seed, validation, foreign keys, order, identity, RLS and API permissions.',
  );
} finally {
  await client.query('rollback');
  client.release();
  await db.end();
}
