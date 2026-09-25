-- Career OS — Sprint 2 feature tables
-- Migration 0003: certificates, mentor_messages, study_groups (+ members/messages),
-- career_readiness, plus row level security.
-- Idempotent: `create table if not exists`, `drop policy if exists` before create,
-- guarded `do $$` block for the updated_at trigger. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Certificates
-- ---------------------------------------------------------------------------
create table if not exists "certificates" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id),
  "roadmap_id" uuid not null references "roadmaps" ("id") on delete cascade,
  "title" text not null,
  "credential_id" text not null unique,
  "issued_at" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Mentor messages
-- ---------------------------------------------------------------------------
create table if not exists "mentor_messages" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references auth.users (id),
  "role" text not null check ("role" in ('user', 'assistant')),
  "content" text not null,
  "created_at" timestamptz not null default now()
);

create index if not exists "mentor_messages_user_created_idx"
  on "mentor_messages" ("user_id", "created_at");

-- ---------------------------------------------------------------------------
-- Study groups
-- ---------------------------------------------------------------------------
create table if not exists "study_groups" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text,
  "owner_id" uuid not null references auth.users (id),
  "created_at" timestamptz not null default now()
);

create table if not exists "study_group_members" (
  "group_id" uuid not null references "study_groups" ("id") on delete cascade,
  "user_id" uuid not null references auth.users (id),
  "joined_at" timestamptz not null default now(),
  primary key ("group_id", "user_id")
);

create table if not exists "study_group_messages" (
  "id" uuid primary key default gen_random_uuid(),
  "group_id" uuid not null references "study_groups" ("id") on delete cascade,
  "user_id" uuid not null references auth.users (id),
  "content" text not null,
  "created_at" timestamptz not null default now()
);

-- denormalized author display name (community agent joins profiles with own-row
-- RLS, so fall back to this when the join is filtered out). Guarded for re-run safety.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'study_group_messages'
      and column_name = 'user_name'
  ) then
    alter table "study_group_messages" add column "user_name" text;
  end if;
end;
$$;

create index if not exists "study_group_messages_group_created_idx"
  on "study_group_messages" ("group_id", "created_at");

-- ---------------------------------------------------------------------------
-- Career readiness
-- ---------------------------------------------------------------------------
create table if not exists "career_readiness" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null unique references auth.users (id),
  "technical_skills" integer not null default 0,
  "communication" integer not null default 0,
  "projects" integer not null default 0,
  "resume_quality" integer not null default 0,
  "interview_readiness" integer not null default 0,
  "overall" integer not null default 0,
  "suggestions" jsonb not null default '[]'::jsonb,
  "updated_at" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger on career_readiness (reuses set_updated_at from 0001)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regprocedure ('public.set_updated_at ()') is not null then
    drop trigger if exists "career_readiness_set_updated_at" on "career_readiness";
    create trigger "career_readiness_set_updated_at"
      before update on "career_readiness"
      for each row
      execute function "public"."set_updated_at" ();
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table "certificates" enable row level security;
alter table "mentor_messages" enable row level security;
alter table "study_groups" enable row level security;
alter table "study_group_members" enable row level security;
alter table "study_group_messages" enable row level security;
alter table "career_readiness" enable row level security;

-- certificates: own-row CRUD (user_id = auth.uid())
drop policy if exists "certificates_select_own" on "certificates";
create policy "certificates_select_own" on "certificates"
  for select using (auth.uid () = "user_id");

drop policy if exists "certificates_insert_own" on "certificates";
create policy "certificates_insert_own" on "certificates"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "certificates_update_own" on "certificates";
create policy "certificates_update_own" on "certificates"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "certificates_delete_own" on "certificates";
create policy "certificates_delete_own" on "certificates"
  for delete using (auth.uid () = "user_id");

-- mentor_messages: own-row CRUD
drop policy if exists "mentor_messages_select_own" on "mentor_messages";
create policy "mentor_messages_select_own" on "mentor_messages"
  for select using (auth.uid () = "user_id");

drop policy if exists "mentor_messages_insert_own" on "mentor_messages";
create policy "mentor_messages_insert_own" on "mentor_messages"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "mentor_messages_update_own" on "mentor_messages";
create policy "mentor_messages_update_own" on "mentor_messages"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "mentor_messages_delete_own" on "mentor_messages";
create policy "mentor_messages_delete_own" on "mentor_messages"
  for delete using (auth.uid () = "user_id");

-- study_groups: all authenticated can see; owner manages/deletes
drop policy if exists "study_groups_select_all" on "study_groups";
create policy "study_groups_select_all" on "study_groups"
  for select to authenticated using (true);

drop policy if exists "study_groups_insert_owner" on "study_groups";
create policy "study_groups_insert_owner" on "study_groups"
  for insert to authenticated with check (auth.uid () = "owner_id");

drop policy if exists "study_groups_update_owner" on "study_groups";
create policy "study_groups_update_owner" on "study_groups"
  for update to authenticated using (auth.uid () = "owner_id") with check (auth.uid () = "owner_id");

drop policy if exists "study_groups_delete_owner" on "study_groups";
create policy "study_groups_delete_owner" on "study_groups"
  for delete to authenticated using (auth.uid () = "owner_id");

-- study_group_members: all authenticated can see; authenticated can join (self);
-- delete own row or as group owner
drop policy if exists "study_group_members_select_all" on "study_group_members";
create policy "study_group_members_select_all" on "study_group_members"
  for select to authenticated using (true);

drop policy if exists "study_group_members_insert_join" on "study_group_members";
create policy "study_group_members_insert_join" on "study_group_members"
  for insert to authenticated with check (auth.uid () = "user_id");

drop policy if exists "study_group_members_delete_own" on "study_group_members";
create policy "study_group_members_delete_own" on "study_group_members"
  for delete to authenticated using (
    "user_id" = auth.uid ()
    or exists (
      select 1 from "study_groups" g
      where g."id" = "study_group_members"."group_id" and g."owner_id" = auth.uid ()
    )
  );

-- study_group_messages: visible/writable to members; delete own or as group owner
drop policy if exists "study_group_messages_select_member" on "study_group_messages";
create policy "study_group_messages_select_member" on "study_group_messages"
  for select to authenticated using (
    exists (
      select 1 from "study_group_members" m
      where m."group_id" = "study_group_messages"."group_id" and m."user_id" = auth.uid ()
    )
  );

drop policy if exists "study_group_messages_insert_member" on "study_group_messages";
create policy "study_group_messages_insert_member" on "study_group_messages"
  for insert to authenticated with check (
    auth.uid () = "user_id"
    and exists (
      select 1 from "study_group_members" m
      where m."group_id" = "study_group_messages"."group_id" and m."user_id" = auth.uid ()
    )
  );

drop policy if exists "study_group_messages_delete_own" on "study_group_messages";
create policy "study_group_messages_delete_own" on "study_group_messages"
  for delete to authenticated using (
    "user_id" = auth.uid ()
    or exists (
      select 1 from "study_groups" g
      where g."id" = "study_group_messages"."group_id" and g."owner_id" = auth.uid ()
    )
  );

-- career_readiness: own-row CRUD
drop policy if exists "career_readiness_select_own" on "career_readiness";
create policy "career_readiness_select_own" on "career_readiness"
  for select using (auth.uid () = "user_id");

drop policy if exists "career_readiness_insert_own" on "career_readiness";
create policy "career_readiness_insert_own" on "career_readiness"
  for insert with check (auth.uid () = "user_id");

drop policy if exists "career_readiness_update_own" on "career_readiness";
create policy "career_readiness_update_own" on "career_readiness"
  for update using (auth.uid () = "user_id") with check (auth.uid () = "user_id");

drop policy if exists "career_readiness_delete_own" on "career_readiness";
create policy "career_readiness_delete_own" on "career_readiness"
  for delete using (auth.uid () = "user_id");