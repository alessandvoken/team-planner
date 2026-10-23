'use client';

import { useListData } from 'react-aria-components';

import { BoardColumn } from './board-column';
import {
  WORK_ITEM_STATE,
  type WorkItemState,
  type WorkItemInsertion,
  type WorkItem,
} from './types';

export function SprintBoard({ initialItems }: { initialItems: WorkItem[] }) {
  const list = useListData<WorkItem>({ initialItems });

  function moveWorkItem(
    id: string,
    columnState: WorkItemState,
    insertion?: WorkItemInsertion,
  ) {
    const item = list.getItem(id);
    if (!item) return;

    if (insertion) {
      const target = list.getItem(insertion.targetId);
      if (!target || target.id === id || target.state !== columnState) return;
    } else if (item.state === columnState) {
      return;
    }

    list.update(id, (previous) => ({ ...previous, state: columnState }));

    if (!insertion) {
      list.move(id, list.items.length - 1);
    } else if (insertion.position === 'before') {
      list.moveBefore(insertion.targetId, [id]);
    } else {
      list.moveAfter(insertion.targetId, [id]);
    }
  }

  return (
    <div data-board className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
      {WORK_ITEM_STATE.map((state) => {
        const items = list.items.filter((item) => item.state === state);

        return (
          <BoardColumn
            key={state}
            state={state}
            items={items}
            onMove={moveWorkItem}
          />
        );
      })}
    </div>
  );
}
