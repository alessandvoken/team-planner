import { Button } from '@heroui/react';
import { GripVertical } from 'lucide-react';
import { useRef } from 'react';
import {
  GridList,
  GridListItem,
  DropIndicator,
  useDragAndDrop,
  isTextDropItem,
} from 'react-aria-components';

import { WORK_ITEM_STATE_LABELS } from './states';
import type { WorkItem, WorkItemInsertion, WorkItemState } from './types';
import { WorkItemCard } from './WorkItemCard';
import { WorkItemDetails } from './WorkItemDetails';

type BoardColumnProps = {
  state: WorkItemState;
  items: WorkItem[];
  onMove: (
    id: string,
    destination: WorkItemState,
    insertion?: WorkItemInsertion,
  ) => void;
};

export function BoardColumn({ state, items, onMove }: BoardColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { dragAndDropHooks } = useDragAndDrop<WorkItem>({
    onDragStart: (event) => {
      const key = [...event.keys][0];
      const card = listRef.current?.querySelector<HTMLElement>(
        `[data-key="${CSS.escape(String(key))}"] [data-slot="card"]`,
      );
      const board = listRef.current?.closest<HTMLElement>('[data-board]');
      if (!card || !board) return;

      board.style.setProperty('--board-drag-height', `${card.offsetHeight}px`);
      board.style.setProperty(
        '--board-drag-radius',
        getComputedStyle(card).borderRadius,
      );
    },
    getItems(_keys, draggedItems) {
      return draggedItems.map((item) => ({
        'application/x-work-item': item.id,
        'text/plain': item.title,
      }));
    },
    renderDragPreview: (draggedItems) => {
      const id = draggedItems[0]['application/x-work-item'];
      const item = items.find((item) => item.id === id)!;

      return (
        <div
          className="relative"
          style={{ width: listRef.current?.getBoundingClientRect().width }}
        >
          <WorkItemCard item={item} />
          <span
            className="absolute top-2 right-2 flex size-8 items-center justify-center"
            aria-hidden="true"
          >
            <GripVertical size={16} />
          </span>
        </div>
      );
    },
    acceptedDragTypes: ['application/x-work-item'],
    getAllowedDropOperations: () => ['move'],
    getDropOperation: () => 'move',
    onInsert: async (event) => {
      const position = event.target.dropPosition;
      if (position === 'on') return;
      for (const droppedItem of event.items.filter(isTextDropItem)) {
        if (!droppedItem.types.has('application/x-work-item')) continue;
        const id = await droppedItem.getText('application/x-work-item');
        onMove(id, state, {
          targetId: String(event.target.key),
          position,
        });
      }
    },
    onReorder: (event) => {
      const position = event.target.dropPosition;
      if (position === 'on') return;
      for (const key of event.keys) {
        onMove(String(key), state, {
          targetId: String(event.target.key),
          position,
        });
      }
    },
    renderDropIndicator: (target) => (
      <DropIndicator target={target} className="board-drop-indicator" />
    ),
    onRootDrop: async (event) => {
      const droppedItems = event.items.filter(isTextDropItem);
      for (const droppedItem of droppedItems) {
        if (!droppedItem.types.has('application/x-work-item')) continue;
        const id = await droppedItem.getText('application/x-work-item');
        onMove(id, state);
      }
    },
  });

  return (
    <section
      className="flex flex-col rounded-lg bg-surface-secondary p-4 shadow-md"
      aria-labelledby={`column-${state}`}
      key={state}
    >
      <div className="mb-3 flex justify-between">
        <h2 className="font-medium" id={`column-${state}`}>
          {WORK_ITEM_STATE_LABELS[state]}
        </h2>
        <span className="text-muted">{items.length}</span>
      </div>

      <GridList
        ref={listRef}
        aria-labelledby={`column-${state}`}
        items={items}
        className="grid min-h-24 flex-1 content-start gap-3"
        renderEmptyState={({ isDropTarget }) =>
          isDropTarget ? (
            <div
              className="board-drop-indicator"
              data-drop-target
              aria-hidden="true"
            />
          ) : (
            <p className="text-muted">No work items</p>
          )
        }
        dragAndDropHooks={dragAndDropHooks}
      >
        {(item) => (
          <GridListItem
            id={item.id}
            textValue={item.title}
            className="relative cursor-grab rounded-lg outline-offset-2 outline-accent focus-visible:outline-2 data-[dragging]:cursor-grabbing data-[dragging]:opacity-0"
          >
            <WorkItemDetails item={item} />
            <Button
              slot="drag"
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={`Move #${item.id}: ${item.title}`}
              className="absolute top-2 right-2 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} aria-hidden="true" />
            </Button>
          </GridListItem>
        )}
      </GridList>
    </section>
  );
}
