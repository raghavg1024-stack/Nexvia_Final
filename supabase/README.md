# Supabase Setup

This folder owns the database schema for Career OS. Migrations run in filename order.

## 1. Create a project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. From **Project Settings → API**, copy `Project URL` and the `anon` `public` key.

## 2. Run the migrations

Apply `supabase/migrations/*.sql` in order, either way:

- **SQL Editor**: open the SQL editor in the dashboard and paste the contents of
  `0001_init.sql`, then `0002_storage.sql`.
- **CLI** (if you have the Supabase CLI linked to the project):

  ```bash
  supabase db push
  ```

  Or apply individual files:

  ```bash
  supabase db execute --file supabase/migrations/0001_init.sql
  supabase db execute --file supabase/migrations/0002_storage.sql
  ```

The migrations are idempotent-ish: rerunning them is safe (tables use
`create table if not exists`, seeds are guarded by `exists`, and policies are
dropped before being recreated).

## 3. Configure the app

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
   the values from **Project Settings → API** (step 1).

`SUPABASE_SERVICE_ROLE_KEY` is optional and used only by server-side/admin
scripts — never in client code.

## What the migrations create

- **`0001_init.sql`** — `profiles`, `assessments`, `analysis_reports`,
  `careers`, `career_recommendations`, `roadmaps`, `milestones`, `courses`,
  `xp_transactions`, `badges`, `user_badges`; RLS + ownership policies; an
  `updated_at` trigger; a signup trigger that auto-creates profiles; and seed
  data for all 8 careers and 8 badges.
- **`0002_storage.sql`** — a public `avatars` storage bucket with public read
  and owner-only write policies.
