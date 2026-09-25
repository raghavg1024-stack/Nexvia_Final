-- Persist student matching preference and make company ownership explicit.
alter table public.profiles
  add column if not exists open_to_recruiters boolean not null default false;

alter table public.companies
  add column if not exists created_by uuid references auth.users(id) on delete set null;

drop policy if exists companies_insert_recruiter on public.companies;
create policy companies_insert_recruiter on public.companies
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and user_type = 'recruiter'
  )
);

drop policy if exists companies_update_recruiter on public.companies;
create policy companies_update_recruiter on public.companies
for update to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.company_members
    where user_id = auth.uid() and company_id = companies.id
  )
)
with check (
  created_by = auth.uid()
  or exists (
    select 1 from public.company_members
    where user_id = auth.uid() and company_id = companies.id
  )
);

drop policy if exists company_members_select_all on public.company_members;
create policy company_members_select_own on public.company_members
for select to authenticated
using (user_id = auth.uid());

drop policy if exists company_members_insert_recruiter on public.company_members;
create policy company_members_insert_founder on public.company_members
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.companies
    where id = company_id and created_by = auth.uid()
  )
);

create index if not exists companies_created_by_idx
  on public.companies(created_by)
  where created_by is not null;
