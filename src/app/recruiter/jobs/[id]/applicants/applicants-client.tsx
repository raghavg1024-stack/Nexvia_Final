"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Award, CheckCircle, Clock, MessageSquare, Star, User, XCircle } from "lucide-react";
import { updateApplicationStatus } from "./actions";
import type { ApplicationStatus } from "./actions";
import type { MatchBreakdown } from "@/lib/types";

export interface JobApplicationWithProfile {
  id: string;
  job_id: string;
  user_id: string;
  match_score: number | null;
  match_score_breakdown: MatchBreakdown | null;
  status: string;
  applied_at: string;
  status_changed_at: string | null;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    major: string | null;
    cgpa: number | null;
  } | null;
}

const statusOrder: ApplicationStatus[] = ["pending", "reviewed", "shortlisted", "interview", "hired", "rejected"];
const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
};
const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  interview: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function isApplicationStatus(status: string): status is ApplicationStatus {
  return statusOrder.some((candidate) => candidate === status);
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = isApplicationStatus(status) ? status : "pending";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[normalizedStatus]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[normalizedStatus]}
    </span>
  );
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-slate-500">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{value}%</span>
    </div>
  );
}

function BreakdownCard({ breakdown }: { breakdown: MatchBreakdown | null }) {
  if (!breakdown) return <div className="text-sm text-slate-400">No breakdown available</div>;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Match Score Breakdown</h4>
      <BreakdownBar label="Skills" value={breakdown.skills} color="#8b5cf6" />
      <BreakdownBar label="Academics" value={breakdown.academics} color="#06b6d4" />
      <BreakdownBar label="Field" value={breakdown.field} color="#f59e0b" />
      <BreakdownBar label="Career" value={breakdown.career} color="#ec4899" />
      <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
        <span className="text-xs text-slate-500">Weights: Skills 45% · Academics 25% · Field 15% · Career 15%</span>
      </div>
    </div>
  );
}

function ApplicantCard({ app }: { app: JobApplicationWithProfile }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleStatusChange = (status: ApplicationStatus) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateApplicationStatus(app.id, status);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to update application status");
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {app.profiles?.avatar_url ? (
              <Image src={app.profiles.avatar_url} alt={`${app.profiles.full_name || "Applicant"} profile photo`} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <User className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-slate-200">{app.profiles?.full_name || "Unknown Student"}</h3>
              <p className="text-sm text-slate-400">{app.profiles?.major || "No major"} · CGPA: {app.profiles?.cgpa || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Match Score</p>
              <p className="text-xl font-bold text-emerald-400">{app.match_score ?? 0}%</p>
            </div>
            <StatusBadge status={app.status} />
            <button type="button" onClick={() => setExpanded((value) => !value)} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700">
              {expanded ? <XCircle className="h-4 w-4" /> : <Star className="h-4 w-4" />}
              {expanded ? "Hide" : "Show"} Breakdown
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="mt-4 animate-slide-down border-t border-line pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <BreakdownCard breakdown={app.match_score_breakdown} />
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Change Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOrder.filter((status) => status !== app.status).map((status) => (
                      <button key={status} type="button" disabled={pending} onClick={() => handleStatusChange(status)} className={`flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50 ${statusColors[status]}`}>
                        {status === "hired" ? <Award className="h-4 w-4" /> : null}
                        {status === "interview" ? <MessageSquare className="h-4 w-4" /> : null}
                        {status === "shortlisted" ? <Star className="h-4 w-4" /> : null}
                        {status === "reviewed" ? <CheckCircle className="h-4 w-4" /> : null}
                        {status === "pending" ? <Clock className="h-4 w-4" /> : null}
                        {status === "rejected" ? <XCircle className="h-4 w-4" /> : null}
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                  {error ? <p role="alert" className="mt-3 text-sm text-rose-500">{error}</p> : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  <p><strong>Applied:</strong> {new Date(app.applied_at).toLocaleDateString()}</p>
                  <p><strong>Status changed:</strong> {app.status_changed_at ? new Date(app.status_changed_at).toLocaleDateString() : "N/A"}</p>
                  {app.profiles?.email ? <p><strong>Email:</strong> {app.profiles.email}</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ApplicantsClient({ applications }: { applications: JobApplicationWithProfile[] }) {
  if (applications.length === 0) {
    return <div className="rounded-xl border border-line bg-card p-12 text-center text-slate-400">No applicants yet. Check back later!</div>;
  }

  return <>{applications.map((application) => <ApplicantCard key={application.id} app={application} />)}</>;
}
