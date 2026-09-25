import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProfile, getSession } from "@/lib/profile";
import ProfileEditForm from "./profile-form";
import { Reveal } from "../_components/motion";

export const metadata: Metadata = {
  title: "Profile",
};

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not set";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-accent/30">
      <p className={`font-display text-2xl ${color}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getSession();
  const profile = await getProfile();

  if (!user) redirect("/login");

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    "Nexvia User";
  const email = profile?.email ?? user.email ?? "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const coreProfileFields = [
    profile?.full_name,
    profile?.education_level,
    profile?.major,
    profile?.learning_style,
    profile?.study_hours_per_week,
    profile?.goals,
    profile?.skill_tags?.length ? profile.skill_tags : null,
  ];
  const completedFields = coreProfileFields.filter((value) => value !== null && value !== undefined && value !== "").length;
  const profileCompleteness = Math.round((completedFields / coreProfileFields.length) * 100);

  return (
    <div className="min-h-screen bg-background px-4 py-12 text-slate-300">
      <div className="mx-auto max-w-3xl space-y-6">
        {profileCompleteness < 100 && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
            <p className="text-sm font-semibold text-amber-200">Profile {profileCompleteness}% complete</p>
            <p className="mt-1 text-sm text-slate-400">
              Add your education, skills, goals, learning style, and weekly study time for more reliable matches and roadmaps.
            </p>
          </div>
        )}
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            {/* Gradient header */}
            <div className="h-24 bg-gradient-to-r from-accent/20 via-violet-500/20 to-sky-500/20" />

            <div className="-mt-10 px-6 pb-6">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-accent text-xl font-bold text-white shadow-xl shadow-accent/20">
                  {initials}
                </div>
                <div className="pb-1">
                  <h1 className="font-display text-xl uppercase tracking-tight text-foreground">
                    {displayName}
                  </h1>
                  <p className="text-sm text-slate-400">{email}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <StatCard
                  value={profile?.level ?? 1}
                  label="Level"
                  color="text-accent"
                />
                <StatCard
                  value={profile?.xp ?? 0}
                  label="XP"
                  color="text-violet-500"
                />
                <StatCard
                  value={profile?.coins ?? 0}
                  label="Coins"
                  color="text-amber-500"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
              Details
            </h2>
            <dl className="mt-4 space-y-0 divide-y divide-line">
              {[
                { label: "Education level", value: formatLabel(profile?.education_level) },
                { label: "Current marks", value: profile?.current_percentage ? `${profile.current_percentage}%` : "Not set" },
                { label: "CGPA", value: profile?.cgpa ?? "Not set" },
                { label: "Recruiter matching", value: profile?.open_to_recruiters ? "Opted in" : "Private" },
                { label: "Learning style", value: formatLabel(profile?.learning_style) },
                { label: "Study hours per week", value: profile?.study_hours_per_week ?? "Not set" },
                { label: "Current streak", value: `${profile?.current_streak_days ?? 0} days` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3">
                  <dt className="text-sm text-slate-400">{item.label}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
              <div className="py-3">
                <dt className="text-sm text-slate-400">Goals</dt>
                <dd className="mt-1 text-sm text-slate-300">
                  {profile?.goals || "Not set"}
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <ProfileEditForm profile={profile} />
        </Reveal>
      </div>
    </div>
  );
}
