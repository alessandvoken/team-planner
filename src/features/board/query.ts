import 'server-only';
import type { PoolClient } from 'pg';

import { withBoardTransaction } from '../../lib/db.ts';
import type { BoardData, WorkItem, WorkItemComment } from './types.ts';

type WorkItemRow = Omit<WorkItem, 'assignee'> & {
  assignee_id: string | null;
  assignee_name: string | null;
};

async function getWorkItems(client: PoolClient): Promise<WorkItem[]> {
  const result = await client.query<WorkItemRow>(
    `
  SELECT
    w.id,
    w.title,
    w.kind,
    w.state,
    w.description,
    w.priority,
    w.assignee_id,
    w.version,
    t.name AS assignee_name
  FROM public.work_items AS w
  LEFT JOIN public.teammates AS t
    ON w.assignee_id = t.id
  ORDER BY w.state, w.position
`,
  );

  return result.rows.map((row) => {
    const { assignee_id, assignee_name, ...item } = row;

    return {
      ...item,
      assignee:
        assignee_id !== null && assignee_name !== null
          ? { id: assignee_id, name: assignee_name }
          : null,
    };
  });
}

export async function getBoardData(client?: PoolClient): Promise<BoardData> {
  if (!client) return withBoardTransaction(getBoardData);

  const items = await getWorkItems(client);
  const result = await client.query<{
    id: string;
    work_item_id: string;
    author_id: string | null;
    author_name: string | null;
    body: string;
    created_at: Date;
  }>(`
    SELECT c.id, c.work_item_id, c.author_id, t.name AS author_name,
      c.body, c.created_at
    FROM public.comments AS c
    LEFT JOIN public.teammates AS t ON t.id = c.author_id
    ORDER BY c.created_at, c.id
  `);
  const commentsByItemId: Record<string, WorkItemComment[]> = {};
  for (const row of result.rows) {
    const comment: WorkItemComment = {
      id: row.id,
      author:
        row.author_id === null
          ? { id: 'guest', name: 'Guest' }
          : { id: row.author_id, name: row.author_name! },
      body: row.body,
      createdAt: row.created_at.toISOString(),
    };
    (commentsByItemId[row.work_item_id] ??= []).push(comment);
  }
  return { items, commentsByItemId };
}
