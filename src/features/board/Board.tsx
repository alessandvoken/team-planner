import { WORK_ITEMS } from './data';
import { WORK_ITEM_STATE_LABELS } from './states';
import { WORK_ITEM_STATE } from './types';

export function Board() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {WORK_ITEM_STATE.map((state) => (
        <section className="bg-column p-4" key={state}>
          <div className="mb-3 flex justify-between">
            <h2 className="font-medium">{WORK_ITEM_STATE_LABELS[state]}</h2>
            <span className="text-muted">
              {WORK_ITEMS.filter((item) => item.state === state).length}
            </span>
          </div>

          {WORK_ITEMS.filter((item) => item.state === state).length === 0 && (
            <p className="text-muted">No work items</p>
          )}

          <ul className="grid gap-3">
            {WORK_ITEMS.filter((item) => item.state === state).map((item) => (
              <li
                className="rounded-lg border border-border bg-card p-3"
                key={item.id}
              >
                <p className="text-xs text-muted">#{item.id}</p>
                <h3 className="text-sm font-normal">{item.title}</h3>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
