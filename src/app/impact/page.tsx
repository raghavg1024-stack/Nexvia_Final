import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Award, BriefcaseBusiness, ChartNoAxesCombined, CheckCircle2, Map, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type Metric = { label: string; value: number; total?: number; suffix?: string; description: string; icon: typeof Award };

export default async function ImpactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (!['academia', 'recruiter', 'admin'].includes(String(profile?.user_type))) redirect("/dashboard");
  const { data, error } = await supabase.rpc("get_impact_metrics");
  const raw = !error && data && typeof data === "object" ? data as Record<string, number> : {};
  const metrics: Metric[] = [
    { label: "Placement rate", value: raw.placement_rate ?? 0, suffix: "%", description: `${raw.placements ?? 0} accepted outcomes across ${raw.applications ?? 0} applications`, icon: BriefcaseBusiness },
    { label: "Readiness improvement", value: raw.readiness_improvement ?? 0, suffix: " pts", description: `Average readiness is ${raw.average_readiness ?? 0}%`, icon: ChartNoAxesCombined },
    { label: "Roadmap completion", value: raw.roadmap_completion ?? 0, suffix: "%", description: "Completed milestones across active learner roadmaps", icon: Map },
    { label: "Accepted recommendations", value: raw.accepted_recommendations ?? 0, suffix: "%", description: "Career suggestions actively selected by learners", icon: Sparkles },
    { label: "Verified opportunities", value: raw.verified_opportunities ?? 0, description: "Approved jobs, faculty programs, and research collaborations", icon: CheckCircle2 },
  ];

  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6"><header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-500">Measured outcomes</p><h1 className="mt-2 text-3xl font-bold text-foreground">Impact Analytics</h1><p className="mt-2 text-sm leading-6 text-slate-400">Live evidence of how learners move from recommendations and training into verified readiness and placement outcomes.</p></header>
    {error && <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">Analytics will populate after the platform completion migration is applied.</div>}
    <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => {
      const MetricIcon = metric.icon;
      return <article key={metric.label} className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-500/10"><div className="flex items-center justify-between"><span className="rounded-xl bg-blue-600 p-2.5 text-white"><MetricIcon className="h-5 w-5" /></span><span className="text-xs font-bold uppercase tracking-widest text-blue-600">Live metric</span></div><p className="mt-6 text-4xl font-bold tracking-tight text-foreground">{metric.value}{metric.suffix}</p><h2 className="mt-2 font-bold text-foreground">{metric.label}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{metric.description}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.max(2, Math.min(100, metric.suffix ? metric.value : metric.value * 4))}%` }} /></div></article>;
    })}</section>
    <section className="mt-8 rounded-2xl border border-line bg-card p-6"><div className="flex items-center gap-3"><Award className="h-6 w-6 text-blue-600" /><div><h2 className="font-bold text-foreground">Accountable impact, not presentation targets</h2><p className="mt-1 text-sm text-slate-400">Every card is calculated from roadmap milestones, readiness history, applications, selected recommendations, and approved listings.</p></div></div></section>
  </main>;
}
