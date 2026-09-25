-- Career OS — automation
-- Migration 0004: pg_cron jobs for jobs cache sync + streak expiry.
-- Idempotent: `if not exists` guards, `create or replace` functions, upsert-style cron scheduling.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- Note: grants on schema cron are added automatically by the platform's
-- pg_cron after-create script (do not re-grant them, it conflicts with 2BP01).
create extension if not exists pg_cron with schema pg_catalog;

create extension if not exists http with schema extensions;

-- ---------------------------------------------------------------------------
-- Jobs cache table
-- ---------------------------------------------------------------------------
create table if not exists "job_listings" (
  "external_id" text primary key,
  "category" text not null,
  "category_name" text,
  "title" text not null,
  "url" text not null,
  "apply_url" text,
  "company" text not null default 'Unknown',
  "company_logo" text,
  "location" text,
  "salary_text" text,
  "salary_min" integer,
  "salary_max" integer,
  "type" text,
  "description" text not null default '',
  "posted_at" text,
  "fetched_at" timestamptz not null default now()
);

create index if not exists job_listings_category_idx on job_listings ("category");
create index if not exists job_listings_fetched_at_idx on job_listings ("fetched_at");

alter table "job_listings" enable row level security;

drop policy if exists "job_listings_select_all" on "job_listings";
create policy "job_listings_select_all" on "job_listings"
  for select
  to anon, authenticated
  using (true);

grant select on "job_listings" to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Jobs sync function (runs inside pg_cron)
-- ---------------------------------------------------------------------------
create or replace function refresh_job_listings()
returns table (
  category text,
  fetched int,
  failed boolean
)
language plpgsql
set search_path = ''
as $$
declare
  cat text;
  resp extensions.http_response;
  payload jsonb;
  job jsonb;
  ok_count int;
begin
  foreach cat in array array[
    'programming', 'design', 'writing', 'sales',
    'marketing', 'customer-support', 'data-science'
  ] loop
    begin
      resp := extensions.http_get(
        'https://remotejobs.org/api/v1/jobs?category=' || cat || '&limit=50'
      );

      if resp.status <> 200 then
        return query select cat, 0, true;
        continue;
      end if;

      payload := resp.content::jsonb;
      ok_count := 0;

      for job in select * from jsonb_array_elements(payload -> 'data') loop
        insert into "job_listings" (
          external_id, category, category_name, title, url, apply_url,
          company, company_logo, location, salary_text,
          salary_min, salary_max, type, description, posted_at, fetched_at
        ) values (
          job ->> 'id',
          cat,
          job -> 'category' ->> 'name',
          coalesce(job ->> 'title', 'Untitled'),
          coalesce(job ->> 'url', ''),
          job ->> 'apply_url',
          coalesce(job -> 'company' ->> 'name', 'Unknown'),
          job -> 'company' ->> 'logo_url',
          job ->> 'location',
          job ->> 'salary_text',
          case when job ->> 'salary_min' ~ '^[0-9]+$' then (job ->> 'salary_min')::integer end,
          case when job ->> 'salary_max' ~ '^[0-9]+$' then (job ->> 'salary_max')::integer end,
          job ->> 'type',
          coalesce(job ->> 'description', ''),
          job ->> 'posted_at',
          now()
        )
        on conflict (external_id) do update set
          category_name = excluded.category_name,
          title = excluded.title,
          url = excluded.url,
          apply_url = excluded.apply_url,
          company = excluded.company,
          company_logo = excluded.company_logo,
          location = excluded.location,
          salary_text = excluded.salary_text,
          salary_min = excluded.salary_min,
          salary_max = excluded.salary_max,
          type = excluded.type,
          description = excluded.description,
          posted_at = excluded.posted_at,
          fetched_at = now();

        ok_count := ok_count + 1;
      end loop;

      return query select cat, ok_count, false;
    exception when others then
      return query select cat, 0, true;
    end;
  end loop;

  delete from "job_listings" where "fetched_at" < now() - interval '7 days';
end;
$$;

revoke all on function refresh_job_listings() from public;
grant execute on function refresh_job_listings() to postgres;

-- Security hardening (advisors): handle_new_user is only invoked by its trigger,
-- so it must not be executable via the API by anon/authenticated.
revoke execute on function handle_new_user() from public, anon, authenticated;
grant execute on function handle_new_user() to supabase_auth_admin;

-- Security hardening (advisors): pin search_path on the shared updated_at trigger.
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cron schedules (upsert-style: same job name overwrites)
-- ---------------------------------------------------------------------------
select cron.schedule(
  'refresh-jobs-nightly',
  '0 6 * * *',
  $$ select refresh_job_listings(); $$
);

select cron.schedule(
  'refresh-jobs-evening',
  '0 18 * * *',
  $$ select refresh_job_listings(); $$
);

select cron.schedule(
  'expire-stale-streaks',
  '5 0 * * *',
  $$ update profiles set current_streak_days = 0
     where current_streak_days > 0
       and last_active_day < (current_date - 2); $$
);
