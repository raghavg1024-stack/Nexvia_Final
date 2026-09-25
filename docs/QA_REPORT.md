# QA Report — Career OS MVP

Date: 2026-08-14
Engineer: QA / Review Engineer

## Checks run

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | PASS (0 errors, 0 warnings) |
| Type-check | `npx tsc --noEmit` | PASS |
| Build | `npm run build` | PASS (11 routes + proxy) |
| Proxy correctness | read `src/proxy.ts` vs Next 16 docs | PASS (see fixes) |
| Schema cross-check | app columns vs `supabase/migrations/0001_init.sql` | PASS (all columns match) |
| Ownership / duplicates | glob for `layout.tsx`, `page.tsx`, route handlers | PASS (single `src/app/layout.tsx`, single `src/app/page.tsx`, no duplicates) |
| Security grep | `SUPABASE_SERVICE_ROLE_KEY`, hardcoded keys, secret logging | PASS |

## Issues found + fixed

### 1. Proxy auth bypass on `/assessment`, `/roadmap`, `/profile` (real bug) — FIXED

`src/proxy.ts` — the `config.matcher` correctly listed `/assessment/:path*`, `/roadmap/:path*`, and `/profile/:path*` as protected, but the guard logic only redirected unauthenticated users away from `/dashboard`. An unauthenticated visitor could reach the assessment, roadmap, and profile pages directly.

Fixed by adding an `isProtectedRoute` check covering `/dashboard`, `/assessment`, `/roadmap`, `/profile` so unauthenticated users are redirected to `/login` for all of them. `/login` and `/signup` still redirect authenticated users to `/dashboard`. The file uses the Next 16 `proxy` export (not `middleware`) and a `config.matcher`, which matches the Next 16 docs in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

## Review findings (no change needed)

- **Auth flow** (`src/app/(auth)/actions.ts`, `src/app/auth/callback/route.ts`): signup does `signUp` + `profiles` upsert (idempotent on conflict), login does `signInWithPassword`, both redirect correctly. Callback exchanges code for session and redirects. Logout (`src/lib/rewards.ts:logout`) signs out and redirects to `/`. No dangerous operations; no service role used.
- **Assessment flow** (`src/lib/assessment.ts`, `src/app/assessment|analysis|recommendations`): `saveProgress`/`completeAssessment` upsert `assessments` with columns matching `0001_init.sql` (`status`, `current_question_index`, `responses`, `started_at`, `completed_at`). `completeAssessment` writes `analysis_reports` and `career_recommendations` (all columns exist in schema). Redirects: assessment page → `/analysis`, `selectCareer` → `/roadmap`. `matchCareers` usage is type-safe.
- **Roadmap** (`src/lib/roadmap.ts`): status transitions follow `VALID_*` maps (`pending→in_progress→completed`, `locked→in_progress→completed`); `roadmaps.status` uses `draft`/`completed` which exist in the schema check constraint. Course/milestone inserts match `milestones`/`courses` columns exactly. Ownership checks prevent cross-user updates.
- **Dashboard/Rewards** (`src/app/dashboard`, `src/app/rewards`, `src/lib/rewards.ts`, `src/app/layout.tsx`, `src/app/page.tsx`): all queries are RLS-safe (filtered by `user.id`); no SQL injection (Supabase query builder); no secrets in client components (only `NEXT_PUBLIC_*`). `"use server"` files only export async functions. XP/level/badge logic is consistent with `src/lib/data.ts` (`XP_RULES`, `levelFromXp`, `BADGES`, `matchCareers`).
- **Supabase schema**: every column referenced by app code exists in `0001_init.sql` with exact names (verified `profiles`, `assessments`, `analysis_reports`, `career_recommendations`, `roadmaps`, `milestones`, `courses`, `xp_transactions`, `badges`, `user_badges`).
- **Security**: no `SUPABASE_SERVICE_ROLE_KEY` in code (only mentioned in `.env.example` as a comment). Only `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are read by app code. No `console.log` of secrets.

## Issues still open

None critical. Build/lint/typecheck are all green.

Minor non-blocking observations (no change made, per conservative scope):
- `src/lib/assessment.ts` uses `user!.id` after a `redirect()` guard (`redirect` throws, so it's safe, but non-null assertions are brittle style).
- `src/lib/roadmap.ts:105` casts `roadmap.career_title as string` — column is `text not null` so safe.

## Verdict

**PASS.** `npm run lint`, `npx tsc --noEmit`, and `npm run build` are all green. One real bug (proxy not enforcing protection on `/assessment`, `/roadmap`, `/profile`) was found and fixed. All app↔schema column references match the migrations; auth, assessment, roadmap, and rewards flows are consistent and RLS-safe. No secrets in code. Ready to ship.

---

# QA Report — Sprint 2 (Certificates, Readiness, AI Mentor, Community, Integration/XP)

Date: 2026-08-14
Engineer: QA / Review Engineer

## Checks run

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | FIXED → PASS (0 errors, 0 warnings) |
| Type-check | `npx tsc --noEmit` | PASS |
| Build | `npm run build` | FIXED → PASS (15 routes + proxy, all dynamic) |
| Proxy correctness | read `src/proxy.ts` | PASS (all Sprint 2 routes covered) |
| Schema cross-check | app columns vs `supabase/migrations/0003_features.sql` | 1 mismatch found + FIXED (see below) |
| RLS cross-check | `study_group_members` SELECT policy, profiles own-row | PASS |
| XP wiring | `src/lib/{roadmap,assessment}.ts` → `@/lib/{rewards,certificates}` | PASS (try/catch, no circular import) |
| Mentor schema | `src/lib/mentor.ts` vs `mentor_messages` | PASS |
| Readiness/certificates schema | `src/lib/{readiness,certificates}.ts` vs 0003 | PASS |
| layout.tsx | nav links, keys, Server Component | PASS |
| Security grep | service-role keys, hardcoded secrets, `NEXT_PUBLIC` misuse, client→server imports | PASS |

## Issues found + fixed

### 1. Build error: `generateMentorReply` exported from a `"use server"` module (real bug) — FIXED

`src/lib/mentor.ts:588` — `generateMentorReply` was exported from a `"use server"` file. In Next.js every export of a `"use server"` module is treated as a Server Action, which must be async. The build failed with `Error: Server Actions must be async functions.` The function is a pure, rule-based helper used only internally (called at `mentor.ts:91`), so the `export` keyword was removed. It is not imported anywhere else.

### 2. Community ↔ schema mismatch: `user_name` column missing (real bug) — FIXED

`src/lib/community.ts` inserts, selects, and denormalizes `user_name` on `study_group_messages` (see `community.ts:274`, `community.ts:335`, `community.ts:338`), but `supabase/migrations/0003_features.sql` created `study_group_messages` without that column. Added a guarded `do $$ ... if not exists (information_schema.columns) then alter table ... end if` block to `0003_features.sql` so it is re-run safe. Without this, inserts would fail at runtime with "column user_name does not exist".

### 3. Lint error: setState in effect on mentor page (real lint error) — FIXED

`src/app/mentor/page.tsx:54` — `react-hooks/set-state-in-effect` flagged synchronous `setMessages([])` inside a `useEffect`. Replaced with the existing async-fetch pattern already used by the mount effect (`getChat().then(...)`), which is the rule-compliant approach (async callback, not synchronous setState in the effect body). Behavior is unchanged: after a successful clear the server has no rows, so the refetch returns `[]`.

### 4. Lint warnings in `src/lib/readiness.ts` — FIXED

- `readiness.ts:45` — destructured `key` never used in the `sorted.map` callback. Removed it from the destructure.
- `readiness.ts:101/122` — `totalCourses` was assigned (`courses.length`) but never read. Removed the dead variable and its assignment. (`completedCourses` is the value actually used in scoring.)

## Cross-agent reconciliation

- **community vs schema**: `study_group_members` has a SELECT policy — verified `0003_features.sql:156` (`study_group_members_select_all` for `select to authenticated using (true)`). `study_group_messages` now has `user_name text` (fix #2). Group message SELECT/INSERT policies are membership-scoped (`0003:175-192`).
- **profiles join visibility**: community agent joins `profiles(full_name)` for member/message names (`community.ts:230`, `community.ts:274`), but `profiles` RLS is own-row-only (`0001_init.sql:205`). The join returns `null` for other users and code falls back to `user_name` or "Group member" (`community/[groupId]/page.tsx:92`, `:124`). Acceptable per design — RLS left unchanged (own-row-only is a safe default).
- **certificates + readiness**: `awardCertificate` (`certificates.ts:37`) writes exactly the columns in `0003` (`user_id, roadmap_id, title, credential_id, issued_at`); `getReadiness` (`readiness.ts:48`) matches `career_readiness` columns exactly (`technical_skills, communication, projects, resume_quality, interview_readiness, overall, suggestions, user_id, updated_at`).
- **mentor**: `src/lib/mentor.ts` reads/writes only `mentor_messages(id, user_id, role, content, created_at)` — matches `0003:22-31`. No API keys (rule-based). ✓
- **XP wiring**: `roadmap.ts` wraps `grantReward` (`:1227`, `:1257`) and `awardCertificate` (`:1267`) in `try/catch`, importing from `@/lib/rewards` and `@/lib/certificates`. `assessment.ts` wraps `grantReward` (`:287`, `:350`). No circular import: `rewards.ts` imports only `data`/`types`/`supabase/server`; `certificates.ts` imports only `types`/`supabase/server`. ✓
- **proxy.ts**: matcher + `isProtectedRoute` include `/mentor`, `/community`, `/certificates`, `/readiness`, `/dashboard`, `/assessment`, `/roadmap`, `/profile`, `/login`, `/signup` (`proxy.ts:36-69`). ✓
- **layout.tsx**: nav has Dashboard, My Roadmap, AI Mentor, Community, Certificates, Career Readiness, Rewards, Profile — all keyed by unique `href` (`layout.tsx:23-32`); still an async Server Component. ✓

## Security

- No `SUPABASE_SERVICE_ROLE_KEY`, hardcoded secrets, or secret logging anywhere in `src/`.
- Only `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are read (correct public usage, `proxy.ts:8-9`, `supabase/*.ts`).
- No `"use client"` component imports `@/lib/supabase/server` (only server pages/route handlers/actions do). Client components import server-action modules (`@/lib/mentor`, `@/lib/community`) which is the supported pattern for `useActionState`.

## Open issues (non-blocking)

- `src/lib/assessment.ts:225` and elsewhere use `user!.id` after a `redirect()` guard — `redirect` throws, so it is safe, but the non-null assertion is brittle style (pre-existing Sprint 1 note).
- `src/app/mentor/page.tsx:54` clear-refetch adds a lightweight `getChat()` round-trip after clearing instead of an in-place `[]` reset — deliberate trade-off to satisfy the lint rule; no behavioral impact.
- `profiles` own-row RLS means community member names fall back to `user_name`/"Group member" for non-self members; acceptable per design (no RLS change).

## Verdict

**PASS.** Sprint 2 gate is green after four fixes: the server-action build break (`mentor.ts`), the missing `study_group_messages.user_name` column (migration), a `set-state-in-effect` lint error (mentor page), and two dead-code lint warnings (`readiness.ts`). All Sprint 2 features (certificates, readiness, mentor, community, XP wiring) are reconciled against the 0003 schema and RLS policies; proxy route coverage and nav are complete; no secrets in code. Ready to ship.
