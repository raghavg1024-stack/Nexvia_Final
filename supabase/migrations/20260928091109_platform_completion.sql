create schema if not exists private;

alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('student', 'recruiter', 'academia', 'parent', 'admin'));
alter table public.profiles
  add column if not exists preferred_locale text not null default 'en'
  check (preferred_locale in ('en', 'hi', 'mr'));

alter table public.companies
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'suspended')),
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_notes text;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website text,
  location text,
  description text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'suspended')),
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('project', 'internship', 'achievement', 'publication', 'certification', 'hackathon', 'competition')),
  title text not null,
  description text,
  skills jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  organization text,
  location text,
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported', 'pending_verification', 'verified')),
  verification_source text,
  verification_id uuid,
  url text,
  image_url text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certificates
  add column if not exists verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported', 'pending_verification', 'verified')),
  add column if not exists verification_source text,
  add column if not exists verification_id uuid;

create table if not exists public.student_skill_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  evidence_url text not null,
  evidence_summary text,
  verification_status text not null default 'pending_verification'
    check (verification_status in ('self_reported', 'pending_verification', 'verified')),
  verification_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, skill_name, evidence_url)
);

create table if not exists public.faculty_opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  type text not null check (type in ('faculty_internship', 'fdp', 'industrial_training', 'consultancy', 'research_collaboration', 'workshop', 'guest_lecture', 'mentorship')),
  description text not null,
  required_skills jsonb not null default '[]'::jsonb,
  duration_weeks integer,
  location text not null default 'Remote',
  stipend_amount text,
  application_url text,
  application_deadline date,
  max_participants integer,
  status text not null default 'draft' check (status in ('open', 'closed', 'draft')),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'suspended')),
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.faculty_opportunities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  applied_at timestamptz not null default now(),
  unique (opportunity_id, user_id)
);

create table if not exists public.industry_collaborations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  academician_id uuid references auth.users(id) on delete set null,
  title text not null,
  type text not null check (type in ('fdp', 'workshop', 'guest_lecture', 'innovation_challenge', 'consultancy', 'research_project', 'live_project', 'mentorship_program')),
  description text not null,
  start_date date,
  end_date date,
  status text not null default 'proposed' check (status in ('proposed', 'planned', 'active', 'completed', 'cancelled')),
  participants integer not null default 0,
  outcomes text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'suspended')),
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs
  add column if not exists application_deadline date,
  add column if not exists moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'suspended')),
  add column if not exists moderated_by uuid references auth.users(id) on delete set null,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_notes text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('application_status', 'streak_reminder', 'weekly_recap', 'system', 'match', 'deadline', 'verification', 'training')),
  title text not null,
  message text not null,
  data jsonb,
  read boolean not null default false,
  dedupe_key text,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default true,
  match_alerts boolean not null default true,
  application_alerts boolean not null default true,
  deadline_alerts boolean not null default true,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'hi', 'mr')),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null unique references public.notifications(id) on delete cascade,
  recipient_email text not null,
  recipient_name text,
  subject text not null,
  html_body text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  provider_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  subject_type text not null check (subject_type in ('project', 'skill', 'certificate', 'opportunity')),
  subject_table text not null check (subject_table in ('portfolio_items', 'student_skill_evidence', 'certificates', 'jobs', 'faculty_opportunities')),
  subject_id uuid not null,
  subject_label text not null,
  evidence_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_role text,
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists verification_requests_active_subject_idx
  on public.verification_requests (subject_table, subject_id)
  where status = 'pending';

create table if not exists public.employer_cohorts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  description text,
  target_role text,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employer_cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.employer_cohorts(id) on delete cascade,
  employee_email text not null,
  employee_name text not null,
  employee_user_id uuid references auth.users(id) on delete set null,
  current_skills jsonb not null default '[]'::jsonb,
  target_skills jsonb not null default '[]'::jsonb,
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  joined_at timestamptz not null default now(),
  unique (cohort_id, employee_email)
);

create table if not exists public.training_assignments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.employer_cohorts(id) on delete cascade,
  title text not null,
  description text,
  skill_name text not null,
  resource_url text,
  due_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.training_assignment_progress (
  assignment_id uuid not null references public.training_assignments(id) on delete cascade,
  member_id uuid not null references public.employer_cohort_members(id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed')),
  score integer check (score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, member_id)
);

create table if not exists public.readiness_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  overall integer not null check (overall between 0 and 100),
  recorded_at timestamptz not null default now()
);

create table if not exists public.recommendation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id uuid references public.career_recommendations(id) on delete set null,
  event_type text not null check (event_type in ('viewed', 'accepted', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_user_status_idx on public.portfolio_items (user_id, verification_status);
create index if not exists skill_evidence_user_status_idx on public.student_skill_evidence (user_id, verification_status);
create index if not exists verification_requests_status_submitted_idx on public.verification_requests (status, submitted_at);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read = false;
create index if not exists email_outbox_pending_idx on public.email_outbox (next_attempt_at, created_at) where status in ('pending', 'failed');
create index if not exists jobs_moderation_idx on public.jobs (moderation_status, created_at desc);
create index if not exists faculty_opportunities_moderation_idx on public.faculty_opportunities (moderation_status, created_at desc);
create index if not exists collaborations_moderation_idx on public.industry_collaborations (moderation_status, created_at desc);
create index if not exists cohort_company_status_idx on public.employer_cohorts (company_id, status);
create index if not exists cohort_members_cohort_idx on public.employer_cohort_members (cohort_id);
create index if not exists training_assignments_cohort_idx on public.training_assignments (cohort_id, due_at);
create index if not exists readiness_history_user_recorded_idx on public.readiness_history (user_id, recorded_at);
create index if not exists recommendation_events_user_type_idx on public.recommendation_events (user_id, event_type);

create or replace function private.current_user_type()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_type from public.profiles p where p.id = (select auth.uid())
$$;

revoke all on function private.current_user_type() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_user_type() to authenticated;

create or replace function private.is_platform_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_type() in ('admin', 'academia', 'recruiter'), false)
$$;

revoke all on function private.is_platform_reviewer() from public, anon, authenticated;
grant execute on function private.is_platform_reviewer() to authenticated;

create or replace function private.queue_email_from_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient public.profiles%rowtype;
  preferences public.notification_preferences%rowtype;
begin
  select * into recipient from public.profiles where id = new.user_id;
  select * into preferences from public.notification_preferences where user_id = new.user_id;

  if recipient.email is null or coalesce(preferences.email_enabled, true) = false then
    return new;
  end if;

  insert into public.email_outbox (notification_id, recipient_email, recipient_name, subject, html_body)
  values (
    new.id,
    recipient.email,
    recipient.full_name,
    new.title,
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:28px;color:#0f172a">'
      || '<h1 style="font-size:22px">' || replace(new.title, '<', '&lt;') || '</h1>'
      || '<p style="line-height:1.7;color:#475569">' || replace(new.message, '<', '&lt;') || '</p>'
      || '<p style="margin-top:28px;font-size:12px;color:#94a3b8">Nexvia career operating system</p></div>'
  )
  on conflict (notification_id) do nothing;
  return new;
end;
$$;

create or replace function private.filter_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare preferences public.notification_preferences%rowtype;
begin
  select * into preferences from public.notification_preferences where user_id = new.user_id;
  if new.type = 'match' and coalesce(preferences.match_alerts, true) = false then return null; end if;
  if new.type = 'application_status' and coalesce(preferences.application_alerts, true) = false then return null; end if;
  if new.type = 'deadline' and coalesce(preferences.deadline_alerts, true) = false then return null; end if;
  return new;
end;
$$;

drop trigger if exists notifications_filter_preferences on public.notifications;
create trigger notifications_filter_preferences
  before insert on public.notifications
  for each row execute function private.filter_notification_preferences();

drop trigger if exists notifications_queue_email on public.notifications;
create trigger notifications_queue_email
  after insert on public.notifications
  for each row execute function private.queue_email_from_notification();

create or replace function private.notify_application_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_title text;
begin
  if old.status is not distinct from new.status then return new; end if;
  select title into job_title from public.jobs where id = new.job_id;
  insert into public.notifications (user_id, type, title, message, data, dedupe_key)
  values (
    new.user_id,
    'application_status',
    'Application status updated',
    'Your application for ' || coalesce(job_title, 'an opportunity') || ' is now ' || replace(new.status, '_', ' ') || '.',
    jsonb_build_object('job_id', new.job_id, 'job_title', job_title, 'status', new.status),
    'application:' || new.id::text || ':' || new.status
  ) on conflict (user_id, dedupe_key) do nothing;
  return new;
end;
$$;

drop trigger if exists job_applications_notify_status on public.job_applications;
create trigger job_applications_notify_status
  after update of status on public.job_applications
  for each row execute function private.notify_application_status();

create or replace function private.notify_matching_students()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.moderation_status <> 'approved' or old.moderation_status = 'approved' then return new; end if;

  insert into public.notifications (user_id, type, title, message, data, dedupe_key)
  select candidate.user_id,
    'match',
    'New opportunity match',
    new.title || ' matches skills in your recruiter-visible profile.',
    jsonb_build_object('job_id', new.id, 'job_title', new.title),
    'job-match:' || new.id::text
  from public.candidate_profiles candidate
  where candidate.open_to_recruiters = true
    and exists (
      select 1
      from jsonb_array_elements_text(coalesce(candidate.skill_tags, '[]'::jsonb)) candidate_skill
      join jsonb_array_elements_text(coalesce(new.required_skills, '[]'::jsonb)) required_skill
        on lower(candidate_skill.value) = lower(required_skill.value)
    )
  limit 500
  on conflict (user_id, dedupe_key) do nothing;
  return new;
end;
$$;

drop trigger if exists jobs_notify_matches on public.jobs;
create trigger jobs_notify_matches
  after update of moderation_status on public.jobs
  for each row execute function private.notify_matching_students();

create or replace function private.create_portfolio_verification_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare request_id uuid;
begin
  if new.verification_status <> 'pending_verification' or new.url is null then return new; end if;
  if tg_op = 'UPDATE' and old.verification_status = 'pending_verification' and old.url is not distinct from new.url then return new; end if;

  insert into public.verification_requests (
    requester_id, subject_type, subject_table, subject_id, subject_label, evidence_url
  ) values (
    new.user_id,
    case when new.type = 'certification' then 'certificate' else 'project' end,
    'portfolio_items',
    new.id,
    new.title,
    new.url
  ) returning id into request_id;

  update public.portfolio_items set verification_id = request_id where id = new.id;
  return new;
exception when unique_violation then
  return new;
end;
$$;

drop trigger if exists portfolio_create_verification_request on public.portfolio_items;
create trigger portfolio_create_verification_request
  after insert or update of verification_status, url on public.portfolio_items
  for each row execute function private.create_portfolio_verification_request();

create or replace function private.capture_readiness_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.overall is distinct from new.overall then
    insert into public.readiness_history (user_id, overall) values (new.user_id, new.overall);
  end if;
  return new;
end;
$$;

drop trigger if exists career_readiness_capture_history on public.career_readiness;
create trigger career_readiness_capture_history
  after insert or update of overall on public.career_readiness
  for each row execute function private.capture_readiness_history();

alter table public.institutions enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.student_skill_evidence enable row level security;
alter table public.faculty_opportunities enable row level security;
alter table public.faculty_applications enable row level security;
alter table public.industry_collaborations enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.email_outbox enable row level security;
alter table public.verification_requests enable row level security;
alter table public.employer_cohorts enable row level security;
alter table public.employer_cohort_members enable row level security;
alter table public.training_assignments enable row level security;
alter table public.training_assignment_progress enable row level security;
alter table public.readiness_history enable row level security;
alter table public.recommendation_events enable row level security;

revoke all on table public.institutions, public.portfolio_items, public.student_skill_evidence,
  public.faculty_opportunities, public.faculty_applications, public.industry_collaborations,
  public.notifications, public.notification_preferences, public.email_outbox,
  public.verification_requests, public.employer_cohorts, public.employer_cohort_members,
  public.training_assignments, public.training_assignment_progress,
  public.readiness_history, public.recommendation_events from anon, authenticated;

grant select, insert, update on public.institutions to authenticated;
grant select, insert, update, delete on public.portfolio_items, public.student_skill_evidence to authenticated;
grant select, insert, update, delete on public.faculty_opportunities, public.faculty_applications, public.industry_collaborations to authenticated;
grant select, insert, update, delete on public.notifications, public.notification_preferences to authenticated;
grant select, insert, update on public.verification_requests to authenticated;
grant select, update on public.certificates to authenticated;
grant select, insert, update, delete on public.employer_cohorts, public.employer_cohort_members, public.training_assignments, public.training_assignment_progress to authenticated;
grant select, insert on public.readiness_history, public.recommendation_events to authenticated;

create policy institutions_owner_select on public.institutions for select to authenticated
  using (owner_id = (select auth.uid()) or private.current_user_type() = 'admin');
create policy institutions_owner_insert on public.institutions for insert to authenticated
  with check (owner_id = (select auth.uid()) and private.current_user_type() = 'academia');
create policy institutions_owner_update on public.institutions for update to authenticated
  using (owner_id = (select auth.uid()) or private.current_user_type() = 'admin')
  with check (owner_id = (select auth.uid()) or private.current_user_type() = 'admin');

create policy portfolio_owner_select on public.portfolio_items for select to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_reviewer());
create policy portfolio_owner_insert on public.portfolio_items for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy portfolio_owner_update on public.portfolio_items for update to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_reviewer())
  with check (user_id = (select auth.uid()) or private.is_platform_reviewer());
create policy portfolio_owner_delete on public.portfolio_items for delete to authenticated
  using (user_id = (select auth.uid()));

create policy skill_evidence_select on public.student_skill_evidence for select to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_reviewer());
create policy skill_evidence_insert on public.student_skill_evidence for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy skill_evidence_update on public.student_skill_evidence for update to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_reviewer())
  with check (user_id = (select auth.uid()) or private.is_platform_reviewer());
create policy skill_evidence_delete on public.student_skill_evidence for delete to authenticated
  using (user_id = (select auth.uid()));

create policy certificates_reviewer_select on public.certificates for select to authenticated
  using (private.is_platform_reviewer());
create policy certificates_reviewer_update on public.certificates for update to authenticated
  using (private.is_platform_reviewer()) with check (private.is_platform_reviewer());

create policy faculty_opportunities_read_approved on public.faculty_opportunities for select to authenticated
  using (moderation_status = 'approved' or exists (
    select 1 from public.company_members member
    where member.company_id = faculty_opportunities.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');
create policy faculty_opportunities_company_insert on public.faculty_opportunities for insert to authenticated
  with check (exists (select 1 from public.company_members member where member.company_id = faculty_opportunities.company_id and member.user_id = (select auth.uid())));
create policy faculty_opportunities_company_update on public.faculty_opportunities for update to authenticated
  using (exists (select 1 from public.company_members member where member.company_id = faculty_opportunities.company_id and member.user_id = (select auth.uid())) or private.current_user_type() = 'admin')
  with check (exists (select 1 from public.company_members member where member.company_id = faculty_opportunities.company_id and member.user_id = (select auth.uid())) or private.current_user_type() = 'admin');
create policy faculty_opportunities_company_delete on public.faculty_opportunities for delete to authenticated
  using (exists (select 1 from public.company_members member where member.company_id = faculty_opportunities.company_id and member.user_id = (select auth.uid())) or private.current_user_type() = 'admin');

create policy faculty_applications_participant_select on public.faculty_applications for select to authenticated
  using (user_id = (select auth.uid()) or exists (
    select 1 from public.faculty_opportunities opportunity
    join public.company_members member on member.company_id = opportunity.company_id
    where opportunity.id = faculty_applications.opportunity_id and member.user_id = (select auth.uid())
  ));
create policy faculty_applications_owner_insert on public.faculty_applications for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy faculty_applications_company_update on public.faculty_applications for update to authenticated
  using (exists (
    select 1 from public.faculty_opportunities opportunity
    join public.company_members member on member.company_id = opportunity.company_id
    where opportunity.id = faculty_applications.opportunity_id and member.user_id = (select auth.uid())
  ));

create policy collaborations_participant_select on public.industry_collaborations for select to authenticated
  using (moderation_status = 'approved' or academician_id = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = industry_collaborations.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');
create policy collaborations_participant_insert on public.industry_collaborations for insert to authenticated
  with check (academician_id = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = industry_collaborations.company_id and member.user_id = (select auth.uid())
  ));
create policy collaborations_participant_update on public.industry_collaborations for update to authenticated
  using (academician_id = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = industry_collaborations.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin')
  with check (academician_id = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = industry_collaborations.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');
create policy collaborations_participant_delete on public.industry_collaborations for delete to authenticated
  using (academician_id = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = industry_collaborations.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');

create policy notifications_owner_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_reviewer_insert on public.notifications for insert to authenticated
  with check (user_id = (select auth.uid()) or private.is_platform_reviewer());
create policy notifications_owner_delete on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

create policy notification_preferences_owner_select on public.notification_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy notification_preferences_owner_insert on public.notification_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy notification_preferences_owner_update on public.notification_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy verification_requests_participant_select on public.verification_requests for select to authenticated
  using (requester_id = (select auth.uid()) or private.is_platform_reviewer());
create policy verification_requests_owner_insert on public.verification_requests for insert to authenticated
  with check (requester_id = (select auth.uid()));
create policy verification_requests_reviewer_update on public.verification_requests for update to authenticated
  using (private.is_platform_reviewer()) with check (private.is_platform_reviewer());

create policy cohorts_company_select on public.employer_cohorts for select to authenticated
  using (exists (select 1 from public.company_members member where member.company_id = employer_cohorts.company_id and member.user_id = (select auth.uid())));
create policy cohorts_company_insert on public.employer_cohorts for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (select 1 from public.company_members member where member.company_id = employer_cohorts.company_id and member.user_id = (select auth.uid())));
create policy cohorts_company_update on public.employer_cohorts for update to authenticated
  using (exists (select 1 from public.company_members member where member.company_id = employer_cohorts.company_id and member.user_id = (select auth.uid())))
  with check (exists (select 1 from public.company_members member where member.company_id = employer_cohorts.company_id and member.user_id = (select auth.uid())));
create policy cohorts_company_delete on public.employer_cohorts for delete to authenticated
  using (exists (select 1 from public.company_members member where member.company_id = employer_cohorts.company_id and member.user_id = (select auth.uid())));

create policy cohort_members_company_all on public.employer_cohort_members for all to authenticated
  using (exists (select 1 from public.employer_cohorts cohort join public.company_members member on member.company_id = cohort.company_id where cohort.id = employer_cohort_members.cohort_id and member.user_id = (select auth.uid())))
  with check (exists (select 1 from public.employer_cohorts cohort join public.company_members member on member.company_id = cohort.company_id where cohort.id = employer_cohort_members.cohort_id and member.user_id = (select auth.uid())));
create policy training_assignments_company_all on public.training_assignments for all to authenticated
  using (exists (select 1 from public.employer_cohorts cohort join public.company_members member on member.company_id = cohort.company_id where cohort.id = training_assignments.cohort_id and member.user_id = (select auth.uid())))
  with check (exists (select 1 from public.employer_cohorts cohort join public.company_members member on member.company_id = cohort.company_id where cohort.id = training_assignments.cohort_id and member.user_id = (select auth.uid())));
create policy training_progress_company_all on public.training_assignment_progress for all to authenticated
  using (exists (select 1 from public.training_assignments assignment join public.employer_cohorts cohort on cohort.id = assignment.cohort_id join public.company_members member on member.company_id = cohort.company_id where assignment.id = training_assignment_progress.assignment_id and member.user_id = (select auth.uid())))
  with check (exists (select 1 from public.training_assignments assignment join public.employer_cohorts cohort on cohort.id = assignment.cohort_id join public.company_members member on member.company_id = cohort.company_id where assignment.id = training_assignment_progress.assignment_id and member.user_id = (select auth.uid())));

create policy readiness_history_owner_select on public.readiness_history for select to authenticated
  using (user_id = (select auth.uid()) or private.current_user_type() in ('admin', 'academia'));
create policy readiness_history_owner_insert on public.readiness_history for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy recommendation_events_owner_select on public.recommendation_events for select to authenticated
  using (user_id = (select auth.uid()) or private.current_user_type() in ('admin', 'academia'));
create policy recommendation_events_owner_insert on public.recommendation_events for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists companies_admin_select on public.companies;
drop policy if exists companies_select_all on public.companies;
create policy companies_admin_select on public.companies for select to authenticated
  using (moderation_status = 'approved' or created_by = (select auth.uid()) or exists (
    select 1 from public.company_members member where member.company_id = companies.id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');
drop policy if exists companies_admin_update on public.companies;
create policy companies_admin_update on public.companies for update to authenticated
  using (private.current_user_type() = 'admin') with check (private.current_user_type() = 'admin');
drop policy if exists jobs_admin_select on public.jobs;
drop policy if exists jobs_select_all on public.jobs;
create policy jobs_admin_select on public.jobs for select to authenticated
  using (moderation_status = 'approved' or exists (
    select 1 from public.company_members member where member.company_id = jobs.company_id and member.user_id = (select auth.uid())
  ) or private.current_user_type() = 'admin');
drop policy if exists jobs_admin_update on public.jobs;
create policy jobs_admin_update on public.jobs for update to authenticated
  using (private.current_user_type() = 'admin') with check (private.current_user_type() = 'admin');

create or replace function private.protect_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and private.current_user_type() <> 'admin' then
    if new.moderation_status <> 'pending' and (tg_op = 'INSERT' or old.moderation_status is distinct from new.moderation_status) then
      raise exception 'Only administrators can approve or reject moderated content' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and (
      new.moderated_by is distinct from old.moderated_by or
      new.moderated_at is distinct from old.moderated_at or
      new.moderation_notes is distinct from old.moderation_notes
    ) and new.moderation_status <> 'pending' then
      raise exception 'Moderation audit fields are administrator managed' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists companies_protect_moderation on public.companies;
create trigger companies_protect_moderation before insert or update on public.companies
  for each row execute function private.protect_moderation_fields();
drop trigger if exists institutions_protect_moderation on public.institutions;
create trigger institutions_protect_moderation before insert or update on public.institutions
  for each row execute function private.protect_moderation_fields();
drop trigger if exists jobs_protect_moderation on public.jobs;
create trigger jobs_protect_moderation before insert or update on public.jobs
  for each row execute function private.protect_moderation_fields();
drop trigger if exists faculty_opportunities_protect_moderation on public.faculty_opportunities;
create trigger faculty_opportunities_protect_moderation before insert or update on public.faculty_opportunities
  for each row execute function private.protect_moderation_fields();
drop trigger if exists collaborations_protect_moderation on public.industry_collaborations;
create trigger collaborations_protect_moderation before insert or update on public.industry_collaborations
  for each row execute function private.protect_moderation_fields();

create or replace function private.protect_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and private.is_platform_reviewer() = false then
    if new.verification_status = 'verified' then
      raise exception 'Verified status requires an authorized reviewer' using errcode = '42501';
    end if;
  end if;
  if (select auth.uid()) is not null and new.verification_status = 'verified' and
    (tg_op = 'INSERT' or old.verification_status is distinct from new.verification_status) then
    if (to_jsonb(new) ->> 'user_id')::uuid = (select auth.uid()) then
      raise exception 'Reviewers cannot verify their own evidence' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.verification_requests request
      where request.subject_table = tg_table_name
        and request.subject_id = new.id
        and request.status = 'approved'
        and request.reviewer_id = (select auth.uid())
    ) then
      raise exception 'An approved verification request is required' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portfolio_protect_verification on public.portfolio_items;
create trigger portfolio_protect_verification before insert or update on public.portfolio_items
  for each row execute function private.protect_verification_fields();
drop trigger if exists skills_protect_verification on public.student_skill_evidence;
create trigger skills_protect_verification before insert or update on public.student_skill_evidence
  for each row execute function private.protect_verification_fields();
drop trigger if exists certificates_protect_verification on public.certificates;
create trigger certificates_protect_verification before insert or update on public.certificates
  for each row execute function private.protect_verification_fields();

create or replace function public.get_impact_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_role text := private.current_user_type();
  applications_total numeric;
  placements_total numeric;
  courses_total numeric;
  courses_completed numeric;
  recommendations_total numeric;
  recommendations_accepted numeric;
  baseline_readiness numeric;
  current_readiness numeric;
  verified_opportunities numeric;
begin
  if caller_role not in ('admin', 'academia', 'recruiter') then
    raise exception 'Reviewer access required' using errcode = '42501';
  end if;

  select count(*), count(*) filter (where status in ('accepted', 'hired'))
  into applications_total, placements_total from public.job_applications;

  select count(*), count(*) filter (where status = 'completed')
  into courses_total, courses_completed from public.courses;

  select count(*), count(*) filter (where is_selected = true)
  into recommendations_total, recommendations_accepted from public.career_recommendations;

  select avg(first_score), avg(last_score) into baseline_readiness, current_readiness
  from (
    select distinct on (user_id) user_id,
      first_value(overall) over (partition by user_id order by recorded_at) as first_score,
      first_value(overall) over (partition by user_id order by recorded_at desc) as last_score
    from public.readiness_history
  ) scores;

  select
    (select count(*) from public.jobs where moderation_status = 'approved')
    + (select count(*) from public.faculty_opportunities where moderation_status = 'approved')
  into verified_opportunities;

  return jsonb_build_object(
    'placement_rate', case when applications_total > 0 then round(placements_total * 100 / applications_total) else 0 end,
    'readiness_improvement', round(coalesce(current_readiness, 0) - coalesce(baseline_readiness, 0)),
    'average_readiness', round(coalesce(current_readiness, 0)),
    'roadmap_completion', case when courses_total > 0 then round(courses_completed * 100 / courses_total) else 0 end,
    'accepted_recommendations', case when recommendations_total > 0 then round(recommendations_accepted * 100 / recommendations_total) else 0 end,
    'verified_opportunities', coalesce(verified_opportunities, 0),
    'applications', coalesce(applications_total, 0),
    'placements', coalesce(placements_total, 0),
    'measured_at', now()
  );
end;
$$;

revoke all on function public.get_impact_metrics() from public, anon, authenticated;
grant execute on function public.get_impact_metrics() to authenticated;

grant select, update on public.email_outbox to service_role;
