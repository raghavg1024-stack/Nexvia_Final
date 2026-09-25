import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CheckCircle, XCircle, Clock, Briefcase, MessageSquare, Award, Star, AlertTriangle } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { updateApplicationStatus } from "./actions";
import type { MatchBreakdown } from "@/lib/types";

interface JobApplicationWithProfile {
  id: string;
  job_id: string;
  user_id: string;
  match_score: number | null;
  match_score_breakdown: MatchBreakdown | null;
  status: string;
  applied_at: string;
  status_changed_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    major: string | null;
    cgpa: number | null;
  } | null;
}

const STATUS_ORDER = ["pending", "reviewed", "shortlisted", "interview", "hired", "rejected"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  interview: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-slate-500">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{value}%</span>
    </div>
  );
}

function BreakdownCard({ breakdown }: { breakdown: MatchBreakdown | null }) {
  if (!breakdown) return <div className="text-slate-400 text-sm">No breakdown available</div>;
  
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 space-y-3">
      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Match Score Breakdown</h4>
      <BreakdownBar label="Skills" value={breakdown.skills} color="#8b5cf6" />
      <BreakdownBar label="Academics" value={breakdown.academics} color="#06b6d4" />
      <BreakdownBar label="Field" value={breakdown.field} color="#f59e0b" />
      <BreakdownBar label="Career" value={breakdown.career} color="#ec4899" />
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-500">Weights: Skills 45% · Academics 25% · Field 15% · Career 15%</span>
      </div>
    </div>
  );
}

export default async function ApplicantsPage({ params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile || profile.user_type !== "recruiter") {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("title, company_id")
    .eq("id", params.id)
    .single();

  if (!job) {
    return <div>Job not found</div>;
  }

  const { data: companyMember } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", job.company_id)
    .eq("user_id", profile.id)
    .single();

  if (!companyMember) {
    return <div>Access Denied</div>;
  }

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*, profiles(*)")
    .eq("job_id", params.id)
    .order("match_score", { ascending: false });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.ok) {
      // Force re-render by revalidating
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold text-slate-200">Applicants for {job.title}</h1>
      <p className="mt-2 text-slate-400">Sorted by Smart Match Score. Click to expand breakdown.</p>

      <div className="mt-8 space-y-4">
        {applications && applications.length > 0 ? (
          (applications as JobApplicationWithProfile[]).map((app) => (
            <ApplicantCard 
              key={app.id} 
              app={app} 
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="rounded-xl border border-line bg-card p-12 text-center text-slate-400">
            No applicants yet. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ app, onStatusChange }: { app: JobApplicationWithProfile; onStatusChange: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const currentIndex = STATUS_ORDER.indexOf(app.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1 
    ? STATUS_ORDER[currentIndex + 1] 
    : null;
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;

  return (
    <div className="rounded-xl border border-line bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {app.profiles?.avatar_url ? (
              <img src={app.profiles.avatar_url} alt={`${app.profiles?.full_name || "Applicant"} profile photo`} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <User className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-slate-200">{app.profiles?.full_name || "Unknown Student"}</h3>
              <p className="text-sm text-slate-400">
                {app.profiles?.major || "No major"} • CGPA: {app.profiles?.cgpa || "N/A"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Match Score</p>
              <p className="text-xl font-bold text-emerald-400">{app.match_score}%</p>
            </div>
            
            <StatusBadge status={app.status} />
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {expanded ? <XCircle className="h-4 w-4" /> : <Star className="h-4 w-4" />}
              {expanded ? "Hide" : "Show"} Breakdown
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-line pt-4 mt-4 animate-slide-down">
            <div className="grid gap-4 md:grid-cols-2">
              <BreakdownCard breakdown={app.match_score_breakdown} />
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Change Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ORDER
                      .filter(s => s !== app.status)
                      .map((status) => (
                        <button
                          key={status}
                          onClick={() => onStatusChange(app.id, status)}
                          className={`flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                            STATUS_COLORS[status]
                          }`}
                        >
                          {status === "hired" && <Award className="h-4 w-4" />}
                          {status === "interview" && <MessageSquare className="h-4 w-4" />}
                          {status === "shortlisted" && <Star className="h-4 w-4" />}
                          {status === "reviewed" && <CheckCircle className="h-4 w-4" />}
                          {status === "pending" && <Clock className="h-4 w-4" />}
                          {status === "rejected" && <XCircle className="h-4 w-4" />}
                          {STATUS_LABELS[status]}
                        </button>
                      ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-600 dark:text-slate-400">
                  <p><strong>Applied:</strong> {new Date(app.applied_at).toLocaleDateString()}</p>
                  <p><strong>Status changed:</strong> {app.status_changed_at ? new Date(app.status_changed_at).toLocaleDateString() : "N/A"}</p>
                  {app.profiles?.email && <p><strong>Email:</strong> {app.profiles.email}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}