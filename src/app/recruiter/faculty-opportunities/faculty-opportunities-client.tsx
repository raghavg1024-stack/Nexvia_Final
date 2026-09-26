"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Building2, Calendar, Users, Edit, Trash2, BookOpen, FlaskConical, Code, UserCheck, Briefcase } from "lucide-react";
import { Stagger, StaggerItem } from "@/app/_components/motion";
import { createFacultyOpportunityAction, updateFacultyOpportunityAction, deleteFacultyOpportunityAction } from "./actions";
import type { FacultyOpportunityActionState } from "./actions";

interface FacultyOpportunity {
  id: string;
  title: string;
  type: string;
  description: string;
  duration_weeks: number | null;
  location: string | null;
  stipend_amount: string | null;
  application_deadline: string | null;
  required_skills: string[] | null;
  application_url: string | null;
  max_participants: number | null;
  status: string;
}

const initialActionState: FacultyOpportunityActionState = { error: null };

const OPPORTUNITY_TYPES = [
  { value: "faculty_internship", label: "Faculty Internship", icon: Briefcase },
  { value: "fdp", label: "Faculty Development Program (FDP)", icon: BookOpen },
  { value: "industrial_training", label: "Industrial Training", icon: Code },
  { value: "consultancy", label: "Consultancy Project", icon: Briefcase },
  { value: "research_collaboration", label: "Research Collaboration", icon: FlaskConical },
  { value: "workshop", label: "Workshop", icon: Users },
  { value: "guest_lecture", label: "Guest Lecture", icon: Users },
  { value: "mentorship", label: "Mentorship Program", icon: UserCheck },
] as const;

function TypeBadge({ type }: { type: string }) {
  const config = OPPORTUNITY_TYPES.find(t => t.value === type);
  const Icon = config?.icon || Users;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
      <Icon className="h-3 w-3" /> {config?.label || type}
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

function OpportunityCard({ opportunity, onEdit, onDelete }: { opportunity: FacultyOpportunity; onEdit: (opp: FacultyOpportunity) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">{opportunity.title}</h3>
        <TypeBadge type={opportunity.type} />
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-400 line-clamp-2">{opportunity.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {opportunity.duration_weeks ? `${opportunity.duration_weeks} weeks` : "Duration TBD"}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Apply by {opportunity.application_deadline ? new Date(opportunity.application_deadline).toLocaleDateString() : "Open"}</span>
        {opportunity.location && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {opportunity.location}</span>}
        {opportunity.stipend_amount && <span className="flex items-center gap-1 text-emerald-300">₹{opportunity.stipend_amount}</span>}
      </div>

      <div className="mt-4">
        <StatusBadge status={opportunity.status} />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(opportunity)}
          className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-accent hover:text-accent"
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(opportunity.id)}
          className="flex-1 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-400/20"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </button>
      </div>

      <Link
        href={`/recruiter/faculty-opportunities/${opportunity.id}/applications`}
        className="mt-4 text-center text-sm font-medium text-accent hover:text-accent/80"
      >
        View Applications →
      </Link>
    </div>
  );
}

function OpportunityForm({
  initialData,
  onCancel,
  action,
  error,
  pending,
}: {
  initialData?: FacultyOpportunity | null;
  onCancel: () => void;
  action: (formData: FormData) => void;
  error?: string | null;
  pending: boolean;
}) {
  const isEditing = !!initialData;

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
          {isEditing ? "Edit Opportunity" : "Create Faculty Opportunity"}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200">Cancel</button>
      </div>

      <form action={action} className="grid gap-5">
        {isEditing && <input type="hidden" name="id" value={initialData.id} />}
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Title *
          <input name="title" required maxLength={150} defaultValue={initialData?.title || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. AI/ML Faculty Internship Summer 2024" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Type *
          <select name="type" required defaultValue={initialData?.type || "fdp"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            {OPPORTUNITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Description *
          <textarea name="description" rows={4} required defaultValue={initialData?.description || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Describe the opportunity, objectives, and what faculty will gain." />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Duration (weeks)
            <input name="duration_weeks" type="number" min="1" max="52" defaultValue={initialData?.duration_weeks || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. 4" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Location
            <input name="location" defaultValue={initialData?.location || "Remote"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Remote, Bengaluru, Hybrid" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Stipend Amount
            <input name="stipend_amount" defaultValue={initialData?.stipend_amount || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. 50,000/month" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Application Deadline
            <input name="application_deadline" type="date" defaultValue={initialData?.application_deadline || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Required Skills (comma-separated)
          <input name="required_skills" defaultValue={Array.isArray(initialData?.required_skills) ? initialData.required_skills.join(", ") : ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. Python, Machine Learning, Deep Learning" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Application URL
          <input name="application_url" type="url" defaultValue={initialData?.application_url || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://company.com/apply" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Max Participants
          <input name="max_participants" type="number" min="1" defaultValue={initialData?.max_participants || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. 20" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Status
          <select name="status" defaultValue={initialData?.status || "draft"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        {error ? <p role="alert" className="text-sm text-rose-400">{error}</p> : null}
        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
            {pending ? "Saving..." : isEditing ? "Update Opportunity" : "Create Opportunity"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-line px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface FacultyOpportunitiesClientProps {
  initialOpportunities: FacultyOpportunity[];
  hasMembership: boolean;
}

export function FacultyOpportunitiesClient({ initialOpportunities, hasMembership }: FacultyOpportunitiesClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<FacultyOpportunity | null>(null);
  const [, startDeleteTransition] = useTransition();

  const [formState, formAction, formPending] = useActionState(createFacultyOpportunityAction, initialActionState);
  const [editState, editAction, editPending] = useActionState(updateFacultyOpportunityAction, initialActionState);
  const [, deleteAction] = useActionState(deleteFacultyOpportunityAction, initialActionState);

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    startDeleteTransition(() => deleteAction(formData));
  };

  if (!hasMembership) {
    return (
      <div className="mt-8 text-center text-slate-400">
        <p>No company linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl uppercase tracking-tight text-foreground">Faculty Opportunities</h2>
        <button
          type="button"
          onClick={() => { setEditingOpportunity(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Create Opportunity
        </button>
      </div>

      {showForm ? (
        <OpportunityForm
          initialData={editingOpportunity}
          onCancel={() => { setShowForm(false); setEditingOpportunity(null); }}
          action={editingOpportunity ? editAction : formAction}
          error={editingOpportunity ? editState.error : formState.error}
          pending={editingOpportunity ? editPending : formPending}
        />
      ) : initialOpportunities.length > 0 ? (
        <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialOpportunities.map((opp) => (
            <StaggerItem key={opp.id}>
              <OpportunityCard
                opportunity={opp}
                onEdit={(opp) => { setEditingOpportunity(opp); setShowForm(true); }}
                onDelete={handleDelete}
              />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">No faculty opportunities yet</h3>
          <p className="mt-2 text-sm text-slate-500">Create FDPs, workshops, research collaborations, and more to engage with academicians.</p>
          <button
            type="button"
            onClick={() => { setEditingOpportunity(null); setShowForm(true); }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" /> Create Opportunity
          </button>
        </div>
      )}
    </div>
  );
}
