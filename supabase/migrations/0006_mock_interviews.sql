-- Mock interviews table for AI mock interview feature
create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('behavioral', 'technical', 'situational', 'career_specific')),
  career_title text,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  current_index integer not null default 0,
  is_complete boolean not null default false,
  overall_score integer not null default 0,
  summary text not null default '',
  xp_earned integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists mock_interviews_user_idx
  on public.mock_interviews (user_id, created_at desc);

-- RLS policies
alter table public.mock_interviews enable row level security;

revoke all on table public.mock_interviews from anon;
grant select, insert, update on table public.mock_interviews to authenticated;

-- Users can read their own interviews
create policy "Users read own interviews"
  on public.mock_interviews for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Users can insert their own interviews
create policy "Users insert own interviews"
  on public.mock_interviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Users can update their own interviews
create policy "Users update own interviews"
  on public.mock_interviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Trigger for updated_at
create or replace function public.update_mock_interviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = '';

create trigger mock_interviews_updated_at
  before update on public.mock_interviews
  for each row execute function public.update_mock_interviews_updated_at();
