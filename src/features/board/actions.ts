'use server';

import { moveWorkItemInDB } from './mutations.ts';
import { getBoardData } from './query.ts';
import {
  moveWorkItemActionSchema,
  type MoveWorkItemActionInput,
} from './schemas.ts';

export async function moveWorkItemAction(input: MoveWorkItemActionInput) {
  const parsed = moveWorkItemActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Invalid move. Review the input and try again.',
    };
  }
  const { blockedReason, ...move } = parsed.data;
  try {
    const { board, ...result } = await moveWorkItemInDB({
      ...move,
      blockedReason: blockedReason
        ? { body: blockedReason.body, authorId: null }
        : undefined,
    });
    return { ok: true as const, result, board };
  } catch (error) {
    if (error instanceof Error && error.cause === 'WORK_ITEM_CONFLICT') {
      return {
        ok: false as const,
        error: error.message,
        board: await getBoardData(),
      };
    }
    console.error(
      'Work item move failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      ok: false as const,
      error: 'Unable to save the move. Please try again.',
    };
  }
}
