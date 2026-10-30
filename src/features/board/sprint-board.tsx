'use client';

import {
  Button,
  Description,
  Modal,
  TextArea,
  TextField,
  toast,
} from '@heroui/react';
import { useRef, useState } from 'react';

import { moveWorkItemAction } from './actions';
import { BoardColumn } from './board-column';
import { optimisticMove } from './optimistic-move';
import {
  BLOCKED_REASON_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
  blockedReasonBodySchema,
  commentBodySchema,
  type MoveWorkItemActionInput,
} from './schemas';
import {
  WORK_ITEM_STATE,
  type WorkItemState,
  type WorkItemInsertion,
  type WorkItem,
  type WorkItemComment,
} from './types';
import { WORK_ITEM_KINDS } from './work-item-meta';

type PendingMove = {
  id: string;
  columnState: WorkItemState;
  insertion?: WorkItemInsertion;
  expectedVersion: number;
};

const GUEST_AUTHOR = { id: 'guest', name: 'Guest' };

export function SprintBoard({
  initialItems,
  initialComments,
}: {
  initialItems: WorkItem[];
  initialComments: Record<string, WorkItemComment[]>;
}) {
  const [items, setItems] = useState(initialItems);
  const [savedComments, setSavedComments] = useState(initialComments);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [reason, setReason] = useState('');
  const [localComments, setLocalComments] = useState<
    Record<string, WorkItemComment[]>
  >({});
  const [draftsByItemId, setDraftsByItemId] = useState<Record<string, string>>(
    {},
  );
  const reasonResult = blockedReasonBodySchema.safeParse(reason);
  const commentsByItemId = { ...savedComments };
  for (const [id, comments] of Object.entries(localComments)) {
    commentsByItemId[id] = [...(savedComments[id] ?? []), ...comments];
  }

  async function saveWorkItemMove(input: MoveWorkItemActionInput) {
    if (savingRef.current) return null;
    savingRef.current = true;
    setIsSaving(true);
    const previousItems = items;
    setItems(
      optimisticMove(items, input.id, input.columnState, input.insertion),
    );
    if (input.blockedReason) setPendingMove(null);

    function restoreMove(authoritativeItems = previousItems) {
      setItems(authoritativeItems);
      if (input.blockedReason) {
        const current = authoritativeItems.find((item) => item.id === input.id);
        if (current && current.state !== 'blocked') {
          setPendingMove({
            id: input.id,
            columnState: input.columnState,
            insertion: input.insertion,
            expectedVersion: current.version,
          });
        }
      }
    }

    try {
      const savedItem = await moveWorkItemAction(input);
      if (savedItem.board) {
        setItems(savedItem.board.items);
        setSavedComments(savedItem.board.commentsByItemId);
      }
      if (!savedItem.ok) {
        restoreMove(savedItem.board?.items);
        toast.danger(savedItem.error);
        return null;
      }
      if (savedItem.result.changed && input.blockedReason) {
        const movedItem = savedItem.board.items.find(
          (item) => item.id === input.id,
        )!;
        toast.success(
          `${WORK_ITEM_KINDS[movedItem.kind].label} #${input.id} moved to Blocked`,
        );
      }
      return savedItem;
    } catch {
      restoreMove();
      toast.danger('Unable to save the move. Please try again.');
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  function moveWorkItem(
    id: string,
    columnState: WorkItemState,
    insertion?: WorkItemInsertion,
  ) {
    if (savingRef.current || pendingMove) return;
    const item = items.find((item) => item.id === id);
    if (!item) return;

    if (insertion) {
      const target = items.find((item) => item.id === insertion.targetId);
      if (!target || target.id === id || target.state !== columnState) return;
    } else if (item.state === columnState) {
      return;
    }

    if (columnState === 'blocked' && item.state !== 'blocked') {
      setPendingMove({
        id,
        columnState,
        insertion,
        expectedVersion: item.version,
      });
      setReason('');
      return;
    }
    void saveWorkItemMove({
      id,
      columnState,
      insertion,
      expectedVersion: item.version,
    });
  }

  function addComment(itemId: string, body: string) {
    const result = commentBodySchema.safeParse(body);
    if (!items.some((item) => item.id === itemId) || !result.success) return;

    const comment: WorkItemComment = {
      id: crypto.randomUUID(),
      author: GUEST_AUTHOR,
      body: result.data,
      createdAt: new Date().toISOString(),
    };
    setLocalComments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), comment],
    }));
  }

  function changeCommentDraft(itemId: string, value: string) {
    setDraftsByItemId((previous) => ({ ...previous, [itemId]: value }));
  }

  function confirmBlockedMove() {
    if (savingRef.current || !pendingMove || !reasonResult.success) return;

    void saveWorkItemMove({
      id: pendingMove.id,
      columnState: pendingMove.columnState,
      insertion: pendingMove.insertion,
      expectedVersion: pendingMove.expectedVersion,
      blockedReason: { body: reasonResult.data },
    });
  }

  return (
    <>
      <div
        data-board
        aria-busy={isSaving}
        className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        {WORK_ITEM_STATE.map((state) => {
          const columnItems = items.filter((item) => item.state === state);

          return (
            <BoardColumn
              key={state}
              state={state}
              items={columnItems}
              isDisabled={isSaving || pendingMove !== null}
              onMove={moveWorkItem}
              commentsByItemId={commentsByItemId}
              draftsByItemId={draftsByItemId}
              onAddComment={addComment}
              onDraftChange={changeCommentDraft}
            />
          );
        })}
      </div>
      <p role="status" className="sr-only">
        {isSaving ? 'Saving work item move…' : ''}
      </p>
      <Modal.Backdrop
        className="blocked-reason-backdrop"
        isDismissable={false}
        isKeyboardDismissDisabled={isSaving}
        isOpen={pendingMove !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && pendingMove && !savingRef.current) {
            toast.warning('Issues in Blocked require an additional comment.');
            setPendingMove(null);
          }
        }}
      >
        <Modal.Container size="sm" placement="center" scroll="outside">
          <Modal.Dialog aria-busy={isSaving}>
            <Modal.CloseTrigger isDisabled={isSaving} />
            <Modal.Header className="pr-8">
              <Modal.Heading>Work item blocked</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <p className="m-0">Add a reason for blocking this work item.</p>
              <TextField
                aria-label="Reason"
                value={reason}
                onChange={setReason}
                isDisabled={isSaving}
              >
                <TextArea
                  rows={5}
                  className="border border-border bg-surface-secondary"
                />
                <Description>
                  Use {BLOCKED_REASON_MIN_LENGTH}–{COMMENT_MAX_LENGTH}{' '}
                  characters. The reason will be added as a comment.
                </Description>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                slot="close"
                variant="secondary"
                isDisabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                isDisabled={!reasonResult.success || isSaving}
                isPending={isSaving}
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
