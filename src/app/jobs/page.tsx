import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobsForCareer, getSelectedCareerTitle, getEligibleJobsAndScholarships, applyToJob } from "@/lib/jobs";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";
import { revalidatePath } from "next/cache";
import { ApplyButton } from "./apply-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Jobs",
};

const TYPES: Record<string, string> = {
  "Full-time": "full_time",
  "Part-time": "part_time",
  Contract: "contract",
  Freelance: "freelance",
};

function typeLabel(type: string) {
  const key = TYPES[type] ?? type;
  return key
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function timeAgo(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function RemoteJobCard({
  job,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
  index: number;
}) {
  return (
    <StaggerItem>
      <article
        className="group flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-slate-200 sm:flex-row sm:items-start"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-slate-800">
          {job.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company_logo}
              alt={`${job.company} logo`}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="font-display text-lg text-slate-400">
              {job.company.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground group-hover:text-accent">
              {job.title}
            </p>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
              {job.company}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span>{job.location}</span>
            {job.salary_text && <span className="font-medium text-emerald-700">{job.salary_text}</span>}
            <span>{typeLabel(job.type)}</span>
            {job.posted_at && (
              <span className="text-slate-400">{timeAgo(job.posted_at)}</span>
            )}
          </div>
          <p className="prose prose-invert prose-sm mt-2 line-clamp-2 max-w-none text-slate-400">
            {job.description.replace(/\s+/g, " ").slice(0, 320)}
          </p>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit rounded-lg border border-accent/40 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Open employer website ↗
          </a>
        </div>
      </article>
    </StaggerItem>
  );
}

function LocalJobCard({
  job,
  hasApplied,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
  hasApplied: boolean;
}) {
  const handleApply = async () => {
    "use server";
    try {
      await applyToJob(job.id, job.matchScore);
      revalidatePath("/jobs");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StaggerItem>
      <div className="group flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-lg sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-slate-800">
          {job.companies?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companies.logo_url}
              alt={`${job.companies.name} logo`}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="font-display text-lg text-slate-400">
              {job.companies?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground group-hover:text-emerald-400">
                {job.title}
              </p>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                {job.companies?.name}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                {job.matchScore}% Match
              </span>
            </div>
            
            {job.source_name && job.application_url ? (
              <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400">View official listing</a>
            ) : (
              <form action={handleApply}>
                <ApplyButton hasApplied={hasApplied} />
              </form>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span>{typeLabel(job.role_type)}</span>
            {job.min_cgpa && <span className="text-amber-400">Min CGPA: {job.min_cgpa}</span>}
            {job.min_percentage && <span className="text-cyan-300">Min marks: {job.min_percentage}%</span>}
            {job.source_name && <span className="text-emerald-300">Verified source: {job.source_name}</span>}
            <span className="text-slate-400">{timeAgo(job.created_at)}</span>
          </div>
          <p className="prose prose-invert prose-sm mt-2 line-clamp-2 max-w-none text-slate-400">
            {job.description}
          </p>
          {job.required_skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {job.required_skills.map((skill: string) => (
                <span key={skill} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(job.breakdown ?? {}).map(([label, score]) => (
              <div key={label} className="rounded-lg border border-white/5 bg-slate-950/35 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-200">{String(score)}%</p>
              </div>
            ))}
          </div>
          {job.missingSkills?.length > 0 ? <p className="mt-3 text-xs text-amber-300">Improve your match: {job.missingSkills.join(", ")}</p> : null}
        </div>
      </div>
    </StaggerItem>
  );
}

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const careerTitlePromise = getSelectedCareerTitle(user.id);
  const localJobsPromise = getEligibleJobsAndScholarships(user.id);
  const applicationsPromise = supabase
    .from("job_applications")
    .select("job_id")
    .eq("user_id", user.id);

  const careerTitle = await careerTitlePromise;
  const remoteJobsPromise = careerTitle
    ? getJobsForCareer(careerTitle, 10)
    : Promise.resolve({ jobs: [], category: "your career", source: "cache" as const, lastSyncedAt: null, error: undefined });
  const [{ jobs: localJobs }, { data: myApplications }, remoteResult] = await Promise.all([
    localJobsPromise,
    applicationsPromise,
    remoteJobsPromise,
  ]);
  const { jobs: remoteJobs, category, error, source, lastSyncedAt } = remoteResult;
    
  const appliedJobIds = new Set(myApplications?.map((app) => app.job_id) || []);

  const syncedLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header>
        <Reveal>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
            Live Jobs & Internships
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Opportunities matched to your skills, CGPA, and career roadmap.
          </p>
        </Reveal>
      </header>

      {localJobs && localJobs.length > 0 && (
        <Reveal>
          <div className="mt-8">
            <h2 className="font-display text-xl uppercase tracking-tight text-emerald-400 mb-4">
              Nexvia Exclusive Matches ⭐
            </h2>
            <Stagger className="grid gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {localJobs.map((job: any) => (
                <LocalJobCard key={job.id} job={job} hasApplied={appliedJobIds.has(job.id)} />
              ))}
            </Stagger>
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-12">
          <h2 className="font-display text-xl uppercase tracking-tight text-foreground mb-4">
            Remote Board ({category})
          </h2>
          {!careerTitle ? (
            <section className="rounded-2xl border border-line bg-card p-8 text-center">
              <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                No career selected yet
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Complete the assessment and pick a path to unlock live job matches.
              </p>
              <Link
                href="/assessment"
                className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
              >
                Take the assessment
              </Link>
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-line bg-card p-8 text-center">
              <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                Jobs temporarily unavailable
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                We couldn&apos;t reach the jobs feed. Try again in a moment.
              </p>
            </section>
          ) : remoteJobs.length === 0 ? (
            <section className="rounded-2xl border border-line bg-card p-8 text-center">
              <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                No remote matches right now
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                We found no live roles related to {careerTitle}. Unrelated jobs are hidden; check again when new matching opportunities are added.
              </p>
            </section>
          ) : (
            <Stagger className="grid gap-4">
              {remoteJobs.map((job, index) => (
                <RemoteJobCard key={job.id} job={job} index={index} />
              ))}
            </Stagger>
          )}
        </div>
      </Reveal>

      <p className="mt-8 text-center text-xs text-slate-400">
        Remote jobs powered by remotejobs.org
        {source === "cache" && syncedLabel ? ` · last synced ${syncedLabel} IST` : ""}.
      </p>
    </main>
  );
}
