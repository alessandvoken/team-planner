insert into public.teammates (id, name) values
  ('nora', 'Nora Lind'),
  ('emil', 'Emil Berg'),
  ('alessandro', 'Alessandro Perchiazzi');

insert into public.work_items
  (id, title, kind, state, description, priority, assignee_id, position)
overriding system value
values
  (
    1, 'Add sprint date filters', 'story', 'new',
    'Let the Fjord Systems team filter sprints by start and end date. Keep the selected dates visible so people can see which period they are reviewing.',
    'Medium', null, 0
  ),
  (
    2, 'Show assignees on work items', 'story', 'active',
    'Show who owns each work item on the sprint board and in its details. Display Unassigned when nobody has taken ownership.',
    'High', 'nora', 0
  ),
  (
    3, 'Fix empty backlog message', 'bug', 'resolved',
    'The backlog currently shows a blank area when no work items match the filters. Explain that there are no matching items and keep the filters available.',
    'Medium', 'emil', 0
  ),
  (
    4, 'Add sprint summary heading', 'task', 'active',
    'Add the current sprint name and date range above the board so the team can tell which sprint they are planning without opening another view.',
    'Low', 'emil', 1
  ),
  (
    5, 'Keep comments when moving work items', 'bug', 'new',
    'Preserve comments and unfinished drafts when a work item moves between columns so the Fjord Systems team does not lose context during planning.',
    'High', 'alessandro', 1
  ),
  (
    6, 'Announce keyboard moves on the sprint board', 'task', 'resolved',
    'Announce the destination column and position after a keyboard move so teammates using a screen reader can follow changes to the sprint board.',
    'High', 'nora', 1
  ),
  (
    7, 'Add priority labels to board cards', 'story', 'closed',
    'Show a visible priority label on each work item so the team can identify urgent work without opening its details. Keep the label readable in both themes.',
    'Medium', 'alessandro', 0
  ),
  (
    8, 'Fix overflowing work item titles on mobile', 'bug', 'closed',
    'Wrap long work item titles within the card on narrow screens while keeping the title action and assignee information accessible.',
    'Low', 'emil', 1
  );

select setval(pg_get_serial_sequence('public.work_items', 'id'), (select max(id) from public.work_items), true);
