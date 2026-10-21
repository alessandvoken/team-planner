export const WORK_ITEM_STATE = ['new', 'active', 'resolved', 'closed'] as const;

export type WorkItemState = (typeof WORK_ITEM_STATE)[number];

export type WorkItem = {
  id: string;
  title: string;
  state: WorkItemState;
};
