# Career OS — Project State & Handover Document

> Generated: 2026-08-14
> Updated: 2026-08-16 (Sprint 3: CompIT-style redesign — light theme, typography, 3D hero)
> Purpose: Full record of everything built, configured, and saved so nothing is lost if a window/chat is closed.

---

## 1. The App — Where It Lives

| Item | Value |
|------|-------|
| Project folder | `C:\Users\ragha\career-os` |
| Tech stack | Next.js 16 (App Router, `src/`) + TypeScript (strict) + Tailwind CSS v4 |
| Database | Supabase (Postgres) — hosted in the cloud |
| Package manager | npm |
| Run it | `cd C:\Users\ragha\career-os && npm run dev` → `http://localhost:3000` |

**The code is on your hard drive in that folder. It does NOT live in the chat. Closing opencode deletes nothing.**

## 2. Git History (saved commits)

```
a05c9bb Sprint 3: CompIT-style redesign - light theme, typography, 3D hero
82233bf Add project state & handover doc
95907ae Sprint 2: AI Mentor, Community, Certificates, Career Readiness + XP wiring
cf197b6 Sprint 1: Core MVP - auth, assessment, career recs, roadmap, dashboard, rewards
```

Check anytime with: `cd C:\Users\ragha\career-os && git log --oneline`

## 3. Sprint 3 — CompIT-style Redesign (committed ✅)

Inspired by the **CompIT** IT-team landing concept (Nicolas Jey, Behance/Pinterest) — a light, futuristic design with numbered sections, bold uppercase headings, and a 3D animated hero.

### Design system (`src/app/globals.css`)
- **Light theme**: background `#f5f6f8`, text `#303a41`, cards `#ffffff`, border `#e4e7ec`
- **Accent**: blue `#2d6bff` + soft tint `#eaf0ff`
- **Display font**: **Russo One** (bold uppercase headings) loaded via `next/font/google` as `--font-display`
- Tailwind tokens exposed via `@theme inline`: `bg-background`, `text-foreground`, `bg-card`, `border-line`, `text-accent`, `bg-accent-soft`
- `@tailwindcss/typography` plugin registered (`prose`)

### What changed
| Area | Files |
|------|-------|
| Theme + keyframes | `src/app/globals.css` (light tokens + 3D animation keyframes) |
| App shell | `src/app/layout.tsx` (light sticky header, numbered nav 01–08, Russo One) |
| Landing page | `src/app/page.tsx` (numbered hero / services / how-it-works / CTA) |
| 3D hero scene | `src/app/_components/hero-scene.tsx` (new) |
| Logo | `src/app/_components/nexvia-logo.tsx` (dark text for light bg) |
| Mentor typography | `src/app/_components/mentor-reply.tsx` (new — prose `<ul>/<li>` renderer) |
| Motion wrappers | `src/app/_components/motion.tsx` (new) |
| All pages restyled | auth, dashboard, rewards, readiness, assessment, analysis, recommendations, roadmap, mentor, community, certificates, profile |
| Shared forms/buttons | check-in-button, logout-button, create-group-form, group-chat, profile-form, status-toggle |

### 3D animated hero (pure CSS, no new dependencies)
`src/app/_components/hero-scene.tsx` — shows on `lg+` screens beside the hero text:
- **Spinning 3D wireframe cube** (6 glowing faces, `preserve-3d`, `cube-spin` animation)
- Floating motion (`float-y`)
- Orbiting perspective rings, opposite rotation (`orbit-ring`, `orbit-ring-reverse`)
- Scrolling perspective grid floor (`grid-scroll`)
- Rising particle dots (`particle-rise`)

> Note: An earlier iteration swapped the cube for a 3D globe (matching a screenshot), but that was reverted per request — the cube is the current state.

### Typography (`@tailwindcss/typography`)
- `src/app/_components/mentor-reply.tsx` turns the AI mentor's plain-text replies (bullet lines) into real `<ul>/<li>` prose markup — styled with `prose prose-slate prose-sm`
- Long-form text on analysis, recommendations, readiness, and landing uses `prose` classes

## 4. What's Been Built (Sprint 1 + 2, still live)

- **Auth**: signup, login, email-confirmation callback, logout
- **Profile**: view/edit profile
- **AI Career Assessment**: 11-question wizard → analysis report + career matches
- **Roadmap**: milestones × courses timeline, status transitions, unlock flow
- **Dashboard**: Level / XP / Coins / Streak stats, quick actions
- **Rewards**: XP, coins, levels, daily check-in, 8 badges, XP ledger, rewards shop placeholder
- **AI Mentor**: `/mentor` rule-based coach
- **Community**: `/community` study groups, member counts, group chat
- **Certificates**: earned on roadmap completion, unique credential ID
- **Career Readiness**: 0–100 score + AI suggestions
- **XP wiring**: courses/milestones/roadmap/assessment/career selection auto-grant XP

### Routes (all pass production build)
`/` `/login` `/signup` `/auth/callback` `/dashboard` `/profile` `/assessment` `/analysis` `/recommendations` `/roadmap` `/rewards` `/mentor` `/community` `/community/[groupId]` `/certificates` `/readiness`

## 5. Supabase Setup Status

| Item | Status |
|------|--------|
| Project ref | `ufzsomqbndjggyswsnlg` |
| MCP server | Configured + OAuth authenticated ✅ |
| Migrations | `0001_init.sql`, `0002_storage.sql`, `0003_features.sql` — **APPLIED ✅** |
| App env keys | `C:\Users\ragha\career-os\.env.local` (URL + anon key) ✅ |

Schema: 17 tables with RLS + `avatars` storage bucket. Seed data verified live: 8 careers + 8 badges.

**User account**: `raghavg1024@gmail.com` (confirmed). User id: `ff680c31-060c-4e17-9385-95c7375d8c1b`.

## 6. Verification

```bash
npx tsc --noEmit   # ✅ clean
npm run lint       # ✅ clean
npm run build      # ✅ production build passes
```

## 7. Useful Commands

```bash
# Start dev server
cd C:\Users\ragha\career-os && npm run dev

# Type-check / lint / build (Definition of Done)
npx tsc --noEmit
npm run lint
npm run build

# See git history
git log --oneline
```

## 8. Safety Net

- Code = on disk + git commits. ✅
- Supabase schema = files in `supabase/migrations/` (re-runnable, idempotent). ✅
- Auth/login for MCP = persisted by opencode. ✅
- Cloud DB = Supabase servers. ✅

**Nothing is lost by closing this window. Everything listed above already exists on your machine or in your Supabase account.**

_Note: the anon key lives in `.env.local` (not pasted here) — never commit it. If `.env.local` is lost, re-create it from Supabase Dashboard → Settings → API._