import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CheckCircle, XCircle } from "lucide-react";
import { getProfile } from "@/lib/profile";

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

  // Ensure this recruiter owns the company for this job
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold text-slate-200">Applicants for {job.title}</h1>
      <p className="mt-2 text-slate-400">Sorted by Smart Match Score.</p>

      <div className="mt-8 space-y-4">
        {applications && applications.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          applications.map((app: any) => (
            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-line bg-card p-6 gap-4">
              <div className="flex items-center gap-4">
                {app.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                
                <div className="flex items-center gap-2">
                  <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle className="h-4 w-4" /> Accept
                  </button>
                  <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
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
