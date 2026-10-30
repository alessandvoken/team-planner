import {
  Button,
  Chip,
  Description,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';

import { COMMENT_MAX_LENGTH, commentBodySchema } from './schemas';
import { WORK_ITEM_STATE_LABELS } from './states';
import type { WorkItem, WorkItemComment } from './types';
import { WorkItemCard } from './work-item-card';
import {
  WorkItemAssignee,
  WorkItemPriority,
  WorkItemTypeBadge,
} from './work-item-meta';

type WorkItemDetailsProps = {
  item: WorkItem;
  comments: WorkItemComment[];
  draft: string;
  onAddComment: (itemId: string, body: string) => void;
  onDraftChange: (itemId: string, value: string) => void;
};

export function WorkItemDetails({
  item,
  comments,
  draft,
  onAddComment,
  onDraftChange,
}: WorkItemDetailsProps) {
  const commentResult = commentBodySchema.safeParse(draft);

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
            <Modal.Body className="mt-6 text-foreground">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
                <section className="min-w-0">
                  <h3 className="mb-3 font-medium">Description</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
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

                <section className="flex min-w-0 flex-col gap-5 border-t border-separator pt-6">
                  <h3 className="font-medium">Comments</h3>
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted">No comments yet.</p>
                  ) : (
                    <ol className="space-y-4">
                      {comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-lg bg-surface-secondary p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-medium">
                              {comment.author.name}
                            </span>
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
                          <p className="text-sm wrap-break-word whitespace-pre-wrap">
                            {comment.body}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                  <form
                    className="space-y-4 border-t border-separator pt-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!commentResult.success) return;
                      onAddComment(item.id, commentResult.data);
                      onDraftChange(item.id, '');
                    }}
                  >
                    <TextField
                      value={draft}
                      onChange={(value) => onDraftChange(item.id, value)}
                      className="gap-2"
                    >
                      <Label>Comment</Label>
                      <TextArea
                        rows={3}
                        maxLength={COMMENT_MAX_LENGTH}
                        placeholder="Add context or share an update…"
                        className="border border-border bg-surface-secondary"
                      />
                      <Description>
                        Added comments stay in this tab until reload. Blocked
                        reasons are saved.
                      </Description>
                    </TextField>
                    <Button
                      type="submit"
                      size="sm"
                      isDisabled={!commentResult.success}
                    >
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
