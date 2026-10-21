import { WORK_ITEM_STATE } from './types';
import { WORK_ITEM_STATE_LABELS } from './states';
import { WORK_ITEMS } from './data';

export function Board() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {WORK_ITEM_STATE.map((state) => (
        <section className="bg-slate-100 p-4" key={state}>
          <h2 className="font-semibold mb-3">
            {WORK_ITEM_STATE_LABELS[state]}
          </h2>
          <ul>
            {WORK_ITEMS.filter((item) => item.state === state).map((item) => (
              <li className="bg-white p-3" key={item.id}>
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
