import { Card } from '@heroui/react';

import type { WorkItem } from './types';
import {
  WorkItemAssignee,
  WorkItemPriority,
  WorkItemTypeBadge,
} from './WorkItemMeta';

export function WorkItemCard({ item }: { item: WorkItem }) {
  return (
    <Card className="ring-1 ring-transparent focus-within:ring-accent hover:ring-accent">
      <Card.Header>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 pr-8">
          <WorkItemTypeBadge kind={item.kind} />
          <Card.Description className="text-xs">#{item.id}</Card.Description>
        </div>
        <Card.Title className="font-normal">{item.title}</Card.Title>
      </Card.Header>
      <Card.Footer className="flex-wrap justify-between gap-2 border-t border-separator pt-3 text-muted">
        <WorkItemAssignee assignee={item.assignee} />
        <WorkItemPriority priority={item.priority} />
      </Card.Footer>
    </Card>
  );
}
