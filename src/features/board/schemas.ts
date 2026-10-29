import { z } from 'zod';

import { WORK_ITEM_STATE } from './types.ts';

export const COMMENT_MAX_LENGTH = 2000;
export const BLOCKED_REASON_MIN_LENGTH = 20;

export const commentBodySchema = z
  .string()
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(COMMENT_MAX_LENGTH, 'Comment must contain at most 2000 characters');

export const blockedReasonBodySchema = commentBodySchema.min(
  BLOCKED_REASON_MIN_LENGTH,
  'Blocked reason must contain at least 20 characters',
);

const workItemIdSchema = z
  .string()
  .refine(
    (value) =>
      /^[1-9]\d{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n,
    { error: 'Invalid work item ID' },
  );

export const moveWorkItemSchema = z
  .object({
    id: workItemIdSchema,
    columnState: z.enum(WORK_ITEM_STATE),
    expectedVersion: z.number().int().min(1).max(2147483647),
    insertion: z
      .object({
        targetId: workItemIdSchema,
        position: z.enum(['before', 'after']),
      })
      .optional(),
    blockedReason: z
      .object({
        body: blockedReasonBodySchema,
        authorId: z
          .string()
          .refine((value) => value.trim().length > 0, {
            error: 'Invalid comment author',
          })
          .nullable(),
      })
      .optional(),
  })
  .refine((input) => input.insertion?.targetId !== input.id, {
    error: 'Insertion target must differ from the moved work item',
    path: ['insertion', 'targetId'],
  });

export type MoveWorkItemInput = z.infer<typeof moveWorkItemSchema>;
