import { redirect } from "next/navigation";
import { BADGES, levelFromXp, xpForLevel } from "@/lib/data";
import { getRewardsState } from "@/lib/rewards";
import { CheckInButton } from "../_components/check-in-button";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";

function todayString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export default async function RewardsPage() {
  const state = await getRewardsState();
  if (!state.profile) {
    redirect("/login");
  }

  const { profile, earned, transactions } = state;
  const xp = profile.xp;
  const level = profile.level || levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
  );
  const checkedInToday = profile.last_active_day === todayString();
  const earnedMap = new Map(earned.map((entry) => [entry.badge_key, entry.earned_at]));

  return (
    <div className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <Reveal>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
          Rewards
        </h1>
        <p className="mt-2 text-slate-400">
          Keep the momentum going. Check in daily, earn XP, and unlock badges.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <section className="relative overflow-hidden rounded-2xl border border-line bg-card p-6">
            <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
              Level progress
            </h2>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-4xl text-foreground">{xp}</p>
                <p className="mt-1 text-sm text-slate-400">total XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-accent">Level {level}</p>
                <p className="text-sm text-slate-400">
                  {xpForLevel(level + 1) - xp} XP to level {level + 1}
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Level {level}</span>
              <span>{progressPct}%</span>
              <span>Level {level + 1}</span>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <section className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6">
            <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
              Daily streak
            </h2>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="font-display text-4xl text-foreground">
                {profile.current_streak_days}
              </p>
              <span className="text-xl" aria-hidden="true">
                🔥
              </span>
              <span className="text-sm text-slate-400">day{profile.current_streak_days === 1 ? "" : "s"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Longest streak: {profile.longest_streak_days} days
            </p>
            <div className="mt-auto pt-6">
              <CheckInButton checkedInToday={checkedInToday} />
            </div>
          </section>
        </Reveal>
      </div>

      <Reveal className="mt-14 flex items-baseline gap-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
          Badges
        </h2>
      </Reveal>
      <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((badge) => {
          const earnedAt = earnedMap.get(badge.key);
          const isEarned = Boolean(earnedAt);
          return (
            <StaggerItem key={badge.key}>
              <div
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-0.5 ${
                  isEarned
                    ? "border-accent/50 bg-accent-soft hover:shadow-xl hover:shadow-slate-200"
                    : "border-line bg-card opacity-60"
                }`}
              >
                <span
                  className={`text-3xl ${isEarned ? "" : "grayscale"}`}
                  aria-hidden="true"
                >
                  {badge.icon}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{badge.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
                <p className="mt-3 text-xs text-slate-400">
                  {isEarned && earnedAt
                    ? `Earned on ${new Date(earnedAt).toLocaleDateString()}`
                    : badge.criteria ?? `Earn ${badge.xp_required ?? 0} XP`}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal className="mt-14 flex items-baseline gap-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
          XP ledger
        </h2>
      </Reveal>
      {transactions.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-line bg-card p-6 text-slate-400">
          No XP yet. Complete your assessment or check in daily to get started.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-800"
            >
              <div>
                <p className="font-medium text-foreground">{tx.reason}</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                +{tx.amount} XP
              </span>
            </li>
          ))}
        </ul>
      )}

      <Reveal className="mt-14 flex items-baseline gap-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
          Rewards Shop
        </h2>
      </Reveal>
      <Stagger className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Premium insights",
            description: "Advanced analysis of your strengths and growth areas.",
            icon: "✦",
          },
          {
            title: "Resume reviews",
            description: "Get your resume reviewed by career experts.",
            icon: "✧",
          },
          {
            title: "Mock interviews",
            description: "Practice with realistic interview scenarios.",
            icon: "◈",
          },
        ].map((item) => (
          <StaggerItem key={item.title}>
            <div className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-amber-500/40">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-lg text-white shadow-lg">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              <span className="mt-4 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                Coming soon
              </span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
