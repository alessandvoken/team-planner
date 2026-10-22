import { BoardColumn } from './BoardColumn';
import { WORK_ITEMS } from './data';
import { WORK_ITEM_STATE } from './types';

export function Board() {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
      {WORK_ITEM_STATE.map((state) => {
        const items = WORK_ITEMS.filter((item) => item.state === state);

        return <BoardColumn key={state} state={state} items={items} />;
      })}
    </div>
  );
}
