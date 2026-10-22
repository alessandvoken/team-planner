import { WORK_ITEMS } from './data';
import { WORK_ITEM_STATE_LABELS } from './states';
import { WORK_ITEM_STATE } from './types';
import { WorkItemDetails } from './WorkItemDetails';

export function Board() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {WORK_ITEM_STATE.map((state) => {
        const items = WORK_ITEMS.filter((item) => item.state === state);

        return (
          <section
            className="bg-surface-secondary p-4"
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
      })}
    </div>
  );
}
