import {
  Button,
  Chip,
  Description,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';
import { useState } from 'react';

import { WORK_ITEM_STATE_LABELS } from './states';
import type { WorkItem } from './types';
import { WorkItemCard } from './work-item-card';
import {
  WorkItemAssignee,
  WorkItemPriority,
  WorkItemTypeBadge,
} from './work-item-meta';

type WorkItemDetailsProps = {
  item: WorkItem;
};

export function WorkItemDetails({ item }: WorkItemDetailsProps) {
  // ponytail: local comments reset on reload/remount; persist with the future API.
  const [comments, setComments] = useState<
    { id: string; body: string; createdAt: string }[]
  >([]);
  const [draft, setDraft] = useState('');

  return (
    <Modal>
      <WorkItemCard
        item={item}
        title={
          <Button variant="ghost" className="work-item-title">
            {item.title}
          </Button>
        }
      />
      <Modal.Backdrop>
        <Modal.Container size="lg" scroll="inside" className="sm:w-full">
          <Modal.Dialog className="max-w-6xl sm:h-[85dvh]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <div className="mb-2 flex flex-wrap items-center gap-3 pr-8">
                <WorkItemTypeBadge kind={item.kind} />
                <p className="text-sm text-muted">#{item.id}</p>
              </div>
              <Modal.Heading>{item.title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
                <section className="min-w-0">
                  <h3 className="mb-3 font-medium">Description</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                </section>

                <section className="rounded-lg bg-surface-secondary p-4 md:row-span-2">
                  <h3 className="mb-4 text-sm font-medium">Properties</h3>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="mb-1 text-xs text-muted">State</dt>
                      <dd>
                        <Chip size="sm" variant="soft">
                          {WORK_ITEM_STATE_LABELS[item.state]}
                        </Chip>
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-xs text-muted">Priority</dt>
                      <dd>
                        <WorkItemPriority priority={item.priority} />
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-2 text-xs text-muted">Assignee</dt>
                      <dd>
                        <WorkItemAssignee assignee={item.assignee} />
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="min-w-0 border-t border-separator pt-6">
                  <h3 className="mb-4 font-medium">Comments</h3>
                  {comments.length === 0 ? (
                    <p className="mb-4 text-sm text-muted">No comments yet.</p>
                  ) : (
                    <ol className="mb-5 space-y-4">
                      {comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-lg bg-surface-secondary p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-medium">You</span>
                            <time
                              dateTime={comment.createdAt}
                              className="text-muted"
                            >
                              {new Date(comment.createdAt).toLocaleString(
                                'en-GB',
                                {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                },
                              )}
                            </time>
                          </div>
                          <p className="bwrap-break-word text-sm whitespace-pre-wrap">
                            {comment.body}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const body = draft.trim();
                      if (!body) return;
                      setComments((previous) => [
                        ...previous,
                        {
                          id: crypto.randomUUID(),
                          body,
                          createdAt: new Date().toISOString(),
                        },
                      ]);
                      setDraft('');
                    }}
                  >
                    <TextField value={draft} onChange={setDraft}>
                      <Label>Comment</Label>
                      <TextArea
                        rows={3}
                        maxLength={2000}
                        placeholder="Add context or share an update…"
                      />
                      <Description>
                        Comments stay in this tab until reload.
                      </Description>
                    </TextField>
                    <Button type="submit" size="sm" isDisabled={!draft.trim()}>
                      Add comment
                    </Button>
                  </form>
                  <p role="status" className="sr-only">
                    {comments.length > 0
                      ? `${comments.length} comments added.`
                      : ''}
                  </p>
                </section>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
