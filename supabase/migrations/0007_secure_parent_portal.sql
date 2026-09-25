-- Nexvia secure Parent Portal
-- Real parent/ward links, one-time invite codes, encouragements, and a
-- privacy-preserving dashboard function.

create schema if not exists private;
grant usage on schema private to authenticated;

alter table public.roadmaps
  add column if not exists last_activity_at timestamptz not null default now();

create table if not exists public.parent_invites (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  code_digest text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint parent_invites_expiry_after_creation
    check (expires_at > created_at)
);

create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'Parent',
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parent_links_not_self check (parent_user_id <> student_user_id),
  constraint parent_links_relationship_length
    check (char_length(trim(relationship)) between 2 and 40),
  constraint parent_links_parent_student_unique
    unique (parent_user_id, student_user_id)
);

create table if not exists public.parent_encouragements (
  id uuid primary key default gen_random_uuid(),
  parent_link_id uuid not null references public.parent_links(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint parent_encouragements_message_length
    check (char_length(trim(message)) between 1 and 300)
);

create index if not exists parent_invites_student_idx
  on public.parent_invites(student_user_id, created_at desc);
create index if not exists parent_invites_expiry_idx
  on public.parent_invites(expires_at)
  where used_at is null;
create index if not exists parent_links_parent_idx
  on public.parent_links(parent_user_id, status);
create index if not exists parent_links_student_idx
  on public.parent_links(student_user_id, status);
create index if not exists parent_encouragements_link_created_idx
  on public.parent_encouragements(parent_link_id, created_at desc);
create index if not exists parent_encouragements_parent_idx
  on public.parent_encouragements(parent_user_id);
create index if not exists parent_encouragements_student_idx
  on public.parent_encouragements(student_user_id, created_at desc);

drop trigger if exists parent_links_set_updated_at on public.parent_links;
create trigger parent_links_set_updated_at
  before update on public.parent_links
  for each row execute function public.set_updated_at();

alter table public.parent_invites enable row level security;
alter table public.parent_links enable row level security;
alter table public.parent_encouragements enable row level security;

revoke all on table public.parent_invites from anon, authenticated;
revoke all on table public.parent_links from anon, authenticated;
revoke all on table public.parent_encouragements from anon, authenticated;

grant select, insert, delete on table public.parent_invites to authenticated;
grant select on table public.parent_links to authenticated;
grant select, insert on table public.parent_encouragements to authenticated;
grant update (read_at) on table public.parent_encouragements to authenticated;

drop policy if exists parent_invites_select_student on public.parent_invites;
create policy parent_invites_select_student
  on public.parent_invites for select
  to authenticated
  using ((select auth.uid()) = student_user_id);

drop policy if exists parent_invites_insert_student on public.parent_invites;
create policy parent_invites_insert_student
  on public.parent_invites for insert
  to authenticated
  with check ((select auth.uid()) = student_user_id);

drop policy if exists parent_invites_delete_student on public.parent_invites;
create policy parent_invites_delete_student
  on public.parent_invites for delete
  to authenticated
  using ((select auth.uid()) = student_user_id);

drop policy if exists parent_links_select_participant on public.parent_links;
create policy parent_links_select_participant
  on public.parent_links for select
  to authenticated
  using (
    (select auth.uid()) = parent_user_id
    or (select auth.uid()) = student_user_id
  );

create or replace function private.is_active_parent(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.parent_links link
      where link.parent_user_id = (select auth.uid())
        and link.student_user_id = target_student_id
        and link.status = 'active'
    );
$$;

revoke all on function private.is_active_parent(uuid)
  from public, anon, authenticated, service_role;
grant execute on function private.is_active_parent(uuid) to authenticated;

drop policy if exists parent_encouragements_select_participant
  on public.parent_encouragements;
create policy parent_encouragements_select_participant
  on public.parent_encouragements for select
  to authenticated
  using (
    (select auth.uid()) = parent_user_id
    or (select auth.uid()) = student_user_id
  );

drop policy if exists parent_encouragements_insert_linked_parent
  on public.parent_encouragements;
create policy parent_encouragements_insert_linked_parent
  on public.parent_encouragements for insert
  to authenticated
  with check (
    (select auth.uid()) = parent_user_id
    and (select private.is_active_parent(student_user_id))
    and exists (
      select 1
      from public.parent_links link
      where link.id = parent_link_id
        and link.parent_user_id = (select auth.uid())
        and link.student_user_id = parent_encouragements.student_user_id
        and link.status = 'active'
    )
  );

drop policy if exists parent_encouragements_update_student
  on public.parent_encouragements;
create policy parent_encouragements_update_student
  on public.parent_encouragements for update
  to authenticated
  using ((select auth.uid()) = student_user_id)
  with check ((select auth.uid()) = student_user_id);

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

  select *
  into invite_row
  from public.parent_invites
  where code_digest = encode(
    extensions.digest(upper(trim(invite_code)), 'sha256'),
    'hex'
  )
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
    parent_user_id,
    student_user_id,
    relationship,
    status
  ) values (
    caller_id,
    invite_row.student_user_id,
    clean_relationship,
    'active'
  )
  on conflict (parent_user_id, student_user_id)
  do update set
    relationship = excluded.relationship,
    status = 'active',
    updated_at = now()
  returning * into link_row;

  update public.parent_invites
  set used_at = now()
  where id = invite_row.id;

  return jsonb_build_object(
    'link_id', link_row.id,
    'student_user_id', link_row.student_user_id,
    'status', link_row.status
  );
end;
$$;

revoke all on function public.redeem_parent_invite(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.redeem_parent_invite(text, text)
  to authenticated;

create or replace function public.get_parent_dashboard(target_student_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if caller_id <> target_student_id
    and not (select private.is_active_parent(target_student_id)) then
    raise exception 'You do not have access to this learner'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'student', coalesce((
      select jsonb_build_object(
        'id', profile.id,
        'name', coalesce(nullif(trim(profile.full_name), ''), 'Learner'),
        'level', profile.level,
        'xp', profile.xp,
        'current_streak_days', profile.current_streak_days,
        'longest_streak_days', profile.longest_streak_days,
        'last_active_day', profile.last_active_day,
        'study_hours_per_week', profile.study_hours_per_week,
        'learning_style', profile.learning_style
      )
      from public.profiles profile
      where profile.id = target_student_id
    ), jsonb_build_object('id', target_student_id, 'name', 'Learner')),
    'assessment', (
      select jsonb_build_object(
        'status', assessment.status,
        'completed_at', assessment.completed_at
      )
      from public.assessments assessment
      where assessment.user_id = target_student_id
      limit 1
    ),
    'analysis', (
      select jsonb_build_object(
        'strengths', report.strengths,
        'growth_areas', report.growth_areas,
        'summary', report.summary,
        'learning_style', report.learning_style,
        'recommended_pace', report.recommended_pace,
        'study_capacity_hours', report.study_capacity_hours
      )
      from public.analysis_reports report
      where report.user_id = target_student_id
      order by report.created_at desc
      limit 1
    ),
    'recommendation', (
      select jsonb_build_object(
        'career_title', career.title,
        'description', career.description,
        'match_percentage', recommendation.match_percentage,
        'reasons', recommendation.reasons,
        'existing_strengths', recommendation.existing_strengths,
        'growth_opportunities', recommendation.growth_opportunities,
        'is_selected', recommendation.is_selected
      )
      from public.career_recommendations recommendation
      join public.careers career on career.id = recommendation.career_id
      where recommendation.user_id = target_student_id
      order by recommendation.is_selected desc, recommendation.match_percentage desc
      limit 1
    ),
    'roadmap', (
      select jsonb_build_object(
        'id', roadmap.id,
        'career_title', roadmap.career_title,
        'status', roadmap.status,
        'created_at', roadmap.created_at,
        'last_activity_at', roadmap.last_activity_at,
        'milestones', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', milestone.id,
              'title', milestone.title,
              'description', milestone.description,
              'order_index', milestone.order_index,
              'status', milestone.status,
              'courses', coalesce((
                select jsonb_agg(
                  jsonb_build_object(
                    'id', course.id,
                    'title', course.title,
                    'status', course.status,
                    'duration_weeks', course.duration_weeks
                  ) order by course.title
                )
                from public.courses course
                where course.milestone_id = milestone.id
              ), '[]'::jsonb)
            ) order by milestone.order_index
          )
          from public.milestones milestone
          where milestone.roadmap_id = roadmap.id
        ), '[]'::jsonb)
      )
      from public.roadmaps roadmap
      where roadmap.user_id = target_student_id
      order by roadmap.created_at desc
      limit 1
    ),
    'badges', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', badge.key,
          'name', badge.name,
          'description', badge.description,
          'earned_at', earned.earned_at
        ) order by earned.earned_at desc
      )
      from public.user_badges earned
      join public.badges badge on badge.key = earned.badge_key
      where earned.user_id = target_student_id
    ), '[]'::jsonb),
    'readiness', (
      select jsonb_build_object(
        'overall', readiness.overall,
        'technical_skills', readiness.technical_skills,
        'communication', readiness.communication,
        'projects', readiness.projects,
        'resume_quality', readiness.resume_quality,
        'interview_readiness', readiness.interview_readiness,
        'suggestions', readiness.suggestions,
        'updated_at', readiness.updated_at
      )
      from public.career_readiness readiness
      where readiness.user_id = target_student_id
      limit 1
    ),
    'interviews', jsonb_build_object(
      'completed_count', (
        select count(*)
        from public.mock_interviews interview
        where interview.user_id = target_student_id
          and interview.is_complete
      ),
      'average_score', coalesce((
        select round(avg(interview.overall_score))::integer
        from public.mock_interviews interview
        where interview.user_id = target_student_id
          and interview.is_complete
      ), 0),
      'latest', (
        select jsonb_build_object(
          'category', interview.category,
          'career_title', interview.career_title,
          'overall_score', interview.overall_score,
          'summary', interview.summary,
          'completed_at', interview.updated_at
        )
        from public.mock_interviews interview
        where interview.user_id = target_student_id
          and interview.is_complete
        order by interview.updated_at desc
        limit 1
      )
    ),
    'recent_activity', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'reason', activity.reason,
          'amount', activity.amount,
          'created_at', activity.created_at
        ) order by activity.created_at desc
      )
      from (
        select reason, amount, created_at
        from public.xp_transactions
        where user_id = target_student_id
        order by created_at desc
        limit 8
      ) activity
    ), '[]'::jsonb),
    'encouragements', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', encouragement.id,
          'message', encouragement.message,
          'read_at', encouragement.read_at,
          'created_at', encouragement.created_at
        ) order by encouragement.created_at desc
      )
      from (
        select id, message, read_at, created_at
        from public.parent_encouragements
        where student_user_id = target_student_id
          and (
            caller_id = target_student_id
            or parent_user_id = caller_id
          )
        order by created_at desc
        limit 8
      ) encouragement
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_parent_dashboard(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_parent_dashboard(uuid)
  to authenticated;

