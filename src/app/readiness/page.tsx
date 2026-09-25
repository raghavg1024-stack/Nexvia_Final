import { redirect } from "next/navigation";
import { getReadiness } from "@/lib/readiness";
import { createClient } from "@/lib/supabase/server";
import type { CareerReadinessScore } from "@/lib/types";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career Readiness",
};

const CATEGORIES: {
  key: keyof Pick<
    CareerReadinessScore,
    | "technical_skills"
    | "communication"
    | "projects"
    | "resume_quality"
    | "interview_readiness"
  >;
  label: string;
}[] = [
  { key: "technical_skills", label: "Technical skills" },
  { key: "communication", label: "Communication" },
  { key: "projects", label: "Projects" },
  { key: "resume_quality", label: "Resume quality" },
  { key: "interview_readiness", label: "Interview readiness" },
];

function ScoreRing({ value }: { value: number }) {
  const degrees = Math.round((value / 100) * 360);
  return (
    <div
      className="relative flex h-40 w-40 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#6366f1 ${degrees}deg, #262b3d ${degrees}deg 360deg)`,
      }}
    >
      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card">
        <span className="font-display text-4xl text-slate-100">{value}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-semibold text-accent">{value}/100</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default async function ReadinessPage() {
  let authed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = !!user;
  } catch {}
  if (!authed) redirect("/login");

  const score = await getReadiness();
  if (!score) redirect("/login");

  return (
    <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header>
        <Reveal>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
            Career Readiness
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            A snapshot of how ready you are for your target career, based on your
            activity across Nexvia.
          </p>
        </Reveal>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Reveal>
          <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-card p-6">
            <p className="text-sm font-medium text-slate-400">Overall readiness</p>
            <div className="mt-6">
              <ScoreRing value={score.overall} />
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Last updated {new Date(score.updated_at).toLocaleDateString()}
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
            <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
              Skill areas
            </h2>
            <Stagger className="mt-5 space-y-6">
              {CATEGORIES.map((category) => (
                <StaggerItem key={category.key}>
                  <ScoreBar
                    label={category.label}
                    value={score[category.key]}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <section className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
            Suggested next steps
          </h2>
          {score.suggestions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Keep learning and your readiness profile will update as you go.
            </p>
          ) : (
            <Stagger className="mt-4 space-y-3">
              {score.suggestions.map((suggestion, index) => (
                <StaggerItem key={index}>
                  <li className="flex items-start gap-3 rounded-xl border border-line bg-slate-800 px-4 py-3 transition-colors hover:border-accent/30">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                      {index + 1}
                    </span>
                    <p className="prose prose-invert prose-sm max-w-none text-slate-300">{suggestion}</p>
                  </li>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      </Reveal>
    </main>
  );
}
