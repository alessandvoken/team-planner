import 'server-only';
import { db } from '../../lib/db.ts';
import {
  WORK_ITEM_STATE,
  type WorkItemInsertion,
  type WorkItemState,
} from './types.ts';

type MoveWorkItemInput = {
  id: string;
  columnState: WorkItemState;
  expectedVersion: number;
  insertion?: WorkItemInsertion;
  blockedReason?: { body: string; authorId: string };
};

type WorkItemMoveRow = {
  id: string;
  state: WorkItemState;
  position: number;
  version: number;
};

function isWorkItemId(value: string) {
  return (
    typeof value === 'string' &&
    /^[1-9]\d{0,18}$/.test(value) &&
    BigInt(value) <= 9223372036854775807n
  );
}

export async function moveWorkItemInDB({
  id,
  columnState,
  expectedVersion,
  insertion,
  blockedReason,
}: MoveWorkItemInput): Promise<{ item: WorkItemMoveRow; changed: boolean }> {
  if (
    !isWorkItemId(id) ||
    !WORK_ITEM_STATE.includes(columnState) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 1 ||
    expectedVersion > 2147483647
  ) {
    throw new Error('Invalid work item move');
  }
  if (
    insertion &&
    (!isWorkItemId(insertion.targetId) ||
      insertion.targetId === id ||
      !['before', 'after'].includes(insertion.position))
  ) {
    throw new Error('Invalid insertion target');
  }
  const reason =
    typeof blockedReason?.body === 'string'
      ? blockedReason.body.trim()
      : undefined;
  if (
    blockedReason &&
    (typeof reason !== 'string' ||
      reason.length < 20 ||
      reason.length > 2000 ||
      typeof blockedReason.authorId !== 'string' ||
      !blockedReason.authorId.trim())
  ) {
    throw new Error(
      'Blocked requires an author and a 20–2000-character reason',
    );
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '10s'");

    // ponytail: serialize moves on this single board; use per-board locks if more boards enter.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('team-planner:work-item-order'))",
    );
    await client.query(
      'SET CONSTRAINTS work_items_state_position_key DEFERRED',
    );

    const result = await client.query<WorkItemMoveRow>(
      `SELECT id, state, position, version
       FROM public.work_items
       WHERE id = $1
       FOR UPDATE`,
      [id],
    );
    const item = result.rows[0];
    if (!item) throw new Error('Work item not found');
    if (item.version !== expectedVersion) {
      throw new Error('Work item changed; refresh the board and try again');
    }

    const enteringBlocked =
      columnState === 'blocked' && item.state !== 'blocked';
    if (enteringBlocked && !blockedReason) {
      throw new Error('A reason is required when entering Blocked');
    }
    if (!enteringBlocked && blockedReason) {
      throw new Error(
        'A blocked reason is only accepted when entering Blocked',
      );
    }

    let position: number;
    if (insertion) {
      const targetResult = await client.query<WorkItemMoveRow>(
        `SELECT id, state, position, version
         FROM public.work_items WHERE id = $1 FOR UPDATE`,
        [insertion.targetId],
      );
      const target = targetResult.rows[0];
      if (!target || target.state !== columnState) {
        throw new Error(
          'Insertion target is no longer in the destination column',
        );
      }
      position = target.position + (insertion.position === 'after' ? 1 : 0);
      // Removing the source shifts subsequent positions one place to the left.
      if (item.state === columnState && item.position < position) position -= 1;
    } else if (item.state === columnState) {
      position = item.position;
    } else {
      const lastPosition = await client.query<{ position: number }>(
        `SELECT coalesce(max(position) + 1, 0) AS position
         FROM public.work_items WHERE state = $1`,
        [columnState],
      );
      position = lastPosition.rows[0].position;
    }

    if (item.state === columnState && item.position === position) {
      await client.query('COMMIT');
      return { item, changed: false };
    }

    if (item.state === columnState) {
      await client.query(
        `UPDATE public.work_items
         SET position = position + $1, version = version + 1, updated_at = now()
         WHERE state = $2 AND id <> $3
           AND position BETWEEN $4 AND $5`,
        [
          position > item.position ? -1 : 1,
          columnState,
          id,
          Math.min(item.position, position),
          Math.max(item.position, position),
        ],
      );
    } else {
      await client.query(
        `UPDATE public.work_items
         SET position = position - 1, version = version + 1, updated_at = now()
         WHERE state = $1 AND position > $2`,
        [item.state, item.position],
      );
      await client.query(
        `UPDATE public.work_items
         SET position = position + 1, version = version + 1, updated_at = now()
         WHERE state = $1 AND position >= $2`,
        [columnState, position],
      );
    }

    const moved = await client.query<WorkItemMoveRow>(
      `UPDATE public.work_items
       SET state = $1, position = $2, version = version + 1, updated_at = now()
       WHERE id = $3
       RETURNING id, state, position, version`,
      [columnState, position, id],
    );
    if (enteringBlocked && blockedReason) {
      await client.query(
        `INSERT INTO public.comments (work_item_id, author_id, body)
         VALUES ($1, $2, $3)`,
        [id, blockedReason.authorId, reason],
      );
    }

    await client.query('COMMIT');
    return { item: moved.rows[0], changed: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
