alter table public.parent_alerts
  add column if not exists attempt_count integer not null default 1
  check (attempt_count between 1 and 3);
