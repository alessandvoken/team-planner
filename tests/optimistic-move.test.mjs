import assert from 'node:assert/strict';
import test from 'node:test';

import { optimisticMove } from '../src/features/board/optimistic-move.ts';

test('optimistic moves preserve the rollback snapshot and apply destination ordering', () => {
  const items = [
    { id: '1', state: 'new', version: 1 },
    { id: '2', state: 'active', version: 1 },
    { id: '3', state: 'new', version: 1 },
    { id: '4', state: 'active', version: 1 },
  ];
  const snapshot = structuredClone(items);
  const order = (list, state) =>
    list.filter((item) => item.state === state).map((item) => item.id);
  for (const [id, destination, insertion, expected] of [
    ['3', 'new', { targetId: '1', position: 'before' }, ['3', '1']],
    ['1', 'new', { targetId: '3', position: 'after' }, ['3', '1']],
    ['1', 'active', { targetId: '4', position: 'before' }, ['2', '1', '4']],
    ['1', 'active', { targetId: '4', position: 'after' }, ['2', '4', '1']],
    ['1', 'active', undefined, ['2', '4', '1']],
    ['1', 'blocked', undefined, ['1']],
  ]) {
    const next = optimisticMove(items, id, destination, insertion);
    assert.deepEqual(order(next, destination), expected);
    assert.equal(next.length, items.length);
    assert.equal(new Set(next.map((item) => item.id)).size, items.length);
    assert.equal(next.find((item) => item.id === id).version, 1);
    assert.deepEqual(
      items,
      snapshot,
      'Original data must remain intact for rollback',
    );
  }
  assert.equal(optimisticMove(items, 'missing', 'new'), items);
  assert.equal(
    optimisticMove(items, '1', 'new', { targetId: '2', position: 'before' }),
    items,
  );
});
