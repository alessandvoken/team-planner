'use client';

import { Button, Description, Modal, TextArea, TextField } from '@heroui/react';
import { useState } from 'react';
import { useListData } from 'react-aria-components';

import { BoardColumn } from './board-column';
import {
  WORK_ITEM_STATE,
  type WorkItemState,
  type WorkItemInsertion,
  type WorkItem,
  type WorkItemComment,
} from './types';

type PendingMove = {
  id: string;
  columnState: WorkItemState;
  insertion?: WorkItemInsertion;
};

const GUEST_AUTHOR = { id: 'guest', name: 'Guest' };

export function SprintBoard({ initialItems }: { initialItems: WorkItem[] }) {
  const list = useListData<WorkItem>({ initialItems });
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [reason, setReason] = useState('');
  const [commentsByItemId, setCommentsByItemId] = useState<
    Record<string, WorkItemComment[]>
  >({});
  const [draftsByItemId, setDraftsByItemId] = useState<Record<string, string>>(
    {},
  );
  const isReasonValid =
    reason.trim().length >= 20 && reason.trim().length <= 2000;

  function moveWorkItem(
    id: string,
    columnState: WorkItemState,
    insertion?: WorkItemInsertion,
  ) {
    const item = list.getItem(id);
    if (!item) return;

    if (insertion) {
      const target = list.getItem(insertion.targetId);
      if (!target || target.id === id || target.state !== columnState) return;
    } else if (item.state === columnState) {
      return;
    }

    if (columnState === 'blocked' && item.state !== 'blocked') {
      setPendingMove({ id, columnState, insertion });
      setReason('');
      return;
    }
    applyWorkItemMove(id, columnState, insertion);
  }

  function applyWorkItemMove(
    id: string,
    columnState: WorkItemState,
    insertion?: WorkItemInsertion,
  ) {
    list.update(id, (previous) => ({ ...previous, state: columnState }));

    if (!insertion) {
      list.move(id, list.items.length - 1);
    } else if (insertion.position === 'before') {
      list.moveBefore(insertion.targetId, [id]);
    } else {
      list.moveAfter(insertion.targetId, [id]);
    }
  }

  function addComment(itemId: string, body: string) {
    const trimmedBody = body.trim();
    if (!list.getItem(itemId) || !trimmedBody || trimmedBody.length > 2000)
      return;

    const comment: WorkItemComment = {
      id: crypto.randomUUID(),
      author: GUEST_AUTHOR,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
    };
    setCommentsByItemId((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), comment],
    }));
  }

  function changeCommentDraft(itemId: string, value: string) {
    setDraftsByItemId((previous) => ({ ...previous, [itemId]: value }));
  }

  function confirmBlockedMove() {
    if (!pendingMove || !isReasonValid) return;
    applyWorkItemMove(
      pendingMove.id,
      pendingMove.columnState,
      pendingMove.insertion,
    );
    addComment(pendingMove.id, reason);
    setPendingMove(null);
  }

  return (
    <>
      <div
        data-board
        className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        {WORK_ITEM_STATE.map((state) => {
          const items = list.items.filter((item) => item.state === state);

          return (
            <BoardColumn
              key={state}
              state={state}
              items={items}
              onMove={moveWorkItem}
              commentsByItemId={commentsByItemId}
              draftsByItemId={draftsByItemId}
              onAddComment={addComment}
              onDraftChange={changeCommentDraft}
            />
          );
        })}
      </div>
      <Modal.Backdrop
        isDismissable={false}
        isOpen={pendingMove !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingMove(null);
        }}
      >
        <Modal.Container size="sm" scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="pr-8">
              <Modal.Heading>Work item blocked</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <p className="m-0">Add a reason for blocking this work item.</p>
              <TextField
                aria-label="Reason"
                value={reason}
                onChange={setReason}
              >
                <TextArea
                  rows={5}
                  className="border border-border bg-surface-secondary"
                />
                <Description>
                  Use 20–2000 characters. The reason will be added as a comment.
                </Description>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                type="button"
                isDisabled={!isReasonValid}
                onPress={confirmBlockedMove}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
