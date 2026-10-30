import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getBoardData } from '@/features/board/query';
import { SprintBoard } from '@/features/board/sprint-board';

export const metadata: Metadata = {
  title: 'Team Planner',
};

export default async function Page() {
  await connection();
  const board = await getBoardData();

  return (
    <>
      <h1 className="mb-4 text-xl font-medium">Sprint board</h1>
      <SprintBoard
        initialItems={board.items}
        initialComments={board.commentsByItemId}
      />
    </>
  );
}
