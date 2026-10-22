import { WORK_ITEM_STATE_LABELS } from './states';
import type { WorkItem, WorkItemState } from './types';
import { WorkItemDetails } from './WorkItemDetails';

type BoardColumnProps = {
  state: WorkItemState;
  items: WorkItem[];
};

export function BoardColumn({ state, items }: BoardColumnProps) {
  return (
    <section
      className="rounded-lg bg-surface-secondary p-4 shadow-md"
      aria-labelledby={`column-${state}`}
      key={state}
    >
      <div className="mb-3 flex justify-between">
        <h2 className="font-medium" id={`column-${state}`}>
          {WORK_ITEM_STATE_LABELS[state]}
        </h2>
        <span className="text-muted">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">No work items</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <WorkItemDetails item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
