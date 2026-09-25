-- Privacy-safe recruiter matching: students opt in and expose only matching fields.
create table if not exists public.candidate_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  cgpa numeric(3,2),
  current_percentage numeric(5,2),
  major text,
  skill_tags jsonb not null default '[]'::jsonb,
  open_to_recruiters boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;
drop policy if exists candidate_profiles_select_own_or_recruiter on public.candidate_profiles;
create policy candidate_profiles_select_own_or_recruiter on public.candidate_profiles
for select to authenticated
using (
  (select auth.uid()) = user_id
  or (open_to_recruiters and exists (
    select 1 from public.profiles recruiter
    where recruiter.id = (select auth.uid()) and recruiter.user_type = 'recruiter'
  ))
);
drop policy if exists candidate_profiles_insert_own on public.candidate_profiles;
create policy candidate_profiles_insert_own on public.candidate_profiles
for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists candidate_profiles_update_own on public.candidate_profiles;
create policy candidate_profiles_update_own on public.candidate_profiles
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists candidate_profiles_open_idx on public.candidate_profiles (open_to_recruiters) where open_to_recruiters = true;
