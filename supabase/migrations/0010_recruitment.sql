-- Career OS — Sprint 3 recruitment and scholarships
-- Migration 0010: companies, jobs, scholarships, applications, profile updates

-- 1. Alter profiles
alter table "profiles" add column if not exists "user_type" text not null default 'student' check ("user_type" in ('student', 'recruiter'));
alter table "profiles" add column if not exists "cgpa" numeric(3,2);
alter table "profiles" add column if not exists "major" text;
alter table "profiles" add column if not exists "graduation_year" integer;

-- 2. Companies
create table if not exists "companies" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text,
  "website" text,
  "logo_url" text,
  "created_at" timestamptz not null default now()
);

alter table "companies" enable row level security;
drop policy if exists "companies_select_all" on "companies";
create policy "companies_select_all" on "companies" for select to authenticated using (true);

drop policy if exists "companies_insert_recruiter" on "companies";
create policy "companies_insert_recruiter" on "companies" for insert to authenticated with check (
  exists (select 1 from profiles where id = auth.uid() and user_type = 'recruiter')
);

drop policy if exists "companies_update_recruiter" on "companies";
create policy "companies_update_recruiter" on "companies" for update to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and user_type = 'recruiter')
);

-- 3. Company Members (linking recruiters to companies)
create table if not exists "company_members" (
  "company_id" uuid not null references "companies" ("id") on delete cascade,
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "joined_at" timestamptz not null default now(),
  primary key ("company_id", "user_id")
);

alter table "company_members" enable row level security;
drop policy if exists "company_members_select_all" on "company_members";
create policy "company_members_select_all" on "company_members" for select to authenticated using (true);

drop policy if exists "company_members_insert_recruiter" on "company_members";
create policy "company_members_insert_recruiter" on "company_members" for insert to authenticated with check (
  exists (select 1 from profiles where id = auth.uid() and user_type = 'recruiter')
);

-- 4. Jobs / Internships
create table if not exists "jobs" (
  "id" uuid primary key default gen_random_uuid(),
  "company_id" uuid not null references "companies" ("id") on delete cascade,
  "title" text not null,
  "role_type" text not null check ("role_type" in ('internship', 'full_time', 'part_time')),
  "description" text not null,
  "required_skills" jsonb not null default '[]'::jsonb,
  "min_cgpa" numeric(3,2),
  "status" text not null default 'open' check ("status" in ('open', 'closed')),
  "created_at" timestamptz not null default now()
);

alter table "jobs" enable row level security;
drop policy if exists "jobs_select_all" on "jobs";
create policy "jobs_select_all" on "jobs" for select to authenticated using (true);

drop policy if exists "jobs_insert_recruiter" on "jobs";
create policy "jobs_insert_recruiter" on "jobs" for insert to authenticated with check (
  exists (select 1 from company_members where user_id = auth.uid() and company_id = jobs.company_id)
);

drop policy if exists "jobs_update_recruiter" on "jobs";
create policy "jobs_update_recruiter" on "jobs" for update to authenticated using (
  exists (select 1 from company_members where user_id = auth.uid() and company_id = jobs.company_id)
);

-- 5. Scholarships
create table if not exists "scholarships" (
  "id" uuid primary key default gen_random_uuid(),
  "provider_name" text not null,
  "title" text not null,
  "description" text not null,
  "min_cgpa" numeric(3,2),
  "amount" text not null,
  "deadline" date,
  "created_at" timestamptz not null default now()
);

alter table "scholarships" enable row level security;
drop policy if exists "scholarships_select_all" on "scholarships";
create policy "scholarships_select_all" on "scholarships" for select to authenticated using (true);

drop policy if exists "scholarships_insert_recruiter" on "scholarships";
create policy "scholarships_insert_recruiter" on "scholarships" for insert to authenticated with check (
  exists (select 1 from profiles where id = auth.uid() and user_type = 'recruiter')
);

-- 6. Job Applications
create table if not exists "job_applications" (
  "id" uuid primary key default gen_random_uuid(),
  "job_id" uuid not null references "jobs" ("id") on delete cascade,
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "match_score" integer,
  "status" text not null default 'pending' check ("status" in ('pending', 'reviewed', 'accepted', 'rejected')),
  "applied_at" timestamptz not null default now(),
  unique("job_id", "user_id")
);

alter table "job_applications" enable row level security;
drop policy if exists "job_applications_select_own" on "job_applications";
create policy "job_applications_select_own" on "job_applications" for select using (
  auth.uid() = user_id or 
  exists (
    select 1 from jobs j 
    join company_members cm on cm.company_id = j.company_id 
    where j.id = job_applications.job_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "job_applications_insert_own" on "job_applications";
create policy "job_applications_insert_own" on "job_applications" for insert with check (auth.uid() = user_id);

drop policy if exists "job_applications_update_recruiter" on "job_applications";
create policy "job_applications_update_recruiter" on "job_applications" for update using (
  exists (
    select 1 from jobs j 
    join company_members cm on cm.company_id = j.company_id 
    where j.id = job_applications.job_id and cm.user_id = auth.uid()
  )
);
