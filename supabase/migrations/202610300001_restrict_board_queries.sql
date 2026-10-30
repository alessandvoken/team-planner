-- One public demo board: only the server-side execution role may read/move cards
-- and append Guest comments. Browser/Data API roles keep their existing revocations.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'team_planner_app') then
    create role team_planner_app nologin nosuperuser nocreatedb nocreaterole nobypassrls;
  end if;
end
$$;
grant team_planner_app to postgres;
grant usage on schema public to team_planner_app;
grant select on public.teammates, public.work_items, public.comments to team_planner_app;
grant update (state, position, version, updated_at) on public.work_items to team_planner_app;
grant insert (work_item_id, author_id, body) on public.comments to team_planner_app;
grant usage on sequence public.comments_id_seq to team_planner_app;

create policy board_read_teammates on public.teammates
  for select to team_planner_app using (true);
create policy board_read_items on public.work_items
  for select to team_planner_app using (true);
create policy board_move_items on public.work_items
  for update to team_planner_app using (true) with check (true);
create policy board_read_comments on public.comments
  for select to team_planner_app using (true);
create policy board_add_guest_comments on public.comments
  for insert to team_planner_app with check (author_id is null);
