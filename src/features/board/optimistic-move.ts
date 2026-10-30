import type { WorkItem, WorkItemInsertion, WorkItemState } from './types.ts';

export function optimisticMove(
  items: WorkItem[],
  id: string,
  columnState: WorkItemState,
  insertion?: WorkItemInsertion,
): WorkItem[] {
  const item = items.find((item) => item.id === id);
  if (!item) return items;
  const remaining = items.filter((item) => item.id !== id);
  const targetIndex = insertion
    ? remaining.findIndex(
        (item) => item.id === insertion.targetId && item.state === columnState,
      )
    : -1;
  if (insertion && targetIndex === -1) return items;
  const index = insertion
    ? targetIndex + (insertion.position === 'after' ? 1 : 0)
    : remaining.length;
  remaining.splice(index, 0, { ...item, state: columnState });
  return remaining;
}
