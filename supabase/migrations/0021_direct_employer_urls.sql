-- Store the employer's website separately from the aggregator listing URL.
set lock_timeout = '5s';

alter table public.job_listings
  add column if not exists company_website text;

create or replace function public.refresh_job_listings()
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
        insert into public.job_listings (
          external_id, category, category_name, title, url, apply_url,
          company, company_logo, company_website, location, salary_text,
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
          job -> 'company' ->> 'website',
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
          company_website = excluded.company_website,
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

  delete from public.job_listings where fetched_at < now() - interval '7 days';
end;
$$;

revoke all on function public.refresh_job_listings() from public, anon, authenticated;
grant execute on function public.refresh_job_listings() to postgres;
