"use client";

import { useState, useRef, useCallback } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, Globe, Award, Briefcase, Code, Trophy, BookOpen, Calendar, Building2, MapPin, Star, CheckCircle2, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { createPortfolioItemAction, updatePortfolioItemAction, deletePortfolioItemAction } from "./actions";
import type { PortfolioItem } from "@/lib/types";

const PORTFOLIO_TYPES = [
  { value: "project", label: "Project", icon: Code, color: "bg-blue-500/10 text-blue-400" },
  { value: "internship", label: "Internship", icon: Briefcase, color: "bg-emerald-500/10 text-emerald-400" },
  { value: "achievement", label: "Achievement", icon: Trophy, color: "bg-amber-500/10 text-amber-400" },
  { value: "publication", label: "Publication", icon: BookOpen, color: "bg-violet-500/10 text-violet-400" },
  { value: "certification", label: "Certification", icon: Award, color: "bg-cyan-500/10 text-cyan-400" },
  { value: "hackathon", label: "Hackathon", icon: Code, color: "bg-rose-500/10 text-rose-400" },
  { value: "competition", label: "Competition", icon: Trophy, color: "bg-orange-500/10 text-orange-400" },
] as const;

const VERIFICATION_STATUS = {
  verified: { label: "Verified", color: "bg-emerald-500/10 text-emerald-300", icon: ShieldCheck },
  pending_verification: { label: "Pending Verification", color: "bg-amber-500/10 text-amber-300", icon: Calendar },
  self_reported: { label: "Self-reported", color: "bg-slate-500/10 text-slate-400", icon: Edit },
} as const;

function TypeBadge({ type }: { type: string }) {
  const config = PORTFOLIO_TYPES.find(t => t.value === type) || { label: type, icon: Code, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const config = VERIFICATION_STATUS[status as keyof typeof VERIFICATION_STATUS] || VERIFICATION_STATUS.self_reported;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function PortfolioCard({ item, onEdit, onDelete }: { item: PortfolioItem; onEdit: (item: PortfolioItem) => void; onDelete: (id: string) => void }) {
  const config = PORTFOLIO_TYPES.find(t => t.value === item.type) || { label: item.type, icon: Code, color: "bg-slate-500/10 text-slate-400" };
  const Icon = config.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-display text-lg uppercase tracking-tight text-foreground truncate">{item.title}</h3>
        </div>
        {item.is_featured && <Star className="h-5 w-5 fill-current text-amber-400" />}
      </div>

      <p className="mt-2 flex-1 text-sm text-slate-400 line-clamp-2">{item.description || "No description"}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {item.organization && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {item.organization}</span>}
        {item.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.start_date).toLocaleDateString()}{item.end_date ? ` - ${new Date(item.end_date).toLocaleDateString()}` : " - Present"}</span>}
        {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>}
      </div>

      {item.skills && item.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.skills.slice(0, 6).map((skill: string) => (
            <span key={skill} className="rounded-full border border-line bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{skill}</span>
          ))}
          {item.skills.length > 6 && <span className="rounded-full border border-line bg-slate-800 px-2 py-0.5 text-xs text-slate-400">+{item.skills.length - 6} more</span>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <VerificationBadge status={item.verification_status} />
        <div className="flex gap-2">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent" title="View project">
              {item.url.includes("github") ? <Globe className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            </a>
          )}
          <button type="button" onClick={() => onEdit(item)} className="text-slate-400 hover:text-accent" title="Edit"><Edit className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-400" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function PortfolioForm({
  initialData,
  onCancel,
  onSubmit,
  pending,
}: {
  initialData?: PortfolioItem | null;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  pending: boolean;
}) {
  const isEditing = !!initialData;
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const handleSkillInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInputRef.current?.value.trim()) {
      e.preventDefault();
      const value = skillInputRef.current.value.trim();
      if (!skills.includes(value)) setSkills(prev => [...prev, value]);
      if (skillInputRef.current) skillInputRef.current.value = "";
    }
  }, [skills]);

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
          {isEditing ? "Edit Portfolio Item" : "Add Portfolio Item"}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200">Cancel</button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5">
        {isEditing && <input type="hidden" name="id" value={initialData!.id} />}
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Title *
          <input name="title" required maxLength={150} defaultValue={initialData?.title || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. AI-Powered Resume Analyzer" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Type *
          <select name="type" required defaultValue={initialData?.type || "project"} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent">
            {PORTFOLIO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Description
          <textarea name="description" rows={4} defaultValue={initialData?.description || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Describe the project, your role, technologies used, and outcomes." />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Skills (press Enter after each)
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {skill} <button type="button" onClick={() => setSkills(prev => prev.filter((_, j) => j !== i))} className="text-accent hover:text-white">×</button>
              </span>
            ))}
            <input ref={skillInputRef} onKeyDown={handleSkillInput} placeholder="Add skill..." className="flex-1 min-w-[150px] rounded-xl border border-line bg-background px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent" />
          </div>
          <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Organization / Company
            <input name="organization" defaultValue={initialData?.organization || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="e.g. Google, MIT, Hackathon Name" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Location
            <input name="location" defaultValue={initialData?.location || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Remote, Bengaluru, Hybrid" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Start Date
            <input name="start_date" type="date" defaultValue={initialData?.start_date || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            End Date (optional)
            <input name="end_date" type="date" defaultValue={initialData?.end_date || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Project / Live URL
          <input name="url" type="url" defaultValue={initialData?.url || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://github.com/... or https://demo.com" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Image URL (optional)
          <input name="image_url" type="url" defaultValue={initialData?.image_url || ""} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://example.com/screenshot.png" />
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input name="is_featured" type="checkbox" defaultChecked={initialData?.is_featured || false} className="rounded border-line" />
            Feature on profile
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <select name="verification_status" defaultValue={initialData?.verification_status || "self_reported"} className="rounded-xl border border-line bg-background px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent">
              <option value="self_reported">Self-reported</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
            </select>
            Verification Status
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
            {pending ? "Saving..." : isEditing ? "Update Item" : "Add Item"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-line px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface PortfolioClientProps {
  initialItems: PortfolioItem[];
}

export function PortfolioClient({ initialItems }: PortfolioClientProps) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [formState, formAction, formPending] = useActionState(createPortfolioItemAction, { error: null });
  const [editState, editAction, editPending] = useActionState(updatePortfolioItemAction, { error: null });
  const [deleteState, deleteAction, deletePending] = useActionState(deletePortfolioItemAction, { error: null });

  const handleCreate = async (formData: FormData) => {
    const result = await formAction(formData);
    if (result.ok) {
      setShowForm(false);
      // Refresh would need a server call, for now just close form
    }
  };

  const handleUpdate = async (formData: FormData) => {
    const result = await editAction(formData);
    if (result.ok) {
      setEditingItem(null);
    }
  };

  const handleDelete = async (formData: FormData) => {
    const result = await deleteAction(formData);
    if (result.ok) {
      setItems(prev => prev.filter(item => item.id !== formData.get("id")));
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    handleDelete(formData);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl uppercase tracking-tight text-foreground">Your Portfolio</h2>
        <button
          type="button"
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {showForm ? (
        <PortfolioForm
          initialData={editingItem}
          onCancel={() => { setEditingItem(null); setShowForm(false); }}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          pending={editingItem ? editPending : formPending}
        />
      ) : (
        <>
          {items.length > 0 ? (
            <Stagger className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <StaggerItem key={item.id}>
                  <PortfolioCard
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
              <Code className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-300">Your portfolio is empty</h3>
              <p className="mt-2 text-sm text-slate-500">Showcase your projects, internships, certifications, and achievements.</p>
              <button
                type="button"
                onClick={() => { setEditingItem(null); setShowForm(true); }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                <Plus className="h-4 w-4" /> Add First Item
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}