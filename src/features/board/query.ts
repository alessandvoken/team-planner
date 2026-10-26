import 'server-only';
import { db } from '@/lib/db';

import type { WorkItem } from './types';

type WorkItemRow = Omit<WorkItem, 'assignee'> & {
  assignee_id: string | null;
  assignee_name: string | null;
};

export async function getWorkItems(): Promise<WorkItem[]> {
  const result = await db.query<WorkItemRow>(
    `
  SELECT
    w.id,
    w.title,
    w.kind,
    w.state,
    w.description,
    w.priority,
    w.assignee_id,
    t.name AS assignee_name
  FROM public.work_items AS w
  LEFT JOIN public.teammates AS t
    ON w.assignee_id = t.id
  ORDER BY w.position
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
