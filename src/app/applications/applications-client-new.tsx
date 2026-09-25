"use client"

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Award, Calendar, Building2, MapPin, DollarSign, Clock, CheckCircle2, XCircle, Clock as ClockIcon, MessageSquare, Edit, Trash2, ExternalLink, Eye, FileText, Plus } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { updateApplicationAction, deleteApplicationAction } from "./actions";

const STATUS_CONFIG = {
  applied: { label: "Applied", color: "bg-blue-500/10 text-blue-400", icon: ClockIcon },
  under_review: { label: "Under Review", color: "bg-violet-500/10 text-violet-400", icon: FileText },
  interviewing: { label: "Interviewing", color: "bg-amber-500/10 text-amber-400", icon: MessageSquare },
  offered: { label: "Offered", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  accepted: { label: "Accepted", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-rose-500/10 text-rose-400", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "bg-slate-500/10 text-slate-400", icon: XCircle },
} as const;

const APPLICATION_TYPES = {
  job: { label: "Job", icon: Briefcase },
  internship: { label: "Internship", icon: Briefcase },
  scholarship: { label: "Scholarship", icon: Award },
  faculty_opportunity: { label: "Faculty Opportunity", icon: Award },
  fellowship: { label: "Fellowship", icon: Award },
} as const;

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { label: status, color: "bg-slate-500/10 text-slate-400", icon: ClockIcon };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = APPLICATION_TYPES[type as keyof typeof APPLICATION_TYPES] || { label: type, icon: Briefcase };
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function ApplicationCard({ application, onEdit, onDelete }: { application: any; onEdit: (app: any) => void; onDelete: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [editState, editAction, editPending] = useActionState(updateApplicationAction, { error: null });
  const [deleteState, deleteAction, deletePending] = useActionState(deleteApplicationAction, { error: null });

  if (showEdit) {
    return (
      <ApplicationForm
        initialData={application}
        onCancel={() => setShowEdit(false)}
        onSubmit={async (formData) => {
          const result = await editAction(formData);
          if (result.ok) setShowEdit(false);
        }}
        pending={editPending}
      />
    );
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200 sm:flex-row sm:items-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-slate-800">
        {application.company_logo ? (
          <img src={application.company_logo} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="font-display text-lg text-slate-400">{application.company?.charAt(0).toUpperCase() || "?"}</span>
        )}
      </div>
      <div className="mt-4 flex-1 min-w-0 sm:mt-0 sm:ml-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg uppercase tracking-tight text-foreground truncate">{application.title}</h3>
              <TypeBadge type={application.type} />
            </div>
            <p className="mt-1 text-sm text-slate-400">{application.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={application.status} />
            {application.source === "student_application" && (
              <button type="button" onClick={() => onEdit(application)} className="text-slate-400 hover:text-accent" title="Edit"><Edit className="h-4 w-4" /></button>
            )}
            {application.source === "student_application" && (
              <button type="button" onClick={() => onDelete(application.id)} className="text-slate-400 hover:text-rose-400" title="Delete"><Trash2 className="h-4 w-4" /></button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Applied {new Date(application.applied_at).toLocaleDateString()}</span>
        </div>

        {application.source === "job_application" && (
          <div className="mt-3 flex gap-2">
            <a
              href={`/recruiter/jobs/${application.reference_id}/applicants`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent hover:text-accent"
            >
              <Eye className="h-3.5 w-3.5" /> View on Job Portal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationForm({
  initialData,
  onCancel,
  onSubmit,
  pending,
}: {
  initialData?: any;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  pending: boolean;
}) {
  const isEditing = !!initialData;

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
          {isEditing ? "Edit Application" : "Track Application Manually"}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200">Cancel</button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5">
        {isEditing && <input type="hidden" name="id" value={initialData.id} />}
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Application Type *
          <select name="application_type" required defaultValue={initialData?.type || "job"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            <option value="job">Job</option>
            <option value="internship">Internship</option>
            <option value="scholarship">Scholarship</option>
            <option value="faculty_opportunity">Faculty Opportunity</option>
            <option value="fellowship">Fellowship</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Title / Role *
          <input name="title" required maxLength={150} defaultValue={initialData?.title || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. Software Engineer Intern" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Company / Organization *
          <input name="company_name" required maxLength={150} defaultValue={initialData?.company || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. Google, Microsoft" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Status *
          <select name="status" required defaultValue={initialData?.status || "applied"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Applied Date
            <input name="applied_at" type="date" defaultValue={initialData?.applied_at ? initialData.applied_at.split("T")[0] : ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Match Score (%)
            <input name="match_score" type="number" min="0" max="100" defaultValue={initialData?.match_score || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. 85" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Notes
          <textarea name="notes" rows={3} defaultValue={initialData?.notes || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Private notes about this application..." />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Interview Dates (one per line, ISO format)
          <textarea name="interview_dates" rows={3} defaultValue={Array.isArray(initialData?.interview_dates) ? initialData.interview_dates.join("\n") : ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="2024-01-15T10:00:00Z&#10;2024-01-20T14:00:00Z" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Offer Details (JSON)
          <textarea name="offer_details" rows={3} defaultValue={initialData?.offer_details ? JSON.stringify(initialData.offer_details, null, 2) : ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent font-mono text-xs" placeholder='{"salary": "12 LPA", "location": "Bengaluru", "joining_date": "2024-07-01"}' />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
            {pending ? "Saving..." : isEditing ? "Update Application" : "Add Application"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-line px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface ApplicationsClientProps {
  initialApplications: any[];
  initialJobApplications: any[];
}

export function ApplicationsClient({ initialApplications, initialJobApplications }: ApplicationsClientProps) {
  const [filter, setFilter] = useState<"all" | "active" | "offered" | "completed">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, formAction, formPending] = useActionState(createApplicationAction, { error: null });

  const allApps = [
    ...initialJobApplications.map(app => ({
      id: app.id,
      type: app.jobs?.role_type === "internship" ? "internship" : "job",
      title: app.jobs?.title || "Unknown Role",
      company: app.jobs?.companies?.name || "Unknown Company",
      company_logo: app.jobs?.companies?.logo_url,
      status: app.status,
      applied_at: app.applied_at,
      reference_id: app.job_id,
      source: "job_application",
    })),
    ...initialApplications.map(app => ({
      id: app.id,
      type: app.application_type,
      title: app.title,
      company: app.company_name,
      status: app.status,
      applied_at: app.applied_at,
      reference_id: app.reference_id,
      source: "student_application",
    })),
  ].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

  const filteredApps = allApps.filter(app => {
    if (filter === "all") return true;
    if (filter === "active") return ["applied", "under_review", "interviewing"].includes(app.status);
    if (filter === "offered") return ["offered"].includes(app.status);
    if (filter === "completed") return ["accepted", "rejected", "withdrawn"].includes(app.status);
    return true;
  });

  const handleCreate = async (formData: FormData) => {
    const result = await formAction(formData);
    if (result.ok) {
      setShowForm(false);
    }
  };

  const handleEdit = (app: any) => {
    setEditingId(app.id);
  };

  const handleDeleteClick = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    deleteAction(formData);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl uppercase tracking-tight text-foreground">All Applications</h2>
        <button
          type="button"
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Track Manually
        </button>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "offered", label: "Offers" },
          { key: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
              filter === f.key
                ? "bg-accent text-white"
                : "bg-card text-slate-300 hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showForm ? (
        <ApplicationForm
          onCancel={() => { setShowForm(false); setEditingId(null); }}
          onSubmit={handleCreate}
          pending={formPending}
        />
      ) : filteredApps.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">No applications found</h3>
          <p className="mt-2 text-sm text-slate-500">Applications you submit through Nexvia will appear here automatically.</p>
        </div>
      ) : (
        <Stagger className="mt-6 space-y-4">
          {filteredApps.map((app) => (
            <StaggerItem key={app.id}>
              <ApplicationCard
                application={app}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

async function createApplicationAction(_prevState: { error?: string | null }, formData: FormData) {
  "use server";
  const supabase = (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const application_type = formData.get("application_type") as string;
  const title = formData.get("title") as string;
  const company_name = formData.get("company_name") as string;
  const status = formData.get("status") as string;
  const applied_at = formData.get("applied_at") as string || new Date().toISOString();
  const match_score = formData.get("match_score") ? Number(formData.get("match_score")) : null;
  const notes = formData.get("notes") as string || null;
  const interview_dates = formData.get("interview_dates") as string;
  const offer_details = formData.get("offer_details") as string;

  if (!application_type || !title || !company_name || !status) {
    return { error: "All required fields must be filled" };
  }

  let interviewDatesArray: string[] = [];
  try {
    interviewDatesArray = interview_dates.split("\n").map(s => s.trim()).filter(Boolean);
  } catch {}

  let offerDetailsObj: any = null;
  try {
    offerDetailsObj = offer_details ? JSON.parse(offer_details) : null;
  } catch {}

  const { error } = await supabase.from("student_applications").insert({
    user_id: user.id,
    application_type,
    reference_id: crypto.randomUUID(),
    title,
    company_name,
    status,
    applied_at,
    match_score,
    notes,
    interview_dates: interviewDatesArray,
    offer_details: offerDetailsObj,
  });

  if (error) return { error: error.message };

  return { ok: true };
}