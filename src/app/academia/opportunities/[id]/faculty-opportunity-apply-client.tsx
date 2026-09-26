"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Briefcase, Code, FlaskConical, Users, UserCheck, Calendar, MapPin, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { applyToFacultyOpportunityAction } from "./actions";
import type { FacultyApplyActionState, FacultyOpportunityDetails } from "./actions";

const initialActionState: FacultyApplyActionState = { error: null };

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

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || { label: type, icon: Users, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

interface FacultyOpportunityApplyClientProps {
  initialOpportunity: FacultyOpportunityDetails;
}

export function FacultyOpportunityApplyClient({ initialOpportunity }: FacultyOpportunityApplyClientProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(applyToFacultyOpportunityAction, initialActionState);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/academia/opportunities" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>

      <div className="rounded-2xl border border-line bg-card p-6">
        <OpportunityDetails opportunity={initialOpportunity} />
      </div>

      {state.ok && state.success ? (
        <SuccessMessage onContinue={() => router.push("/academia/opportunities")} />
      ) : (
        <ApplicationForm action={formAction} pending={pending} error={state.error} opportunityId={initialOpportunity.id} />
      )}
    </main>
  );
}

function OpportunityDetails({ opportunity }: { opportunity: FacultyOpportunityDetails }) {
  const config = TYPE_CONFIG[opportunity.type as keyof typeof TYPE_CONFIG] || { label: opportunity.type, icon: Users, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <TypeBadge type={opportunity.type} />
          <h1 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">{opportunity.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{opportunity.companies?.name || "Unknown Company"}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-slate-300 border-t border-line pt-4">
        {opportunity.description}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800"><Clock className="h-4 w-4 text-slate-400" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</p>
            <p className="text-sm text-foreground">{opportunity.duration_weeks ? `${opportunity.duration_weeks} weeks` : "Not specified"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800"><Calendar className="h-4 w-4 text-slate-400" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Application Deadline</p>
            <p className="text-sm text-foreground">{opportunity.application_deadline ? new Date(opportunity.application_deadline).toLocaleDateString() : "Open"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800"><MapPin className="h-4 w-4 text-slate-400" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
            <p className="text-sm text-foreground">{opportunity.location || "Remote"}</p>
          </div>
        </div>
        {opportunity.stipend_amount && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800"><DollarSign className="h-4 w-4 text-slate-400" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stipend</p>
              <p className="text-sm text-emerald-300 font-medium">₹{opportunity.stipend_amount}</p>
            </div>
          </div>
        )}
        {opportunity.max_participants && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800"><Users className="h-4 w-4 text-slate-400" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Participants</p>
              <p className="text-sm text-foreground">{opportunity.max_participants}</p>
            </div>
          </div>
        )}
      </div>

      {opportunity.required_skills && opportunity.required_skills.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {opportunity.required_skills.map((skill: string) => (
              <span key={skill} className="rounded-full border border-line bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationForm({ action, pending, error, opportunityId }: { action: (formData: FormData) => void; pending: boolean; error?: string | null; opportunityId: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-card p-6">
      <h2 className="font-display text-lg uppercase tracking-tight text-foreground">Apply for this Opportunity</h2>
      <p className="mt-2 text-sm text-slate-400">Fill in your details and a brief statement of interest.</p>

      <form action={action} className="mt-6 grid gap-5">
        <input type="hidden" name="opportunity_id" value={opportunityId} />

        {error && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-300" role="alert">
            {error}
          </div>
        )}

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Full Name *
          <input name="full_name" required maxLength={100} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Dr. Jane Smith" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Designation *
          <input name="designation" required maxLength={100} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Associate Professor / Assistant Professor" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Department *
          <input name="department" required maxLength={100} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Computer Science & Engineering" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Institution *
          <input name="institution" required maxLength={150} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="XYZ Institute of Technology" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Years of Experience *
          <input name="experience_years" type="number" min="0" max="50" required className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="5" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Areas of Expertise (comma-separated) *
          <input name="expertise" required maxLength={500} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Machine Learning, Data Science, Python" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Statement of Interest *
          <textarea name="statement" rows={5} required maxLength={2000} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Why are you interested in this opportunity? How does it align with your research/teaching goals? What can you contribute?" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          LinkedIn / Profile URL
          <input name="profile_url" type="url" className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://linkedin.com/in/yourprofile" />
        </label>

        <button disabled={pending} className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
          {pending ? "Submitting Application..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

function SuccessMessage({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-950/10 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>
      <h2 className="mt-4 font-display text-xl uppercase tracking-tight text-emerald-300">Application Submitted!</h2>
      <p className="mt-2 text-sm text-slate-300">Your application has been sent to the company. You will be notified once they review it.</p>
      <button onClick={onContinue} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90">
        Back to Opportunities <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
