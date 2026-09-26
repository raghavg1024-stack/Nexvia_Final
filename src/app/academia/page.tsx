import { Suspense } from "react";
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
import {
  getInstitutionMetrics,
  getSkillGaps,
  getCohortReadiness,
  getIndustryPartners,
  getPlacementFunnel,
  getStudentList,
} from "@/lib/academia";

export const dynamic = "force-dynamic";

const pipeline = [
  { title: "Map", description: "Assess learner interests, academic strengths, and verified skills.", icon: Target },
  { title: "Build", description: "Turn industry-demand gaps into role-specific roadmaps and projects.", icon: BarChart3 },
  { title: "Match", description: "Connect placement-ready students with internships and employer roles.", icon: BriefcaseBusiness },
];

function MetricsCards() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-line bg-card p-5 animate-pulse h-24"/><div className="rounded-2xl border border-line bg-card p-5 animate-pulse h-24"/><div className="rounded-2xl border border-line bg-card p-5 animate-pulse h-24"/><div className="rounded-2xl border border-line bg-card p-5 animate-pulse h-24"/></div>}>
      <MetricsCardsInner />
    </Suspense>
  );
}

async function MetricsCardsInner() {
  const metrics = await getInstitutionMetrics();
  const metricItems = [
    { label: "Students skill-mapped", value: metrics.students_skill_mapped.toLocaleString(), note: `${metrics.total_students} total students`, icon: Users, tone: "text-cyan-300" },
    { label: "Industry partners", value: metrics.industry_partners.toString(), note: `${metrics.active_partnerships} active opportunities`, icon: Building2, tone: "text-violet-300" },
    { label: "Internship-ready", value: metrics.internship_ready.toLocaleString(), note: `Based on pathway evidence`, icon: BriefcaseBusiness, tone: "text-emerald-300" },
    { label: "Placement pipeline", value: metrics.placement_pipeline.toLocaleString(), note: `Students ready to be shared`, icon: GraduationCap, tone: "text-amber-300" },
  ];

  return (
    <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metricItems.map(({ label, value, note, icon: Icon, tone }) => (
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
  );
}

function SkillGapIntelligence() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-line bg-card p-6 sm:p-8 animate-pulse"><div className="h-8 w-48 bg-slate-800 rounded"/><div className="mt-6 space-y-6"><div className="h-4 w-64 bg-slate-800 rounded"/><div className="h-20 bg-slate-800 rounded"/></div></div>}>
      <SkillGapIntelligenceInner />
    </Suspense>
  );
}

async function SkillGapIntelligenceInner() {
  const skillGaps = await getSkillGaps(8);

  return (
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
          {skillGaps.length > 0 ? (
            skillGaps.map((gap) => (
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
                <p className="mt-1 text-xs text-slate-500">{gap.ready_count} of {gap.student_count} students have completed this area</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No skill gap data available yet. Students need to start roadmaps.</p>
          )}
        </div>
        <p className="mt-7 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/80">
          Data derived from active student roadmaps. Encourage students to complete assessments and select careers to populate this view.
        </p>
      </div>
    </Reveal>
  );
}

function CohortReadinessTable() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-line bg-card p-6 sm:p-8 animate-pulse"><div className="h-8 w-48 bg-slate-800 rounded"/><div className="mt-6 h-40 bg-slate-800 rounded"/></div>}>
      <CohortReadinessTableInner />
    </Suspense>
  );
}

async function CohortReadinessTableInner() {
  const cohorts = await getCohortReadiness();

  return (
    <Reveal delay={0.12}>
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">Cohort readiness</p>
        <h2 className="mt-2 font-display text-2xl text-foreground">Student cohorts by department & year</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[.14em] text-slate-500 border-b border-line">
                <th className="pb-3 pr-4">Cohort</th>
                <th className="pb-3 pr-4">Students</th>
                <th className="pb-3 pr-4">Avg Readiness</th>
                <th className="pb-3 pr-4">Internship Ready</th>
                <th className="pb-3 pr-4">Placed</th>
                <th className="pb-3 pr-4">Top Skill Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {cohorts.length > 0 ? (
                cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="hover:bg-slate-800/50">
                    <td className="py-3 pr-4 font-medium text-slate-100">{cohort.cohort}</td>
                    <td className="py-3 pr-4 text-slate-300">{cohort.student_count}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{cohort.avg_readiness}%</span>
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${cohort.avg_readiness}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-emerald-300 font-medium">{cohort.internship_ready}</td>
                    <td className="py-3 pr-4 text-amber-300 font-medium">{cohort.placed}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {cohort.top_skill_gaps.length > 0 ? (
                          cohort.top_skill_gaps.map((gap) => (
                            <span key={gap} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">{gap}</span>
                          ))
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No cohort data available yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
}

function IndustryPartnersSection() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-line bg-card p-6 sm:p-8 animate-pulse"><div className="h-8 w-48 bg-slate-800 rounded"/><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="h-24 bg-slate-800 rounded"/><div className="h-24 bg-slate-800 rounded"/><div className="h-24 bg-slate-800 rounded"/></div></div>}>
      <IndustryPartnersSectionInner />
    </Suspense>
  );
}

async function IndustryPartnersSectionInner() {
  const partners = await getIndustryPartners();

  return (
    <Reveal delay={0.18}>
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Industry connections</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Active hiring partners</h2>
          </div>
          <Link href="/recruiter" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90">
            Manage partnerships <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.length > 0 ? (
            partners.slice(0, 6).map((partner) => (
              <div key={partner.id} className="rounded-2xl border border-line bg-background/50 p-4 transition hover:border-cyan-300/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-100">{partner.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{partner.active_jobs} open roles · {partner.hires} hires</p>
                  </div>
                  <Building2 className="h-5 w-5 text-cyan-300 shrink-0" />
                </div>
                <div className="mt-4 flex gap-4 text-xs text-slate-400">
                  <span>{partner.collaborations} collaborations</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-slate-400">No industry partners connected yet</div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function PlacementFunnelSection() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-line bg-card p-6 sm:p-8 animate-pulse"><div className="h-8 w-48 bg-slate-800 rounded"/><div className="mt-6 grid gap-4"><div className="h-12 bg-slate-800 rounded"/><div className="h-12 bg-slate-800 rounded"/><div className="h-12 bg-slate-800 rounded"/></div></div>}>
      <PlacementFunnelSectionInner />
    </Suspense>
  );
}

async function PlacementFunnelSectionInner() {
  const funnel = await getPlacementFunnel();

  return (
    <Reveal delay={0.24}>
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">Placement funnel</p>
        <h2 className="mt-2 font-display text-2xl text-foreground">Application to offer conversion</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-5">
          {funnel.map((stage, index) => (
            <div key={stage.stage} className="relative rounded-2xl border border-line bg-background p-4 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-line text-[10px] font-bold text-accent">
                {index + 1}
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-slate-500">{stage.stage}</p>
              <p className="mt-2 font-display text-3xl text-foreground">{stage.count.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400">{stage.conversion_rate}% of start</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function StudentExplorerSection() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-line bg-card p-6 sm:p-8 animate-pulse"><div className="h-8 w-48 bg-slate-800 rounded"/><div className="mt-6 h-40 bg-slate-800 rounded"/></div>}>
      <StudentExplorerSectionInner />
    </Suspense>
  );
}

async function StudentExplorerSectionInner() {
  const students = await getStudentList({ limit: 20 });

  return (
    <Reveal delay={0.3}>
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-rose-300">Student explorer</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Individual learner progress</h2>
          </div>
          <Link href="/readiness" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[.14em] text-slate-500 border-b border-line">
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Program</th>
                <th className="pb-3 pr-4">Career Path</th>
                <th className="pb-3 pr-4">Readiness</th>
                <th className="pb-3 pr-4">Roadmap</th>
                <th className="pb-3 pr-4">Applications</th>
                <th className="pb-3 pr-4">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium text-slate-100">{s.full_name || s.email?.split("@")[0] || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{s.major || "Undeclared"} · Class of {s.graduation_year || "—"}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{s.major || "—"}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-2 py-1 text-xs text-violet-200">
                        {s.career_title}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${s.readiness >= 70 ? "text-emerald-300" : s.readiness >= 50 ? "text-amber-300" : "text-rose-300"}`}>
                          {s.readiness}%
                        </span>
                        <div className="w-20 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${s.readiness}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize text-accent">{s.roadmap_status.replace("_", " ")}</span>
                        <div className="w-16 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.roadmap_progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {s.applications_count} ({s.pending_applications} pending)
                    </td>
                    <td className="py-3 pr-4 text-cyan-300 font-medium">{s.current_streak_days || 0}d</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
}

function ActionCards() {
  return (
    <Reveal delay={0.36} className="mt-6">
      <section className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">From learning to opportunity</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Act on the evidence, not assumptions.</h2>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Role-based readiness</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Verified opportunities</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Two-way industry matching</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Faculty-industry collaboration</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/readiness" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200">
              View readiness <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/recruiter" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90">
              Industry workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/academia/collaborations" className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20">
              Manage collaborations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function WorkflowPipeline() {
  return (
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
  );
}

function HeroSection() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.12] via-card to-violet-500/[0.08] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200">
            <Building2 className="h-3.5 w-3.5" /> Institution workspace
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
  );
}

export default async function AcademiaWorkspacePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <HeroSection />

      <MetricsCards />

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <SkillGapIntelligence />
        <WorkflowPipeline />
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <CohortReadinessTable />
        <IndustryPartnersSection />
      </div>

      <PlacementFunnelSection />

      <StudentExplorerSection />

      <ActionCards />
    </main>
  );
}
