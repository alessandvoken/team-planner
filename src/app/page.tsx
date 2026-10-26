import type { Metadata } from 'next';

import { getWorkItems } from '@/features/board/query';
import { SprintBoard } from '@/features/board/sprint-board';

export const metadata: Metadata = {
  title: 'Team Planner',
};

export default async function Page() {
  const items = await getWorkItems();

  return (
    <>
      <h1 className="mb-4 text-xl font-medium">Sprint board</h1>
      <SprintBoard initialItems={items} />
    </>
  );
}
