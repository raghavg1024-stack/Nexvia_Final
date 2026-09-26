import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { ApplicantsClient } from "./applicants-client";
import type { JobApplicationWithProfile } from "./applicants-client";

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile || profile.user_type !== "recruiter") redirect("/login");

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, company_id")
    .eq("id", id)
    .single();

  if (!job) return <div>Job not found</div>;

  const { data: companyMember } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", job.company_id)
    .eq("user_id", profile.id)
    .single();

  if (!companyMember) return <div>Access Denied</div>;

  const { data: applicationRows } = await supabase
    .from("job_applications")
    .select("*, profiles(*)")
    .eq("job_id", id)
    .order("match_score", { ascending: false });

  const applications = (applicationRows || []).map((application) => ({
    ...application,
    profiles: Array.isArray(application.profiles) ? application.profiles[0] ?? null : application.profiles,
  })) as JobApplicationWithProfile[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-slate-200">Applicants for {job.title}</h1>
      <p className="mt-2 text-slate-400">Sorted by Smart Match Score. Click to expand breakdown.</p>
      <div className="mt-8 space-y-4">
        <ApplicantsClient applications={applications} />
      </div>
    </div>
  );
}
