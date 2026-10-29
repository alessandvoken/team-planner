-- NULL represents a Guest comment; identified authors still reference teammates.
alter table public.comments
  alter column author_id drop not null;
