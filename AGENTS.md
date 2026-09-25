<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Career OS — Team Conventions

Product: **AI Career Operating System** (Discover Yourself. Learn Smarter. Build Your Future.)

Stack: Next.js 16 (App Router, `src/`) + TypeScript (strict) + Tailwind CSS v4 + Supabase.

## Structure (file ownership — do NOT edit files you don't own)

- `src/lib/` — shared code. Do NOT modify `types.ts`, `data.ts`, or `supabase/*` without approval from the lead.
- `src/proxy.ts` — session/route protection (Next 16 renamed `middleware.ts` → `proxy.ts`). Owned by lead.
- `supabase/migrations/` — SQL schema. Owned by the Database agent.
- Feature areas each own their own `src/app/<feature>/` folder + `src/lib/<feature>/` helpers.

## Conventions

- Server Components by default; add `"use client"` only where interactive.
- Server Actions (with `useActionState`) for mutations; use `@/lib/supabase/server` `createClient()` on the server (async `cookies()`).
- Browser client: `@/lib/supabase/client` `createClient()`.
- Import alias `@/*` → `src/*`. No comments in code unless asked. No emojis in UI unless asked.
- Tailwind v4: no `tailwind.config.ts`; theme lives in `globals.css` via `@theme`.
- No external UI libs unless approved. Keep everything dependency-light.
- Types come from `@/lib/types`. Seed/reference data from `@/lib/data` (careers, questions, badges, XP rules, `matchCareers()`).
- Next.js 16: `proxy.ts`, `cookies()`/`params()`/`searchParams()` are async, use `React.useActionState` / `"use server"` actions. Check `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Definition of Done

- Type-checks: `npx tsc --noEmit`
- Lints: `npm run lint`
- Builds: `npm run build`
- No secrets in code; env via `.env.local` (copy `.env.example`).

## Sprint 2 ownership (feature agents own their folder + `src/lib/<feature>.ts`)

- `supabase/migrations/0003_features.sql` — Database agent (certificates, mentor_messages, study_groups, study_group_members, study_group_messages, career_readiness + RLS).
- `src/app/certificates/` + `src/app/readiness/` + `src/lib/certificates.ts` + `src/lib/readiness.ts` — Certificates & Career Readiness agent.
- `src/app/mentor/` + `src/lib/mentor.ts` — AI Mentor agent (rule-based, no API keys).
- `src/app/community/` + `src/lib/community.ts` — Community agent.
- `src/app/layout.tsx`, `src/app/dashboard/page.tsx`, `src/proxy.ts` (matcher only), XP wiring in `src/lib/{roadmap,assessment,rewards}.ts`, `src/lib/data.ts` XP_RULES additions — Integration agent (single owner).
- `src/lib/types.ts` — shared; sprint 2 types already added by lead; only Integration agent may extend.
