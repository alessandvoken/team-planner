import type { Metadata } from 'next';

import { MOCK_WORK_ITEMS } from '@/features/board/mock-work-items';
import { SprintBoard } from '@/features/board/sprint-board';

export const metadata: Metadata = {
  title: 'Sprint board | Team Planner',
};

export default function Page() {
  return (
    <>
      <h1 className="mb-4 text-xl font-medium">Sprint board</h1>
      <SprintBoard initialItems={MOCK_WORK_ITEMS} />
    </>
  );
}
