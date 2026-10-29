alter table public.work_items
  drop constraint work_items_state_check,
  add constraint work_items_state_check
    check (state in ('new', 'active', 'blocked', 'resolved', 'closed'));
