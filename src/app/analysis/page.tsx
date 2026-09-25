import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAssessment } from "@/lib/assessment";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Analysis",
};

function SkillTag({ label, variant }: { label: string; variant: "strong" | "growth" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        variant === "strong"
          ? "border border-accent/30 bg-accent-soft text-accent"
          : "border border-line bg-slate-800 text-slate-400"
      }`}
    >
      {variant === "strong" && <span className="h-1 w-1 rounded-full bg-accent" />}
      {label}
    </span>
  );
}

export default async function AnalysisPage() {
  const { assessment, analysisReport } = await getAssessment();

  if (!analysisReport || assessment?.status !== "completed") {
    redirect("/assessment");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-slate-300">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <header>
            <p className="font-display text-sm uppercase tracking-widest text-accent">
              01. Your Analysis
            </p>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
              How you learn, what you&apos;re great at, and where to grow
            </h1>
          </header>
        </Reveal>

        {/* Key insights */}
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2">
          <StaggerItem>
            <section className="rounded-2xl border border-line bg-card p-6 transition-all hover:border-accent/30">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Learning style
              </h2>
              <p className="mt-3 font-display text-lg capitalize text-foreground">
                {analysisReport.learning_style}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                We&apos;ll shape your roadmap around this.
              </p>
            </section>
          </StaggerItem>

          <StaggerItem>
            <section className="rounded-2xl border border-line bg-card p-6 transition-all hover:border-accent/30">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Study capacity
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-display text-3xl text-foreground">
                  {analysisReport.study_capacity_hours}
                </p>
                <p className="text-sm text-slate-400">hours / week</p>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Realistic time you can commit each week.
              </p>
            </section>
          </StaggerItem>

          <StaggerItem>
            <section className="sm:col-span-2 rounded-2xl border border-line bg-card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recommended pace
              </h2>
              <p className="mt-3 text-base text-foreground">
                {analysisReport.recommended_pace}
              </p>
            </section>
          </StaggerItem>
        </Stagger>

        {/* Strengths & Growth */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <section className="rounded-2xl border border-line bg-card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your strengths
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysisReport.strengths.map((strength) => (
                  <SkillTag key={strength} label={strength} variant="strong" />
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.1}>
            <section className="rounded-2xl border border-line bg-card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Growth areas
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysisReport.growth_areas.map((area) => (
                  <SkillTag key={area} label={area} variant="growth" />
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        {/* Summary */}
        <Reveal>
          <section className="mt-8 rounded-2xl border border-line bg-card p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Summary
            </h2>
            <p className="prose prose-invert prose-sm mt-3 max-w-none leading-relaxed text-slate-300">
              {analysisReport.summary}
            </p>
          </section>
        </Reveal>

        <Reveal>
          <div className="mt-10 flex justify-end">
            <Link
              href="/recommendations"
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110"
            >
              See my career matches →
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
