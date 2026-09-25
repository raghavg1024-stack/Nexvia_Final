import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile";

export const metadata = { title: "Academia Workspace" };

const metrics = [
  { label: "Students skill-mapped", value: "1,248", note: "+12% this term", icon: Users, tone: "text-cyan-300" },
  { label: "Industry partners", value: "18", note: "6 active this month", icon: Building2, tone: "text-violet-300" },
  { label: "Internship-ready", value: "412", note: "Based on pathway evidence", icon: BriefcaseBusiness, tone: "text-emerald-300" },
  { label: "Placement pipeline", value: "286", note: "Students ready to be shared", icon: GraduationCap, tone: "text-amber-300" },
];

const skillGaps = [
  { skill: "Applied web development", cohort: "Computer Science · Semester 5", coverage: 58, outcome: "Frontend & full-stack roles" },
  { skill: "Data storytelling", cohort: "Data Science · Semester 4", coverage: 64, outcome: "Analytics internships" },
  { skill: "Interview communication", cohort: "All final-year cohorts", coverage: 47, outcome: "Placement readiness" },
];

const pipeline = [
  { title: "Map", description: "Assess learner interests, academic strengths, and verified skills.", icon: Target },
  { title: "Build", description: "Turn industry-demand gaps into role-specific roadmaps and projects.", icon: BarChart3 },
  { title: "Match", description: "Connect placement-ready students with internships and employer roles.", icon: BriefcaseBusiness },
];

export default async function AcademiaWorkspacePage() {
  const profile = await getProfile();
  if (!profile || profile.user_type !== "academia") redirect("/login/academia");
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.12] via-card to-violet-500/[0.08] p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200">
              <Building2 className="h-3.5 w-3.5" /> Institution workspace preview
            </span>
            <h1 className="mt-5 font-display text-3xl tracking-tight text-foreground sm:text-5xl">
              Turn classroom progress into industry readiness.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Nexvia gives academic teams a shared view of skill gaps, learner readiness, and opportunity pathways—so curriculum support can lead to internships and placements.
            </p>
          </div>
        </div>
      </Reveal>

      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <StaggerItem key={label}>
            <article className="rounded-2xl border border-line bg-card p-5 transition-transform hover:-translate-y-1">
              <Icon className={`h-5 w-5 ${tone}`} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[.14em] text-slate-500">{label}</p>
              <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
              <p className="mt-2 text-xs text-slate-400">{note}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Reveal>
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Skill-gap intelligence</p>
                <h2 className="mt-2 font-display text-2xl text-foreground">Priority areas to strengthen</h2>
              </div>
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <div className="mt-7 space-y-6">
              {skillGaps.map((gap) => (
                <div key={gap.skill}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div>
                      <h3 className="font-semibold text-slate-100">{gap.skill}</h3>
                      <p className="mt-1 text-xs text-slate-500">{gap.cohort} · {gap.outcome}</p>
                    </div>
                    <span className="text-sm font-bold text-cyan-200">{gap.coverage}% covered</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${gap.coverage}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-7 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/80">
              Preview data is illustrative. Connect institutional learner data to turn these into live cohort insights.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">Industry-aligned workflow</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">One shared pathway</h2>
            <div className="mt-7 space-y-6">
              {pipeline.map(({ title, description, icon: Icon }, index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Icon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{index + 1}. {title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal delay={0.18} className="mt-6">
        <section className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">From learning to opportunity</p>
              <h2 className="mt-2 font-display text-2xl text-foreground">Act on the evidence, not assumptions.</h2>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Role-based readiness</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Verified opportunities</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Two-way industry matching</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/readiness" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200">View readiness <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/recruiter" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90">Open industry workspace <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
