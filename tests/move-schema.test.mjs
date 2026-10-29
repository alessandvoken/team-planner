import assert from 'node:assert/strict';
import test from 'node:test';

import {
  blockedReasonBodySchema,
  commentBodySchema,
  moveWorkItemActionSchema,
  moveWorkItemSchema,
} from '../src/features/board/schemas.ts';

test('shared comment rules trim text and distinguish optional comments from required Blocked reasons', () => {
  assert.equal(commentBodySchema.parse('  Context  '), 'Context');
  assert.equal(commentBodySchema.safeParse('x').success, true);
  assert.equal(blockedReasonBodySchema.safeParse('x').success, false);
  for (const schema of [commentBodySchema, blockedReasonBodySchema]) {
    for (const body of ['', ' \t\n ', 'x'.repeat(2001), null, 123]) {
      assert.equal(schema.safeParse(body).success, false);
    }
    assert.equal(schema.safeParse('x'.repeat(2000)).success, true);
  }
});

test('action input accepts reason text, strips browser-selected authors and shares move refinements', () => {
  const input = { id: '1', columnState: 'blocked', expectedVersion: 1 };
  const body = 'Waiting for the shared API contract.';
  assert.deepEqual(
    moveWorkItemActionSchema.parse({
      ...input,
      blockedReason: { body: `  ${body}  `, authorId: 'nora' },
    }),
    { ...input, blockedReason: { body } },
  );
  assert.equal(
    moveWorkItemSchema.safeParse({ ...input, blockedReason: { body } }).success,
    false,
  );
  for (const schema of [moveWorkItemActionSchema, moveWorkItemSchema]) {
    assert.equal(schema.safeParse(input).success, true);
    assert.equal(
      schema.safeParse({
        ...input,
        insertion: { targetId: '1', position: 'before' },
      }).success,
      false,
    );
  }
});

test('move input validates untrusted data, ID/version bounds and nullable Guest authors', () => {
  const input = { id: '1', columnState: 'active', expectedVersion: 1 };
  assert.deepEqual(moveWorkItemSchema.parse(input), input);
  assert.equal(
    moveWorkItemSchema.safeParse({
      ...input,
      id: '9223372036854775807',
      expectedVersion: 2147483647,
    }).success,
    true,
  );

  for (const invalid of [
    null,
    undefined,
    [],
    {},
    ...[
      '',
      '0',
      '-1',
      '01',
      '1.5',
      '1; DROP TABLE work_items',
      '9223372036854775808',
      '9'.repeat(20),
      1,
      null,
    ].map((id) => ({ ...input, id })),
    { ...input, columnState: 'invalid' },
    ...[0, -1, 1.5, 2147483648, '1', null, NaN, Infinity].map(
      (expectedVersion) => ({ ...input, expectedVersion }),
    ),
    ...[
      null,
      {},
      { targetId: '1', position: 'before' },
      { targetId: '2', position: 'on' },
      { targetId: '0', position: 'after' },
    ].map((insertion) => ({ ...input, insertion })),
    ...[null, {}, { body: 'x'.repeat(20) }].map((blockedReason) => ({
      ...input,
      blockedReason,
    })),
    ...[null, 123, ' '.repeat(20), 'x'.repeat(19), 'x'.repeat(2001)].map(
      (body) => ({ ...input, blockedReason: { body, authorId: null } }),
    ),
    ...['', ' \t\n', 123, undefined].map((authorId) => ({
      ...input,
      blockedReason: { body: 'x'.repeat(20), authorId },
    })),
  ]) {
    assert.equal(moveWorkItemSchema.safeParse(invalid).success, false);
  }

  for (const authorId of [null, 'nora']) {
    for (const length of [20, 2000]) {
      const parsed = moveWorkItemSchema.parse({
        ...input,
        columnState: 'blocked',
        blockedReason: { body: `  ${'x'.repeat(length)}  `, authorId },
      });
      assert.equal(parsed.blockedReason.body, 'x'.repeat(length));
      assert.equal(parsed.blockedReason.authorId, authorId);
    }
  }
});
