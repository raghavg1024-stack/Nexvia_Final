"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Building2, Calendar, Users, CheckCircle2, Clock, XCircle, Edit, Trash2, BookOpen, Lightbulb, FlaskConical, Code, UserCheck, Briefcase, Handshake } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { createCollaborationAction, updateCollaborationAction, deleteCollaborationAction } from "./actions";
import type { IndustryCollaboration } from "@/lib/types";

const COLLABORATION_TYPES = [
  { value: "fdp", label: "Faculty Development Program (FDP)", icon: BookOpen },
  { value: "workshop", label: "Workshop", icon: Users },
  { value: "guest_lecture", label: "Guest Lecture", icon: Users },
  { value: "innovation_challenge", label: "Innovation Challenge", icon: Lightbulb },
  { value: "consultancy", label: "Consultancy Project", icon: Briefcase },
  { value: "research_project", label: "Research Project", icon: FlaskConical },
  { value: "live_project", label: "Live Industry Project", icon: Code },
  { value: "mentorship_program", label: "Mentorship Program", icon: UserCheck },
] as const;

function TypeBadge({ type }: { type: string }) {
  const config = COLLABORATION_TYPES.find(t => t.value === type);
  const Icon = config?.icon || Users;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-300">
      <Icon className="h-3 w-3" /> {config?.label || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    proposed: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    planned: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    completed: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    cancelled: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.proposed}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CollaborationCard({ collaboration, onEdit, onDelete }: { collaboration: IndustryCollaboration; onEdit: (collab: IndustryCollaboration) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">{collaboration.title}</h3>
        <TypeBadge type={collaboration.type} />
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-400 line-clamp-2">{collaboration.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {collaboration.start_date ? new Date(collaboration.start_date).toLocaleDateString() : "TBD"}</span>
        {collaboration.end_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> to {new Date(collaboration.end_date).toLocaleDateString()}</span>}
        {collaboration.participants && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {collaboration.participants} participants</span>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <StatusBadge status={collaboration.status} />
      </div>

      {collaboration.outcomes && (
        <p className="mt-3 text-sm text-slate-400"><strong>Outcomes:</strong> {collaboration.outcomes}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(collaboration)}
          className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-accent hover:text-accent"
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(collaboration.id)}
          className="flex-1 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-400/20"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
}

function CollaborationForm({
  initialData,
  onCancel,
  onSubmit,
  pending,
}: {
  initialData?: IndustryCollaboration | null;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  pending: boolean;
}) {
  const isEditing = !!initialData;

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
          {isEditing ? "Edit Collaboration" : "Create New Collaboration"}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200">Cancel</button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5">
        {isEditing && <input type="hidden" name="id" value={initialData!.id} />}
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Title *
          <input name="title" required maxLength={150} defaultValue={initialData?.title || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. AI/ML Faculty Development Program 2024" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Type *
          <select name="type" required defaultValue={initialData?.type || "fdp"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            {COLLABORATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Description *
          <textarea name="description" rows={4} required defaultValue={initialData?.description || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Describe the collaboration objectives, format, and expected outcomes." />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Start Date
            <input name="start_date" type="date" defaultValue={initialData?.start_date || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            End Date
            <input name="end_date" type="date" defaultValue={initialData?.end_date || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Status
          <select name="status" defaultValue={initialData?.status || "proposed"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            <option value="proposed">Proposed</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Expected Participants
          <input name="participants" type="number" min="0" defaultValue={initialData?.participants || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. 30" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Outcomes / Results
          <textarea name="outcomes" rows={3} defaultValue={initialData?.outcomes || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Key outcomes, papers published, products built, students trained, etc." />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
            {pending ? "Saving..." : isEditing ? "Update Collaboration" : "Create Collaboration"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-line px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface CollaborationsClientProps {
  initialCollaborations: IndustryCollaboration[];
  hasMembership: boolean;
}

export function CollaborationsClient({ initialCollaborations, hasMembership }: CollaborationsClientProps) {
  const [collaborations, setCollaborations] = useState<IndustryCollaboration[]>(initialCollaborations);
  const [showForm, setShowForm] = useState(false);
  const [editingCollab, setEditingCollab] = useState<IndustryCollaboration | null>(null);

  const [formState, formAction, formPending] = useActionState(createCollaborationAction, { error: null });
  const [editState, editAction, editPending] = useActionState(updateCollaborationAction, { error: null });
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCollaborationAction, { error: null });

  const handleCreate = async (formData: FormData) => {
    const result = await formAction(formData);
    if (result.ok) setShowForm(false);
  };

  const handleUpdate = async (formData: FormData) => {
    const result = await editAction(formData);
    if (result.ok) setEditingCollab(null);
  };

  const handleDelete = async (formData: FormData) => {
    const result = await deleteAction(formData);
    if (result.ok) {
      const id = formData.get("id") as string;
      setCollaborations(prev => prev.filter(c => c.id !== id));
    }
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
        <h2 className="font-display text-xl uppercase tracking-tight text-foreground">Your Collaborations</h2>
        <button
          type="button"
          onClick={() => { setEditingCollab(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> New Collaboration
        </button>
      </div>

      {showForm ? (
        <CollaborationForm
          initialData={editingCollab}
          onCancel={() => { setEditingCollab(null); setShowForm(false); }}
          onSubmit={editingCollab ? handleUpdate : handleCreate}
          pending={editingCollab ? editPending : formPending}
        />
      ) : (
        <>
          {collaborations.length > 0 ? (
            <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collaborations.map((collab) => (
                <StaggerItem key={collab.id}>
                  <CollaborationCard
                    collaboration={collab}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
              <Handshake className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-300">No collaborations yet</h3>
              <p className="mt-2 text-sm text-slate-500">Create your first industry collaboration to get started.</p>
              <button
                type="button"
                onClick={() => { setEditingCollab(null); setShowForm(true); }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                <Plus className="h-4 w-4" /> Create Collaboration
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}