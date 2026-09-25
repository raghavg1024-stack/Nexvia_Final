create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  role text not null check (role in ('student', 'parent', 'academia', 'industry', 'other')),
  consent boolean not null default false check (consent),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email = lower(email) and char_length(email) <= 254),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'spam')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null check (char_length(reviewer_name) between 2 and 100),
  reviewer_role text not null check (char_length(reviewer_role) between 2 and 100),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 20 and 1200),
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_approved_created_at_idx on public.reviews (is_approved, created_at desc);
create index if not exists reviews_user_id_idx on public.reviews (user_id);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

do $$
declare target record;
begin
  for target in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', target.tablename);
  end loop;
end $$;

revoke all on public.waitlist_signups, public.contact_messages, public.reviews from anon, authenticated;
grant insert on public.waitlist_signups, public.contact_messages to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

create policy "Anyone can join the waitlist"
on public.waitlist_signups for insert
to anon, authenticated
with check (consent and char_length(full_name) between 2 and 100 and email = lower(email));

create policy "Anyone can send a contact message"
on public.contact_messages for insert
to anon, authenticated
with check (char_length(name) between 2 and 100 and char_length(message) between 10 and 3000);

create policy "Approved reviews are public"
on public.reviews for select
to anon, authenticated
using (is_approved);

create policy "Users can see their own pending reviews"
on public.reviews for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can submit unapproved reviews"
on public.reviews for insert
to authenticated
with check (user_id = (select auth.uid()) and not is_approved);
