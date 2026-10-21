import { WORK_ITEMS } from './data';
import { WORK_ITEM_STATE_LABELS } from './states';
import { WORK_ITEM_STATE } from './types';

export function Board() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {WORK_ITEM_STATE.map((state) => (
        <section className="bg-slate-100 p-4" key={state}>
          <div className="mb-3 flex justify-between">
            <h2 className="font-semibold">{WORK_ITEM_STATE_LABELS[state]}</h2>
            <span>
              {WORK_ITEMS.filter((item) => item.state === state).length}
            </span>
          </div>

          {WORK_ITEMS.filter((item) => item.state === state).length === 0 && (
            <p>No work items</p>
          )}

          <ul className="grid gap-3">
            {WORK_ITEMS.filter((item) => item.state === state).map((item) => (
              <li
                className="rounded-lg border border-slate-200 bg-white p-3"
                key={item.id}
              >
                <p className="text-xs text-slate-500">#{item.id}</p>
                <h3 className="text-sm font-medium">{item.title}</h3>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
