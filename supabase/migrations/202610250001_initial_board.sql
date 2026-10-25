create table public.teammates (
  id text primary key,
  name text not null check (name !~ '^[[:space:]]*$' and char_length(name) <= 100)
);

create table public.work_items (
  id bigint generated always as identity primary key,
  title text not null check (title !~ '^[[:space:]]*$' and char_length(title) <= 200),
  kind text not null check (kind in ('bug', 'story', 'task')),
  state text not null default 'new' check (state in ('new', 'active', 'resolved', 'closed')),
  description text not null default '' check (char_length(description) <= 10000),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  assignee_id text references public.teammates (id) on delete set null,
  position integer not null check (position >= 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_state_position_key unique (state, position) deferrable
);

create index work_items_assignee_id_idx on public.work_items (assignee_id);

create table public.comments (
  id bigint generated always as identity primary key,
  work_item_id bigint not null references public.work_items (id) on delete cascade,
  author_id text not null references public.teammates (id),
  body text not null check (body !~ '^[[:space:]]*$' and char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index comments_work_item_created_at_idx on public.comments (work_item_id, created_at, id);
create index comments_author_id_idx on public.comments (author_id);

-- Access goes through Next.js SQL queries. Browser read policies enter with Realtime.
alter table public.teammates enable row level security;
alter table public.work_items enable row level security;
alter table public.comments enable row level security;

revoke all on table public.teammates, public.work_items, public.comments
  from public, anon, authenticated, service_role;
revoke all on sequence public.work_items_id_seq, public.comments_id_seq
  from public, anon, authenticated, service_role;
