import { useRef } from 'react';
import {
  DropIndicator,
  isTextDropItem,
  useDragAndDrop,
} from 'react-aria-components';

import type { WorkItem, WorkItemInsertion, WorkItemState } from './types';
import { WorkItemCard } from './work-item-card';

export type CardDragAndDropOptions = {
  state: WorkItemState;
  items: WorkItem[];
  isDisabled: boolean;
  onMove: (
    id: string,
    destination: WorkItemState,
    insertion?: WorkItemInsertion,
  ) => Promise<void>;
};

export function useCardDragAndDrop({
  state,
  items,
  isDisabled,
  onMove,
}: CardDragAndDropOptions) {
  const listRef = useRef<HTMLDivElement>(null);
  const { dragAndDropHooks } = useDragAndDrop<WorkItem>({
    isDisabled,
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
          className="work-item-drag-preview"
          style={{ width: listRef.current?.getBoundingClientRect().width }}
        >
          <WorkItemCard item={item} />
        </div>
      );
    },
    acceptedDragTypes: ['application/x-work-item'],
    getAllowedDropOperations: () => ['move'],
    getDropOperation: (target) =>
      target.type === 'root' && items.length > 0 ? 'cancel' : 'move',
    onInsert: async (event) => {
      const position = event.target.dropPosition;
      if (position === 'on') return;
      for (const droppedItem of event.items.filter(isTextDropItem)) {
        if (!droppedItem.types.has('application/x-work-item')) continue;
        const id = await droppedItem.getText('application/x-work-item');
        await onMove(id, state, {
          targetId: String(event.target.key),
          position,
        });
      }
    },
    onReorder: async (event) => {
      const position = event.target.dropPosition;
      if (position === 'on') return;
      for (const key of event.keys) {
        await onMove(String(key), state, {
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
        await onMove(id, state);
      }
    },
  });

  const useDroppableCollection = dragAndDropHooks.useDroppableCollection!;
  const hooks: typeof dragAndDropHooks = {
    ...dragAndDropHooks,
    useDroppableCollection(props, dropState, ref) {
      return useDroppableCollection(
        {
          ...props,
          // Empty lists have one root target; arrow navigation would clear it.
          keyboardDelegate:
            dropState.collection.size === 0 ? {} : props.keyboardDelegate,
        },
        dropState,
        ref,
      );
    },
  };

  return { listRef, dragAndDropHooks: hooks };
}
