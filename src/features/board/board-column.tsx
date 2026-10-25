import { Button } from '@heroui/react';
import { GridList, GridListItem } from 'react-aria-components';

import { WORK_ITEM_STATE_LABELS } from './states';
import {
  useCardDragAndDrop,
  type CardDragAndDropOptions,
} from './use-card-drag-and-drop';
import { WorkItemDetails } from './work-item-details';

export function BoardColumn({ state, items, onMove }: CardDragAndDropOptions) {
  const { listRef, dragAndDropHooks } = useCardDragAndDrop({
    state,
    items,
    onMove,
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
            className="work-item-drag-source relative cursor-grab rounded-[min(32px,var(--radius-3xl))] outline-offset-2 outline-accent no-highlight focus-visible:outline-2 data-[dragging]:cursor-grabbing data-[dragging]:opacity-0"
          >
            <WorkItemDetails item={item} />
            <Button
              slot="drag"
              size="sm"
              variant="secondary"
              aria-label={`Move #${item.id}: ${item.title}`}
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-10"
            >
              Move card
            </Button>
          </GridListItem>
        )}
      </GridList>
    </section>
  );
}
