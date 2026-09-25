import Link from "next/link";
import { redirect } from "next/navigation";
import { levelFromXp, xpForLevel } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";
import HowItWorks, { type HowItWorksStep } from "@/components/ui/how-it-works";

const quickActions = [
  {
    href: "/assessment",
    title: "Take Assessment",
    description: "Discover your strengths and ideal career paths.",
    icon: "✦",
    gradient: "from-accent to-blue-500",
  },
  {
    href: "/roadmap",
    title: "My Roadmap",
    description: "See your personalized learning plan.",
    icon: "◈",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    href: "/mentor",
    title: "AI Mentor",
    description: "Get guidance from your AI career mentor.",
    icon: "✧",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    href: "/resume-analysis",
    title: "Resume Analysis",
    description: "Get role-specific ATS and skill-gap feedback.",
    icon: "▤",
    gradient: "from-cyan-500 to-violet-500",
  },
  {
    href: "/community",
    title: "Community",
    description: "Join study groups and learn with peers.",
    icon: "❋",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    href: "/certificates",
    title: "Certificates",
    description: "View your earned career certificates.",
    icon: "✓",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    href: "/readiness",
    title: "Career Readiness",
    description: "Check how ready you are for the job market.",
    icon: "◎",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    href: "/jobs",
    title: "Internships & Jobs",
    description: "Find verified opportunities matched to your profile.",
    icon: "⚡",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    href: "/academia",
    title: "Academia Workspace",
    description: "See how institutions close classroom-to-career skill gaps.",
    icon: "▦",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    href: "/profile",
    title: "Profile",
    description: "Update your goals and learning style.",
    icon: "●",
    gradient: "from-teal-500 to-emerald-400",
  },
];

const nexviaJourney: HowItWorksStep[] = [
  {
    title: "Complete your profile",
    description: "Add your interests, current skills, education and career goals so Nexvia understands your starting point.",
    tone: "cyan",
  },
  {
    title: "Take the assessment",
    description: "Answer the career questions honestly to identify your strengths, work preferences and best-fit career paths.",
    tone: "blue",
  },
  {
    title: "Choose your direction",
    description: "Review each explained career match, compare alternatives and select the career you want to pursue.",
    tone: "amber",
  },
  {
    title: "Follow your roadmap",
    description: "Start the first unlocked activity, finish its learning task and mark it complete to unlock the next step.",
    tone: "blue",
  },
  {
    title: "Prove your readiness",
    description: "Build projects, improve your resume, practise interviews and apply to opportunities matched to your chosen field.",
    tone: "green",
  },
];

function LevelRing({ level, progress }: { level: number; progress: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--warning)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-2xl text-foreground">{level}</p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Level
        </p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let user: { id: string; email?: string | null } | null = null;
  let profile: {
    full_name: string | null;
    email: string | null;
    xp: number;
    coins: number;
    level: number;
    current_streak_days: number;
    longest_streak_days: number;
    last_active_day: string | null;
  } | null = null;
  let transactions: {
    id: string;
    amount: number;
    reason: string;
    created_at: string;
  }[] = [];
  let assessment: { status: string } | null = null;
  let readiness: {
    overall: number;
    suggestions: string[];
  } | null = null;
  let encouragements: {
    id: string;
    message: string;
    created_at: string;
  }[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser ?? null;
    if (user) {
      const [
        { data: p },
        { data: t },
        { data: a },
        { data: readinessRow },
        { data: familyNotes },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, email, xp, coins, level, current_streak_days, longest_streak_days, last_active_day"
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("xp_transactions")
          .select("id, amount, reason, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("assessments")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("career_readiness")
          .select("overall, suggestions")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("parent_encouragements")
          .select("id, message, created_at")
          .eq("student_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      profile = p;
      transactions = t ?? [];
      assessment = a;
      readiness = readinessRow ?? null;
      encouragements = familyNotes ?? [];
    }
  } catch {}

  if (!user) {
    redirect("/login");
  }

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] ||
    profile?.email?.split("@")[0] ||
    "there";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? levelFromXp(xp);
  const coins = profile?.coins ?? 0;
  const streak = profile?.current_streak_days ?? 0;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
  );
  const assessmentDone = assessment?.status === "completed";

  return (
    <div className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <Reveal>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-slate-400">
          Here is how your career journey is going today.
        </p>
      </Reveal>

      {/* Stats row */}
      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <div className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <p className="text-sm font-medium text-slate-400">Level</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-display text-3xl text-foreground">{level}</p>
              <LevelRing level={level} progress={progressPct} />
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {progressPct}% to level {level + 1}
            </p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-violet-500/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <p className="text-sm font-medium text-slate-400">Experience Points</p>
            <p className="mt-3 font-display text-3xl text-foreground">{xp}</p>
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {nextLevelXp - xp} XP to level {level + 1}
              </p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-amber-500/40">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <p className="text-sm font-medium text-slate-400">Coins</p>
            <p className="mt-3 font-display text-3xl text-foreground">{coins}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <p className="text-sm text-slate-400">Spend on the Rewards Shop</p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-rose-500/40">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-rose-500/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <p className="text-sm font-medium text-slate-400">Daily Streak</p>
            <p className="mt-3 font-display text-3xl text-foreground">
              {streak} <span className="align-middle text-2xl">🔥</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < streak ? "bg-rose-500" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Best: {profile?.longest_streak_days ?? 0} days
              </p>
            </div>
          </div>
        </StaggerItem>
      </Stagger>

      {/* Assessment nudge */}
      {!assessmentDone && (
        <Reveal>
          <div className="mt-6 overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-r from-accent-soft via-accent-soft to-accent/10 p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-xl text-white shadow-lg shadow-accent/30">
                  ✦
                </div>
                <div>
                  <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
                    Complete your career assessment
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Unlock personalized career recommendations and your
                    learning roadmap.
                  </p>
                </div>
              </div>
              <Link
                href="/assessment"
                className="shrink-0 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110"
              >
                Start now
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {encouragements.length > 0 && (
        <Reveal>
          <section className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Family encouragement
            </p>
            <blockquote className="mt-3 text-base leading-7 text-foreground">
              “{encouragements[0].message}”
            </blockquote>
            <p className="mt-2 text-xs text-slate-400">
              Sent {new Date(encouragements[0].created_at).toLocaleDateString()}
            </p>
            <Link
              href={`/parent/dashboard?student=${encodeURIComponent(user.id)}`}
              className="mt-4 inline-flex text-sm font-semibold text-violet-300 hover:text-white"
            >
              View family notes
            </Link>
          </section>
        </Reveal>
      )}

      <Reveal className="mt-12">
        <HowItWorks steps={nexviaJourney} />
      </Reveal>

      {/* Quick actions */}
      <Reveal className="mt-12 flex items-baseline gap-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
          Quick actions
        </h2>
      </Reveal>
      <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <StaggerItem key={action.href}>
            <Link
              href={action.href}
              className="group relative block overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-slate-200"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-accent-soft opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-lg text-white shadow-lg`}
              >
                {action.icon}
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-accent">
                {action.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{action.description}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Readiness banner */}
      {readiness && (
        <Reveal>
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xl">
                  ◎
                </div>
                <div>
                  <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
                    Career Readiness
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Your overall readiness score is{" "}
                    <span className="font-semibold text-emerald-600">
                      {readiness.overall}%
                    </span>
                    {readiness.suggestions?.length ? (
                      <>
                        {" "}
                        with {readiness.suggestions.length} area
                        {readiness.suggestions.length === 1 ? "" : "s"} to work
                        on.
                      </>
                    ) : (
                      ". Keep it up!"
                    )}
                  </p>
                </div>
              </div>
              <Link
                href="/readiness"
                className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
              >
                View Readiness
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* Recent XP */}
      <Reveal className="mt-12 flex items-baseline gap-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
          Recent XP activity
        </h2>
      </Reveal>
      {transactions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-card p-8 text-center">
          <p className="text-slate-400">
            No XP earned yet. Take the assessment or check in daily to start
            earning.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-accent-soft/30"
            >
              <div>
                <p className="font-medium text-foreground">{tx.reason}</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-500">
                +{tx.amount} XP
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
