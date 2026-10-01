import Link from "next/link";
import { redirect } from "next/navigation";
import { levelFromXp, xpForLevel } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Clock3, Compass, MessageCircleQuestion } from "lucide-react";
import { NotificationBadge } from "@/components/ui/notification-badge";

const quickActions = [
  { href: "/roadmap", title: "Continue learning", description: "Follow your personal learning plan.", icon: BookOpenCheck },
  { href: "/mentor", title: "Ask your mentor", description: "Get help with your next career decision.", icon: Compass },
  { href: "/mock-interview", title: "Practise an interview", description: "Build confidence with focused feedback.", icon: MessageCircleQuestion },
  { href: "/jobs", title: "Explore opportunities", description: "Find roles relevant to your direction.", icon: BriefcaseBusiness },
];

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
  let unreadNotifications = 0;

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
        { count: unreadCount },
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
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
      ]);
      profile = p;
      transactions = t ?? [];
      assessment = a;
      readiness = readinessRow ?? null;
      encouragements = familyNotes ?? [];
      unreadNotifications = unreadCount ?? 0;
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
    <div className="premium-page mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Welcome back, {firstName}</h1><p className="premium-muted mt-2">Let’s make your next step count.</p></div>
        <NotificationBadge count={unreadNotifications} />
      </div>
      <section className="premium-card mt-8 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_.7fr]" aria-labelledby="next-action">
        <div><p className="premium-eyebrow">Your next step</p><h2 id="next-action" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{assessmentDone ? "Choose your career direction" : "Complete your career assessment"}</h2><p className="premium-muted mt-4 max-w-xl leading-7">{assessmentDone ? "Your assessment is complete. Review the reasons behind your career matches and choose the direction you want to explore." : "Discover your strengths and interests to unlock career matches and a learning roadmap."}</p><p className="premium-muted mt-4 flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4" />{assessmentDone ? "Review your explained matches" : "About 5 minutes to explore your strengths"}</p><Link href={assessmentDone ? "/recommendations" : "/assessment"} className="premium-button mt-6">{assessmentDone ? "Review career matches" : assessment ? "Continue assessment" : "Start assessment"}<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="rounded-xl bg-accent-soft p-6"><span className="premium-icon"><Compass className="h-6 w-6" /></span><h3 className="mt-4 text-lg font-semibold">{assessmentDone ? "Already have a direction?" : "A plan built around you"}</h3><p className="premium-muted mt-3 text-sm leading-7">{assessmentDone ? "Keep moving through your roadmap. Complete the next unlocked activity to build your skills and project evidence." : "Your answers help connect your interests to suitable careers. You stay in control of the direction you choose."}</p>{assessmentDone ? <Link href="/roadmap" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">Continue learning <ArrowRight className="h-4 w-4" /></Link> : null}</div>
      </section>
      <section aria-label="Your progress" className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="premium-card p-6"><p className="premium-muted text-sm">Learning progress</p><p className="mt-3 text-2xl font-semibold">Level {level}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-accent-soft" role="progressbar" aria-label="Progress to next level" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-accent" style={{ width: `${progressPct}%` }} /></div><p className="premium-muted mt-2 text-xs">{progressPct}% to level {level + 1}</p></div>
        <div className="premium-card p-6"><p className="premium-muted text-sm">Experience points</p><p className="mt-3 text-2xl font-semibold">{xp} XP</p><p className="premium-muted mt-4 text-xs">{Math.max(0, nextLevelXp - xp)} XP to the next level</p></div>
        <div className="premium-card p-6"><p className="premium-muted text-sm">Coins</p><p className="mt-3 text-2xl font-semibold">{coins}</p><Link href="/rewards" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-accent">Explore rewards</Link></div>
        <div className="premium-card p-6"><p className="premium-muted text-sm">Learning streak</p><p className="mt-3 text-2xl font-semibold">{streak} {streak === 1 ? "day" : "days"}</p><p className="premium-muted mt-4 text-xs">Best: {profile?.longest_streak_days ?? 0} days</p></div>
      </section>
      {encouragements.length > 0 ? <section className="premium-card mt-6 p-6"><p className="premium-eyebrow">Family encouragement</p><blockquote className="mt-3 leading-7">“{encouragements[0].message}”</blockquote><p className="premium-muted mt-2 text-xs">Sent {new Date(encouragements[0].created_at).toLocaleDateString()}</p><Link href={`/parent/dashboard?student=${encodeURIComponent(user.id)}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent">View family notes</Link></section> : null}
      <h2 className="mt-10 text-xl font-semibold">Keep your journey moving</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{quickActions.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="premium-card block p-6"><span className="premium-icon"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="premium-muted mt-2 text-sm leading-6">{description}</p></Link>)}</div>
      {readiness ? <section className="premium-card mt-6 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold">Career readiness</h2><p className="premium-muted mt-2 text-sm leading-6">Your overall readiness is <span className="font-semibold text-emerald-600">{readiness.overall}%</span>{readiness.suggestions?.length ? `, with ${readiness.suggestions.length} areas to improve.` : ". Keep building useful evidence."}</p></div><Link href="/readiness" className="premium-button-secondary shrink-0">View readiness</Link></section> : null}
      <h2 className="mt-10 text-xl font-semibold">Recent XP activity</h2>
      {transactions.length === 0 ? <div className="premium-card mt-5 p-6"><p className="premium-muted text-sm leading-7">Your progress will appear here as you complete activities.</p></div> : <ul className="premium-card mt-5 divide-y divide-line overflow-hidden">{transactions.map((tx) => <li key={tx.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="font-medium">{tx.reason}</p><p className="premium-muted mt-1 text-xs">{new Date(tx.created_at).toLocaleDateString()}</p></div><span className="shrink-0 text-sm font-semibold text-accent">{tx.amount > 0 ? "+" : ""}{tx.amount} XP</span></li>)}</ul>}
    </div>
  );
}
