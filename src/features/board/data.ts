import type { WorkItem } from './types';

export const WORK_ITEMS: WorkItem[] = [
  {
    id: '1',
    title: 'Add sprint date filters',
    kind: 'story',
    state: 'new',
    description:
      'Let the Fjord Systems team filter sprints by start and end date. Keep the selected dates visible so people can see which period they are reviewing.',
    priority: 'Medium',
    assignee: null,
  },
  {
    id: '2',
    title: 'Show assignees on work items',
    kind: 'story',
    state: 'active',
    description:
      'Show who owns each work item on the sprint board and in its details. Display Unassigned when nobody has taken ownership.',
    priority: 'High',
    assignee: { id: 'nora', name: 'Nora Lind' },
  },
  {
    id: '3',
    title: 'Fix empty backlog message',
    kind: 'bug',
    state: 'resolved',
    description:
      'The backlog currently shows a blank area when no work items match the filters. Explain that there are no matching items and keep the filters available.',
    priority: 'Medium',
    assignee: { id: 'emil', name: 'Emil Berg' },
  },
  {
    id: '4',
    title: 'Add sprint summary heading',
    kind: 'task',
    state: 'active',
    description:
      'Add the current sprint name and date range above the board so the team can tell which sprint they are planning without opening another view.',
    priority: 'Low',
    assignee: { id: 'emil', name: 'Emil Berg' },
  },
];
