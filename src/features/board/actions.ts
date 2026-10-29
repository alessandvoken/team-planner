'use server';

import { moveWorkItemInDB } from './mutations.ts';
import {
  moveWorkItemActionSchema,
  type MoveWorkItemActionInput,
} from './schemas.ts';

export async function moveWorkItemAction(input: MoveWorkItemActionInput) {
  const { blockedReason, ...move } = moveWorkItemActionSchema.parse(input);

  return moveWorkItemInDB({
    ...move,
    blockedReason: blockedReason
      ? { body: blockedReason.body, authorId: null }
      : undefined,
  });
}
