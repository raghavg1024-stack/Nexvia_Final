import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { BookOpen, Briefcase, Code, FlaskConical, Users, UserCheck, Calendar, MapPin, DollarSign, Clock, ArrowRight, ExternalLink, Check } from "lucide-react";

const TYPE_CONFIG = {
  faculty_internship: { label: "Faculty Internship", icon: Briefcase, color: "bg-blue-500/10 text-blue-400" },
  fdp: { label: "Faculty Development Program", icon: BookOpen, color: "bg-violet-500/10 text-violet-400" },
  industrial_training: { label: "Industrial Training", icon: Code, color: "bg-cyan-500/10 text-cyan-400" },
  consultancy: { label: "Consultancy Project", icon: Briefcase, color: "bg-amber-500/10 text-amber-400" },
  research_collaboration: { label: "Research Collaboration", icon: FlaskConical, color: "bg-emerald-500/10 text-emerald-400" },
  workshop: { label: "Workshop", icon: Users, color: "bg-rose-500/10 text-rose-400" },
  guest_lecture: { label: "Guest Lecture", icon: Users, color: "bg-orange-500/10 text-orange-400" },
  mentorship: { label: "Mentorship Program", icon: UserCheck, color: "bg-pink-500/10 text-pink-400" },
} as const;

interface FacultyOpportunityListItem {
  id: string;
  type: string;
  title: string;
  description: string;
  companies: { name: string | null; logo_url: string | null } | null;
  duration_weeks: number | null;
  application_deadline: string | null;
  location: string | null;
  stipend_amount: string | null;
  required_skills: string[] | null;
  status: string;
  application_url: string | null;
}

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || { label: type, icon: Users, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    closed: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    draft: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.open}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export const dynamic = "force-dynamic";

export default async function FacultyOpportunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/academia");

  const profile = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (!profile.data || profile.data.user_type !== "academia") {
    redirect("/login/academia");
  }

  const { data: applications } = await supabase
    .from("faculty_applications")
    .select("opportunity_id, status")
    .eq("user_id", user.id);

  const appliedIds = new Set(applications?.map(a => a.opportunity_id) || []);

  const { data: opportunities } = await supabase
    .from("faculty_opportunities")
    .select(`
      *,
      companies (name, logo_url)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const normalizedOpportunities = (opportunities ?? []).map((opportunity) => ({
    ...opportunity,
    companies: Array.isArray(opportunity.companies)
      ? opportunity.companies[0] ?? null
      : opportunity.companies,
  })) as FacultyOpportunityListItem[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Faculty Opportunities</h1>
        <p className="mt-2 text-sm text-slate-400">Browse FDPs, internships, research collaborations, and consultancy projects from industry partners.</p>
      </Reveal>

      {normalizedOpportunities.length > 0 ? (
        <Stagger className="mt-8 grid gap-6">
          {normalizedOpportunities.map((opp) => (
            <StaggerItem key={opp.id}>
              <OpportunityCard opportunity={opp} hasApplied={appliedIds.has(opp.id)} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal delay={0.1}>
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-300">No opportunities available</h3>
            <p className="mt-2 text-sm text-slate-500">Check back later for new faculty opportunities from industry partners.</p>
          </div>
        </Reveal>
      )}
    </main>
  );
}

function OpportunityCard({ opportunity, hasApplied }: { opportunity: FacultyOpportunityListItem; hasApplied: boolean }) {
  const config = TYPE_CONFIG[opportunity.type as keyof typeof TYPE_CONFIG] || { label: opportunity.type, icon: Users, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200 sm:flex-row sm:items-start">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="mt-4 flex-1 min-w-0 sm:mt-0 sm:ml-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg uppercase tracking-tight text-foreground truncate">{opportunity.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{opportunity.companies?.name || "Unknown Company"}</p>
          </div>
          <TypeBadge type={opportunity.type} />
        </div>

        <p className="mt-3 text-sm text-slate-300 line-clamp-2">{opportunity.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {opportunity.duration_weeks ? `${opportunity.duration_weeks} weeks` : "Duration TBD"}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Apply by {opportunity.application_deadline ? new Date(opportunity.application_deadline).toLocaleDateString() : "Open"}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {opportunity.location || "Remote"}</span>
          {opportunity.stipend_amount && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ₹{opportunity.stipend_amount}</span>}
        </div>

        {opportunity.required_skills && opportunity.required_skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {opportunity.required_skills.slice(0, 5).map((skill: string) => (
              <span key={skill} className="rounded-full border border-line bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{skill}</span>
            ))}
            {opportunity.required_skills.length > 5 && (
              <span className="rounded-full border border-line bg-slate-800 px-2 py-0.5 text-xs text-slate-400">+{opportunity.required_skills.length - 5} more</span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <StatusBadge status={opportunity.status} />
          <div className="flex gap-2">
            {hasApplied ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Applied
              </span>
            ) : (
              <Link
                href={`/academia/opportunities/${opportunity.id}/apply`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                Apply Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {opportunity.application_url && (
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-accent hover:text-accent"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Official Site
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
