export const WORK_ITEM_STATE = ['new', 'active', 'resolved', 'closed'] as const;

export type WorkItemState = (typeof WORK_ITEM_STATE)[number];
export type WorkItemKind = 'bug' | 'story' | 'task';

export type WorkItemInsertion = {
  targetId: string;
  position: 'before' | 'after';
};

export type WorkItem = {
  id: string;
  title: string;
  kind: WorkItemKind;
  state: WorkItemState;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: { id: string; name: string } | null;
};
