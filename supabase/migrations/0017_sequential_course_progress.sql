alter table public.courses
  add column if not exists order_index integer;

with ranked_courses as (
  select
    id,
    row_number() over (partition by milestone_id order by ctid) - 1 as position
  from public.courses
  where order_index is null
)
update public.courses as course
set order_index = ranked.position
from ranked_courses as ranked
where course.id = ranked.id;

alter table public.courses
  alter column order_index set default 0,
  alter column order_index set not null;

create unique index if not exists courses_milestone_order_index_idx
  on public.courses (milestone_id, order_index);
