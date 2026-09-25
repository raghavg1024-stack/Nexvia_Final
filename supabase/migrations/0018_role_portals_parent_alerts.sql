alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('student', 'recruiter', 'academia', 'parent'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'student');
  safe_type text;
begin
  safe_type := case requested_type
    when 'recruiter' then 'recruiter'
    when 'academia' then 'academia'
    when 'parent' then 'parent'
    else 'student'
  end;

  insert into public.profiles (id, email, full_name, user_type)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', safe_type)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

create or replace function private.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.user_type is distinct from new.user_type and (select auth.uid()) is not null then
    raise exception 'Account type cannot be changed from the profile editor';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_user_type on public.profiles;
create trigger profiles_protect_user_type
  before update of user_type on public.profiles
  for each row execute function private.prevent_profile_role_change();

alter table public.courses
  add column if not exists started_at timestamptz,
  add column if not exists due_at timestamptz,
  add column if not exists completed_at timestamptz;

create index if not exists courses_overdue_active_idx
  on public.courses (due_at)
  where status = 'in_progress' and due_at is not null;

alter table public.parent_invites
  add column if not exists allow_overdue_calls boolean not null default false;

alter table public.parent_links
  add column if not exists student_call_consent_at timestamptz,
  add column if not exists parent_call_consent_at timestamptz,
  add column if not exists parent_phone text,
  add column if not exists overdue_call_enabled boolean not null default false,
  add column if not exists notification_timezone text not null default 'Asia/Kolkata';

alter table public.parent_links
  drop constraint if exists parent_links_phone_check;
alter table public.parent_links
  add constraint parent_links_phone_check
  check (parent_phone is null or parent_phone ~ '^\+[1-9][0-9]{7,14}$');

grant update (parent_phone, parent_call_consent_at, overdue_call_enabled, notification_timezone)
  on table public.parent_links to authenticated;

drop policy if exists parent_links_update_parent_preferences on public.parent_links;
create policy parent_links_update_parent_preferences
  on public.parent_links for update
  to authenticated
  using ((select auth.uid()) = parent_user_id and status = 'active')
  with check ((select auth.uid()) = parent_user_id and status = 'active');

create table if not exists public.parent_alerts (
  id uuid primary key default gen_random_uuid(),
  parent_link_id uuid not null references public.parent_links(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  alert_kind text not null default 'overdue_course' check (alert_kind in ('overdue_course')),
  status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
  message text,
  provider_call_id text,
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  unique (parent_link_id, course_id, alert_kind)
);

create index if not exists parent_alerts_student_attempted_idx
  on public.parent_alerts (student_user_id, attempted_at desc);
create index if not exists parent_alerts_link_attempted_idx
  on public.parent_alerts (parent_link_id, attempted_at desc);

alter table public.parent_alerts enable row level security;
revoke all on table public.parent_alerts from anon, authenticated;
grant select on table public.parent_alerts to authenticated;

drop policy if exists parent_alerts_select_participant on public.parent_alerts;
create policy parent_alerts_select_participant
  on public.parent_alerts for select
  to authenticated
  using (
    student_user_id = (select auth.uid())
    or parent_link_id in (
      select link.id
      from public.parent_links link
      where link.parent_user_id = (select auth.uid())
    )
  );

create or replace function public.redeem_parent_invite(
  invite_code text,
  relationship_name text default 'Parent'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  invite_row public.parent_invites%rowtype;
  link_row public.parent_links%rowtype;
  clean_relationship text := left(trim(coalesce(relationship_name, 'Parent')), 40);
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if char_length(clean_relationship) < 2 then
    clean_relationship := 'Parent';
  end if;

  select * into invite_row
  from public.parent_invites
  where code_digest = encode(extensions.digest(upper(trim(invite_code)), 'sha256'), 'hex')
    and used_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'That access code is invalid or has expired';
  end if;
  if invite_row.student_user_id = caller_id then
    raise exception 'You cannot link your own account as a parent';
  end if;

  insert into public.parent_links (
    parent_user_id, student_user_id, relationship, status, student_call_consent_at
  ) values (
    caller_id,
    invite_row.student_user_id,
    clean_relationship,
    'active',
    case when invite_row.allow_overdue_calls then now() else null end
  )
  on conflict (parent_user_id, student_user_id)
  do update set
    relationship = excluded.relationship,
    status = 'active',
    student_call_consent_at = excluded.student_call_consent_at,
    updated_at = now()
  returning * into link_row;

  update public.parent_invites set used_at = now() where id = invite_row.id;

  return jsonb_build_object(
    'link_id', link_row.id,
    'student_user_id', link_row.student_user_id,
    'status', link_row.status,
    'student_call_consent', link_row.student_call_consent_at is not null
  );
end;
$$;

revoke all on function public.redeem_parent_invite(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.redeem_parent_invite(text, text) to authenticated;

create or replace function public.get_parent_overdue_tasks(target_student_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if caller_id <> target_student_id
    and not (select private.is_active_parent(target_student_id)) then
    raise exception 'You do not have access to this learner' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', course.id,
      'title', course.title,
      'due_at', course.due_at,
      'days_overdue', greatest(0, floor(extract(epoch from (now() - course.due_at)) / 86400)::integer),
      'milestone_title', milestone.title,
      'career_title', roadmap.career_title
    ) order by course.due_at)
    from public.courses course
    join public.milestones milestone on milestone.id = course.milestone_id
    join public.roadmaps roadmap on roadmap.id = milestone.roadmap_id
    where roadmap.user_id = target_student_id
      and roadmap.status = 'active'
      and course.status = 'in_progress'
      and course.due_at < now()
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_parent_overdue_tasks(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_parent_overdue_tasks(uuid) to authenticated;
