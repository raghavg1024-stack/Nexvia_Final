"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ArrowLeft, Star, Edit, Check, X, MessageSquare, Plus } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { submitFeedbackAction } from "./actions";

interface ApplicationForFeedback {
  id: string;
  status: string;
  applied_at: string;
  profiles: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  jobs: {
    id: string;
    title: string;
    company_id: string;
  } | null;
}

interface FeedbackClientProps {
  initialApplications: ApplicationForFeedback[];
  hasMembership: boolean;
}

function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className="p-1 text-2xl transition-colors"
          style={{ color: star <= value ? "#fbbf24" : "#64748b" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    applied: "bg-blue-500/10 text-blue-400",
    under_review: "bg-violet-500/10 text-violet-400",
    interviewing: "bg-amber-500/10 text-amber-400",
    offered: "bg-emerald-500/10 text-emerald-400",
    accepted: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-rose-500/10 text-rose-400",
    withdrawn: "bg-slate-500/10 text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.applied}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
    </span>
  );
}

function FeedbackCard({ application, onSubmitFeedback }: { application: ApplicationForFeedback; onSubmitFeedback: (app: ApplicationForFeedback) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formState, formAction, formPending] = useActionState(submitFeedbackAction, { error: null });
  const [ratings, setRatings] = useState({
    overall: 0,
    technical: 0,
    communication: 0,
    teamwork: 0,
    reliability: 0,
  });
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData);
    if (result.ok) {
      setShowForm(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-5 transition hover:border-accent/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-slate-800">
            {application.profiles?.avatar_url ? (
              <img src={application.profiles.avatar_url} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <span className="font-display text-lg text-slate-400">
                {application.profiles?.full_name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-slate-100">{application.profiles?.full_name || "Student"}</p>
            <p className="text-sm text-slate-400">{application.profiles?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          <button
            type="button"
            onClick={() => { setRatings({ overall: 0, technical: 0, communication: 0, teamwork: 0, reliability: 0 }); setStrengths(""); setImprovements(""); setWouldRecommend(true); setIsPublic(false); setShowForm(true); }}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            <MessageSquare className="h-4 w-4 mr-1" /> Give Feedback
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-line pt-5">
          <input type="hidden" name="job_application_id" value={application.id} />
          <input type="hidden" name="reviewer_id" value={application.profiles?.id || ""} />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Overall Rating *</label>
            <StarRating value={ratings.overall} onChange={(v) => setRatings(prev => ({ ...prev, overall: v }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Technical Skills</label>
              <StarRating value={ratings.technical} onChange={(v) => setRatings(prev => ({ ...prev, technical: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Communication</label>
              <StarRating value={ratings.communication} onChange={(v) => setRatings(prev => ({ ...prev, communication: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Teamwork</label>
              <StarRating value={ratings.teamwork} onChange={(v) => setRatings(prev => ({ ...prev, teamwork: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reliability</label>
              <StarRating value={ratings.reliability} onChange={(v) => setRatings(prev => ({ ...prev, reliability: v }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Strengths</label>
            <textarea name="strengths" rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className="w-full rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="What did the student do well?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Areas for Improvement</label>
            <textarea name="improvement_areas" rows={3} value={improvements} onChange={(e) => setImprovements(e.target.value)} className="w-full rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="What could the student improve?" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input name="would_recommend" type="checkbox" checked={wouldRecommend} onChange={(e) => setWouldRecommend(e.target.checked)} className="rounded border-line" />
              Would recommend this student
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input name="is_public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-line" />
              Show on student&apos;s public portfolio
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formPending || ratings.overall === 0} className="flex-1 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
              {formPending ? "Submitting..." : "Submit Feedback"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-line px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function FeedbackClient({ initialApplications, hasMembership }: FeedbackClientProps) {
  if (!hasMembership) {
    return (
      <div className="mt-8 text-center text-slate-400">
        <p>No company linked to your account.</p>
      </div>
    );
  }

  if (initialApplications.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-card p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-lg font-semibold text-slate-300">No interns to review yet</h3>
        <p className="mt-2 text-sm text-slate-500">Students who have been accepted for internships will appear here.</p>
      </div>
    );
  }

  return (
    <Stagger className="mt-6 space-y-4">
      {initialApplications.map((app) => (
        <StaggerItem key={app.id}>
          <FeedbackCard application={app} onSubmitFeedback={() => {}} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}