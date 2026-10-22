import { Avatar, Chip } from '@heroui/react';
import { BookOpen, Bug, SquareCheck, UserRound } from 'lucide-react';

import type { WorkItem, WorkItemKind } from './types';

const WORK_ITEM_KINDS = {
  bug: { label: 'Bug', Icon: Bug, color: 'danger' },
  story: { label: 'User story', Icon: BookOpen, color: 'accent' },
  task: { label: 'Task', Icon: SquareCheck, color: 'default' },
} as const;

export function WorkItemTypeBadge({ kind }: { kind: WorkItemKind }) {
  const { label, Icon, color } = WORK_ITEM_KINDS[kind];

  return (
    <Chip size="sm" variant="soft" color={color}>
      <Icon size={14} aria-hidden="true" />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}

export function WorkItemPriority({ priority }: Pick<WorkItem, 'priority'>) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={priority === 'High' ? 'warning' : 'default'}
    >
      <span className="sr-only">Priority: </span>
      <Chip.Label>{priority}</Chip.Label>
    </Chip>
  );
}

export function WorkItemAssignee({ assignee }: Pick<WorkItem, 'assignee'>) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm">
      <Avatar size="sm" variant="soft" aria-hidden="true">
        <Avatar.Fallback>
          {assignee ? (
            assignee.name
              .split(' ')
              .map((part) => part[0])
              .join('')
          ) : (
            <UserRound size={14} />
          )}
        </Avatar.Fallback>
      </Avatar>
      <span className="min-w-0 wrap-break-word">
        {assignee?.name ?? 'Unassigned'}
      </span>
    </span>
  );
}
