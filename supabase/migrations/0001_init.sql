-- Career OS — initial schema
-- Migration 0001: core tables, RLS, triggers, seed data.
-- Idempotent-ish: `create table if not exists`, guarded seeds, drop+create policies.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists "profiles" (
  "id" uuid primary key references auth.users (id) on delete cascade,
  "full_name" text,
  "email" text,
  "avatar_url" text,
  "education_level" text check ("education_level" in ('undergraduate', 'graduate', 'self_taught')),
  "study_hours_per_week" integer,
  "goals" text,
  "learning_style" text check ("learning_style" in ('visual', 'auditory', 'reading', 'kinesthetic')),
  "xp" integer not null default 0,
  "coins" integer not null default 0,
  "level" integer not null default 1,
  "current_streak_days" integer not null default 0,
  "longest_streak_days" integer not null default 0,
  "last_active_day" date,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
create table if not exists "assessments" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null unique references auth.users (id) on delete cascade,
  "status" text not null default 'not_started' check ("status" in ('not_started', 'in_progress', 'completed')),
  "current_question_index" integer not null default 0,
  "responses" jsonb not null default '[]'::jsonb,
  "started_at" timestamptz,
  "completed_at" timestamptz
);

-- ---------------------------------------------------------------------------
-- Analysis reports
-- ---------------------------------------------------------------------------
create table if not exists "analysis_reports" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "strengths" jsonb not null default '[]'::jsonb,
  "growth_areas" jsonb not null default '[]'::jsonb,
  "learning_style" text,
  "study_capacity_hours" integer,
  "recommended_pace" text,
  "summary" text,
  "created_at" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Careers (reference data)
-- ---------------------------------------------------------------------------
create table if not exists "careers" (
  "id" uuid primary key,
  "title" text not null,
  "description" text not null,
  "category" text not null,
  "required_skills" jsonb not null default '[]'::jsonb,
  "salary_range" text not null,
  "demand" text not null check ("demand" in ('low', 'medium', 'high', 'very_high')),
  "icon" text not null
);

-- ---------------------------------------------------------------------------
-- Career recommendations
-- ---------------------------------------------------------------------------
create table if not exists "career_recommendations" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "career_id" uuid not null references "careers" ("id"),
  "match_percentage" integer not null,
  "reasons" jsonb not null default '[]'::jsonb,
  "required_skills" jsonb not null default '[]'::jsonb,
  "existing_strengths" jsonb not null default '[]'::jsonb,
  "growth_opportunities" jsonb not null default '[]'::jsonb,
  "is_selected" boolean not null default false,
  "created_at" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roadmaps / milestones / courses
-- ---------------------------------------------------------------------------
create table if not exists "roadmaps" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "career_id" uuid not null references "careers" ("id"),
  "career_title" text not null,
  "status" text not null default 'active' check ("status" in ('draft', 'active', 'completed', 'paused')),
  "created_at" timestamptz not null default now()
);

create table if not exists "milestones" (
  "id" uuid primary key default gen_random_uuid(),
  "roadmap_id" uuid not null references "roadmaps" ("id") on delete cascade,
  "title" text not null,
  "description" text,
  "order_index" integer not null default 0,
  "status" text not null default 'locked' check ("status" in ('locked', 'in_progress', 'completed'))
);

create table if not exists "courses" (
  "id" uuid primary key default gen_random_uuid(),
  "milestone_id" uuid not null references "milestones" ("id") on delete cascade,
  "title" text not null,
  "description" text,
  "duration_weeks" integer not null default 0,
  "status" text not null default 'pending' check ("status" in ('pending', 'in_progress', 'completed'))
);

-- ---------------------------------------------------------------------------
-- XP transactions
-- ---------------------------------------------------------------------------
create table if not exists "xp_transactions" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "amount" integer not null,
  "reason" text not null,
  "created_at" timestamptz not null default now()
);

create index if not exists "xp_transactions_user_id_idx" on "xp_transactions" ("user_id");

-- ---------------------------------------------------------------------------
-- Badges (reference data) and user_badges
-- ---------------------------------------------------------------------------
create table if not exists "badges" (
  "id" uuid primary key,
  "key" text not null unique,
  "name" text not null,
  "description" text not null,
  "icon" text not null,
  "xp_required" integer,
  "criteria" text
);

create table if not exists "user_badges" (
  "user_id" uuid not null references auth.users (id) on delete cascade,
  "badge_key" text not null references "badges" ("key") on delete cascade,
  "earned_at" timestamptz not null default now(),
  primary key ("user_id", "badge_key")
);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function "public"."set_updated_at" ()
returns trigger
language plpgsql
as $$
begin
  new."updated_at" = now();
  return new;
end;
$$;

drop trigger if exists "profiles_set_updated_at" on "profiles";
create trigger "profiles_set_updated_at"
  before update on "profiles"
  for each row
  execute function "public"."set_updated_at" ();

-- ---------------------------------------------------------------------------
-- Auth trigger: auto-create a profile row on signup
-- ---------------------------------------------------------------------------
create or replace function "public"."handle_new_user" ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into "profiles" ("id", "email", "full_name")
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists "on_auth_user_created" on auth.users;
create trigger "on_auth_user_created"
  after insert on auth.users
  for each row
  execute function "public"."handle_new_user" ();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table "profiles" enable row level security;
alter table "assessments" enable row level security;
alter table "analysis_reports" enable row level security;
alter table "careers" enable row level security;
alter table "career_recommendations" enable row level security;
alter table "roadmaps" enable row level security;
alter table "milestones" enable row level security;
alter table "courses" enable row level security;
alter table "xp_transactions" enable row level security;
alter table "badges" enable row level security;
alter table "user_badges" enable row level security;

-- profiles: own-row CRUD (id = auth.uid())
drop policy if exists "profiles_select_own" on "profiles";
create policy "profiles_select_own" on "profiles"
  for select using (auth.uid () = "id");

drop policy if exists "profiles_insert_own" on "profiles";
create policy "profiles_insert_own" on "profiles"
  for insert with check (auth.uid () = "id");

drop policy if exists "profiles_update_own" on "profiles";
create policy "profiles_update_own" on "profiles"
  for update using (auth.uid () = "id") with check (auth.uid () = "id");

drop policy if exists "profiles_delete_own" on "profiles";
create policy "profiles_delete_own" on "profiles"
  for delete using (auth.uid () = "id");

-- careers: readable by all authenticated, not writable
drop policy if exists "careers_select_all" on "careers";
create policy "careers_select_all" on "careers"
  for select to authenticated using (true);

-- badges: readable by all authenticated, not writable
drop policy if exists "badges_select_all" on "badges";
create policy "badges_select_all" on "badges"
  for select to authenticated using (true);

-- assessments: own-row CRUD (user_id = auth.uid())
drop policy if exists "assessments_select_own" on "assessments";
create policy "assessments_select_own" on "assessments"
  for select using (auth.uid () = "user_id");

drop policy if exists "assessments_insert_own" on "assessments";
create policy "assessments_insert_own" on "assessments"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "assessments_update_own" on "assessments";
create policy "assessments_update_own" on "assessments"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "assessments_delete_own" on "assessments";
create policy "assessments_delete_own" on "assessments"
  for delete using (auth.uid () = "user_id");

-- analysis_reports: own-row CRUD
drop policy if exists "analysis_reports_select_own" on "analysis_reports";
create policy "analysis_reports_select_own" on "analysis_reports"
  for select using (auth.uid () = "user_id");

drop policy if exists "analysis_reports_insert_own" on "analysis_reports";
create policy "analysis_reports_insert_own" on "analysis_reports"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "analysis_reports_update_own" on "analysis_reports";
create policy "analysis_reports_update_own" on "analysis_reports"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "analysis_reports_delete_own" on "analysis_reports";
create policy "analysis_reports_delete_own" on "analysis_reports"
  for delete using (auth.uid () = "user_id");

-- career_recommendations: own-row CRUD
drop policy if exists "career_recommendations_select_own" on "career_recommendations";
create policy "career_recommendations_select_own" on "career_recommendations"
  for select using (auth.uid () = "user_id");

drop policy if exists "career_recommendations_insert_own" on "career_recommendations";
create policy "career_recommendations_insert_own" on "career_recommendations"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "career_recommendations_update_own" on "career_recommendations";
create policy "career_recommendations_update_own" on "career_recommendations"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "career_recommendations_delete_own" on "career_recommendations";
create policy "career_recommendations_delete_own" on "career_recommendations"
  for delete using (auth.uid () = "user_id");

-- roadmaps: own-row CRUD
drop policy if exists "roadmaps_select_own" on "roadmaps";
create policy "roadmaps_select_own" on "roadmaps"
  for select using (auth.uid () = "user_id");

drop policy if exists "roadmaps_insert_own" on "roadmaps";
create policy "roadmaps_insert_own" on "roadmaps"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "roadmaps_update_own" on "roadmaps";
create policy "roadmaps_update_own" on "roadmaps"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "roadmaps_delete_own" on "roadmaps";
create policy "roadmaps_delete_own" on "roadmaps"
  for delete using (auth.uid () = "user_id");

-- xp_transactions: own-row CRUD
drop policy if exists "xp_transactions_select_own" on "xp_transactions";
create policy "xp_transactions_select_own" on "xp_transactions"
  for select using (auth.uid () = "user_id");

drop policy if exists "xp_transactions_insert_own" on "xp_transactions";
create policy "xp_transactions_insert_own" on "xp_transactions"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "xp_transactions_update_own" on "xp_transactions";
create policy "xp_transactions_update_own" on "xp_transactions"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "xp_transactions_delete_own" on "xp_transactions";
create policy "xp_transactions_delete_own" on "xp_transactions"
  for delete using (auth.uid () = "user_id");

-- user_badges: own-row CRUD
drop policy if exists "user_badges_select_own" on "user_badges";
create policy "user_badges_select_own" on "user_badges"
  for select using (auth.uid () = "user_id");

drop policy if exists "user_badges_insert_own" on "user_badges";
create policy "user_badges_insert_own" on "user_badges"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "user_badges_update_own" on "user_badges";
create policy "user_badges_update_own" on "user_badges"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "user_badges_delete_own" on "user_badges";
create policy "user_badges_delete_own" on "user_badges"
  for delete using (auth.uid () = "user_id");

-- milestones: owner is the owner of the parent roadmap
drop policy if exists "milestones_select_own" on "milestones";
create policy "milestones_select_own" on "milestones"
  for select using (
    exists (select 1 from "roadmaps" r where r."id" = "milestones"."roadmap_id" and r."user_id" = auth.uid ())
  );

drop policy if exists "milestones_insert_own" on "milestones";
create policy "milestones_insert_own" on "milestones"
  for insert with check (
    exists (select 1 from "roadmaps" r where r."id" = "milestones"."roadmap_id" and r."user_id" = auth.uid ())
  );

drop policy if exists "milestones_update_own" on "milestones";
create policy "milestones_update_own" on "milestones"
  for update using (
    exists (select 1 from "roadmaps" r where r."id" = "milestones"."roadmap_id" and r."user_id" = auth.uid ())
  ) with check (
    exists (select 1 from "roadmaps" r where r."id" = "milestones"."roadmap_id" and r."user_id" = auth.uid ())
  );

drop policy if exists "milestones_delete_own" on "milestones";
create policy "milestones_delete_own" on "milestones"
  for delete using (
    exists (select 1 from "roadmaps" r where r."id" = "milestones"."roadmap_id" and r."user_id" = auth.uid ())
  );

-- courses: owner is the owner of the parent milestone's roadmap
drop policy if exists "courses_select_own" on "courses";
create policy "courses_select_own" on "courses"
  for select using (
    exists (
      select 1 from "roadmaps" r
      join "milestones" m on m."roadmap_id" = r."id"
      where m."id" = "courses"."milestone_id" and r."user_id" = auth.uid ()
    )
  );

drop policy if exists "courses_insert_own" on "courses";
create policy "courses_insert_own" on "courses"
  for insert with check (
    exists (
      select 1 from "roadmaps" r
      join "milestones" m on m."roadmap_id" = r."id"
      where m."id" = "courses"."milestone_id" and r."user_id" = auth.uid ()
    )
  );

drop policy if exists "courses_update_own" on "courses";
create policy "courses_update_own" on "courses"
  for update using (
    exists (
      select 1 from "roadmaps" r
      join "milestones" m on m."roadmap_id" = r."id"
      where m."id" = "courses"."milestone_id" and r."user_id" = auth.uid ()
    )
  ) with check (
    exists (
      select 1 from "roadmaps" r
      join "milestones" m on m."roadmap_id" = r."id"
      where m."id" = "courses"."milestone_id" and r."user_id" = auth.uid ()
    )
  );

drop policy if exists "courses_delete_own" on "courses";
create policy "courses_delete_own" on "courses"
  for delete using (
    exists (
      select 1 from "roadmaps" r
      join "milestones" m on m."roadmap_id" = r."id"
      where m."id" = "courses"."milestone_id" and r."user_id" = auth.uid ()
    )
  );

-- ---------------------------------------------------------------------------
-- Seed data: careers (exact UUIDs from src/lib/data.ts)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000001') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000001', 'Software Engineer', 'Design, build, and maintain software products from web apps to mobile apps.', 'Technology', '["Programming", "Problem solving", "Data analysis"]'::jsonb, '$70k - $150k', 'very_high', '💻');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000002') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000002', 'Data Scientist', 'Analyze data to find patterns and help organizations make better decisions.', 'Technology', '["Data analysis", "Programming", "Problem solving"]'::jsonb, '$80k - $160k', 'very_high', '📊');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000003') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000003', 'UX/UI Designer', 'Design intuitive, beautiful, and accessible user experiences and interfaces.', 'Design', '["Design", "Problem solving", "Teamwork"]'::jsonb, '$60k - $130k', 'high', '🎨');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000004') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000004', 'Product Manager', 'Define the vision for a product and guide a team to ship it successfully.', 'Business', '["Teamwork", "Research", "Writing", "Public speaking"]'::jsonb, '$80k - $160k', 'high', '📦');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000005') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000005', 'Data Analyst', 'Turn raw data into clear insights that guide everyday business decisions.', 'Technology', '["Data analysis", "Research", "Problem solving"]'::jsonb, '$55k - $110k', 'very_high', '🔍');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000006') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000006', 'Technical Writer', 'Create clear documentation, tutorials, and content that make tech easy to understand.', 'Communication', '["Writing", "Research", "Public speaking"]'::jsonb, '$50k - $100k', 'medium', '✍️');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000007') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000007', 'Cybersecurity Analyst', 'Protect organizations from cyber threats and keep systems and data safe.', 'Technology', '["Problem solving", "Programming", "Data analysis"]'::jsonb, '$70k - $140k', 'very_high', '🛡️');
  end if;

  if not exists (select 1 from "careers" where "id" = '00000000-0000-0000-0000-000000000008') then
    insert into "careers" ("id", "title", "description", "category", "required_skills", "salary_range", "demand", "icon")
    values ('00000000-0000-0000-0000-000000000008', 'Entrepreneur / Startup Founder', 'Spot problems, build products, and lead a team to bring an idea to life.', 'Business', '["Public speaking", "Teamwork", "Research", "Writing"]'::jsonb, 'Variable', 'medium', '🚀');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Seed data: badges (exact UUIDs/keys from src/lib/data.ts)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000101') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000101', 'onboarded', 'Welcome Aboard', 'Complete your profile setup', '👋', 10, null);
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000102') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000102', 'assessment_complete', 'Self-Discoverer', 'Complete the AI career assessment', '🧭', 50, null);
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000103') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000103', 'career_chosen', 'Direction Set', 'Choose your career path', '🎯', 20, null);
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000104') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000104', 'streak_3', 'On Fire', 'Reach a 3-day learning streak', '🔥', null, 'streak_days >= 3');
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000105') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000105', 'streak_7', 'Week Warrior', 'Reach a 7-day learning streak', '⚡', null, 'streak_days >= 7');
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000106') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000106', 'milestone_done', 'Milestone Maker', 'Complete your first roadmap milestone', '🏁', 200, null);
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000107') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000107', 'level_5', 'Rising Star', 'Reach level 5', '🌟', 500, null);
  end if;

  if not exists (select 1 from "badges" where "id" = '00000000-0000-0000-0000-000000000108') then
    insert into "badges" ("id", "key", "name", "description", "icon", "xp_required", "criteria")
    values ('00000000-0000-0000-0000-000000000108', 'roadmap_done', 'Career Graduate', 'Complete your entire roadmap', '🎓', 1000, null);
  end if;
end $$;
