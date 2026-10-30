export const WORK_ITEM_STATE = [
  'new',
  'active',
  'blocked',
  'resolved',
  'closed',
] as const;

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
  version: number;
};

export type WorkItemComment = {
  id: string;
  author: { id: string; name: string };
  body: string;
  createdAt: string;
};

export type BoardData = {
  items: WorkItem[];
  commentsByItemId: Record<string, WorkItemComment[]>;
};
