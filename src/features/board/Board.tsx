import { WORK_ITEM_STATE } from './types';
import { WORK_ITEM_STATE_LABELS } from './states';
import { WORK_ITEMS } from './data';

export function Board() {
  return (
    <div>
      {WORK_ITEM_STATE.map((state) => (
        <section key={state}>
          <h2>{WORK_ITEM_STATE_LABELS[state]}</h2>
          <ul>
            {WORK_ITEMS.filter((item) => item.state === state).map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
