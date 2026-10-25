import type { WorkItemState } from './types';

export const WORK_ITEM_STATE_LABELS: Record<WorkItemState, string> = {
  new: 'New',
  active: 'Active',
  blocked: 'Blocked',
  resolved: 'Resolved',
  closed: 'Closed',
};
