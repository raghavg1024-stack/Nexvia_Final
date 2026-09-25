import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { getCompanyByUserId, getTopStudentMatches } from "@/lib/jobs";
import { Reveal } from "@/app/_components/motion";
import { Plus, Users, Building2, Briefcase } from "lucide-react";

export const metadata = {
  title: "Industry Dashboard",
};

export default async function RecruiterDashboard() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.user_type !== "recruiter") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <div className="max-w-xl rounded-3xl border border-violet-400/20 bg-card p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 text-2xl font-bold text-slate-200">Industry Workspace</h1>
          <p className="mt-2 text-slate-400">Create a company profile to post internships and jobs, set eligibility rules, and discover the strongest student matches.</p>
          <Link href="/recruiter/setup" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90">Create Company Profile</Link>
        </div>
      </div>
    );
  }

  const company = await getCompanyByUserId(profile.id);

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-200">Industry Dashboard</h1>
        <div className="mt-8 rounded-2xl border border-line bg-card p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-xl font-semibold text-slate-300">No Company Linked</h2>
          <p className="mt-2 text-slate-400">
            You need to create a company profile before you can post jobs.
          </p>
          <Link href="/recruiter/setup" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90">Create Company Profile</Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, job_applications(id)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });
  const jobsWithMatches = await Promise.all((jobs ?? []).map(async (job) => ({
    ...job,
    topMatches: await getTopStudentMatches(job.id, 3),
  })));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <Reveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={`${company.name} company logo`} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl tracking-tight text-slate-200">{company.name}</h1>
              <p className="text-slate-400">Industry Dashboard</p>
            </div>
          </div>
          <Link
            href="/recruiter/post-job"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" /> Post a Job
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-200">
                  {jobsWithMatches.filter(j => j.status === 'open').length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Applicants</p>
                <p className="text-2xl font-bold text-slate-200">
                  {jobsWithMatches.reduce((sum, job) => sum + (job.job_applications?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="rounded-2xl border border-line bg-card">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-display text-lg tracking-tight text-slate-200">Your Posted Jobs</h2>
          </div>
          <div className="divide-y divide-line">
            {jobsWithMatches.length > 0 ? (
              jobsWithMatches.map((job) => (
                <div key={job.id} className="flex flex-col gap-4 p-6 hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-slate-200">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-400 capitalize">{job.role_type.replace("_", " ")}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[.16em] text-cyan-300">Top Matches</span>
                      {job.topMatches.length > 0 ? job.topMatches.map((candidate: { user_id: string; display_name: string; matchScore: number }, index: number) => (
                        <span key={candidate.user_id} className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-2.5 py-1 text-xs text-violet-200">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {candidate.display_name} · {candidate.matchScore}%
                        </span>
                      )) : <span className="text-xs text-slate-500">No opted-in candidates yet</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${job.status === 'open' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-400/10 text-slate-400'}`}>
                      {job.status}
                    </span>
                    <Link
                      href={`/recruiter/jobs/${job.id}/applicants`}
                      className="text-sm font-medium text-accent hover:text-accent/80"
                    >
                      View {job.job_applications?.length || 0} Applicants
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-400">You haven&apos;t posted any jobs yet.</p>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
