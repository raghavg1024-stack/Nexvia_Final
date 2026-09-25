import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEligibleJobsAndScholarships } from "@/lib/jobs";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "@/app/_components/motion";
import { GraduationCap, Calendar, DollarSign, ExternalLink, ShieldCheck, CircleAlert, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internships & Scholarships",
};

function typeLabel(type: string) {
  const TYPES: Record<string, string> = {
    "internship": "Internship",
    "part_time": "Part Time",
    "full_time": "Full Time",
  };
  return TYPES[type] || type;
}

export default async function ScholarshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { jobs: internships, scholarships } = await getEligibleJobsAndScholarships(user.id);
  const { data: academicProfile } = await supabase
    .from("profiles")
    .select("cgpa,current_percentage,major,skill_tags,gender,social_category,annual_family_income,disability_percentage,domicile_state")
    .eq("id", user.id)
    .maybeSingle();
  const profileNeedsDetails = !academicProfile?.cgpa || !academicProfile?.current_percentage || !academicProfile?.major || !academicProfile?.skill_tags?.length;

  return (
    <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header>
        <Reveal>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
            Internships & Scholarships
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Live official opportunities ranked by your skills, academics, field of study, and eligibility details.
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">Match scores are Nexvia recommendations—not scholarship approvals. Always confirm every rule on the official provider website before applying.</p>
        </Reveal>
      </header>

      {profileNeedsDetails ? (
        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-200">Complete your academic profile for accurate matching</p>
              <p className="mt-1 text-sm text-slate-400">Add your CGPA, current marks, major, and skills so Nexvia can hide ineligible opportunities and improve match scores.</p>
            </div>
            <Link href="/profile" className="shrink-0 rounded-xl bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-amber-950 hover:bg-amber-200">Update Profile</Link>
          </div>
        </Reveal>
      ) : null}

      {/* INTERNSHIPS SECTION */}
      <div className="mt-12">
        <Reveal>
          <h2 className="font-display text-xl uppercase tracking-tight text-emerald-400 mb-6">
            Recommended Internships & Jobs
          </h2>
        </Reveal>
        
        {internships && internships.length > 0 ? (
          <Stagger className="grid gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {internships.map((job: any) => (
              <StaggerItem key={job.id}>
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
                          {job.matchScore}% Profile Match
                        </span>
                      </div>
                      {job.application_url ? <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400">
                        View official listing <ExternalLink className="h-3.5 w-3.5" />
                      </a> : <span className="rounded-lg border border-line px-4 py-1.5 text-sm text-slate-500">Application link coming soon</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                      <span>{typeLabel(job.role_type)}</span>
                      {job.min_cgpa && <span className="text-amber-400">Min CGPA: {job.min_cgpa}</span>}
                      {job.min_percentage && <span className="text-cyan-300">Min marks: {job.min_percentage}%</span>}
                      {job.source_name ? <span className="inline-flex items-center gap-1 text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Official source: {job.source_name}</span> : null}
                    </div>
                    <p className="prose prose-invert prose-sm mt-2 line-clamp-2 max-w-none text-slate-400">
                      {job.description}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Object.entries(job.breakdown ?? {}).map(([label, score]) => (
                        <div key={label} className="rounded-lg border border-white/5 bg-slate-950/35 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-200">{String(score)}%</p>
                        </div>
                      ))}
                    </div>
                    {job.missingSkills?.length > 0 ? <p className="mt-3 text-xs text-amber-300">Improve match: learn {job.missingSkills.join(", ")}</p> : <p className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Your saved skills cover this opportunity&apos;s core requirements.</p>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal>
            <div className="rounded-2xl border border-line bg-card p-8 text-center">
              <p className="text-slate-400">No internships matching your profile right now.</p>
            </div>
          </Reveal>
        )}
      </div>

      {/* SCHOLARSHIPS SECTION */}
      <div className="mt-12">
        <Reveal>
          <h2 className="font-display text-xl uppercase tracking-tight text-foreground mb-6">
            Eligible Scholarships
          </h2>
        </Reveal>
        {scholarships && scholarships.length > 0 ? (
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {scholarships.map((item: any) => (
              <StaggerItem key={item.id}>
                <div className="group flex flex-col justify-between h-full rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-200">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.provider_name}</p>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-slate-400 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span>{item.amount}</span>
                      </div>
                      {item.deadline && (
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1">
                          <Calendar className="h-4 w-4 text-rose-400" />
                          <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300"><ShieldCheck className="h-4 w-4" /> Official NSP listing</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Object.entries(item.breakdown ?? {}).map(([label, score]) => (
                        <div key={label} className="rounded-lg border border-white/5 bg-slate-950/35 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-200">{String(score)}%</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold text-amber-200"><CircleAlert className="h-3.5 w-3.5" /> {item.matchScore}% profile match · official confirmation required</p>
                      {item.eligibility_notes ? <p className="mt-1.5 text-xs leading-5 text-slate-400">{item.eligibility_notes}</p> : null}
                      {item.checks?.map((check: { label: string; status: string; detail: string }) => (
                        <p key={check.label} className={`mt-1 text-xs ${check.status === "pass" ? "text-emerald-300" : check.status === "fail" ? "text-red-300" : "text-amber-300"}`}>{check.label}: {check.detail}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      {item.min_cgpa && <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-amber-300">Min CGPA: {item.min_cgpa}</span>}
                      {item.min_percentage && <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-cyan-300">Min marks: {item.min_percentage}%</span>}
                      <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-violet-200">{item.matchScore}% match</span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {item.source_url ? <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-slate-300 hover:border-accent/40 hover:text-white">Official Rules <ExternalLink className="h-3.5 w-3.5" /></a> : null}
                      {item.application_url ? <a href={item.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90">
                        View scheme on NSP <ExternalLink className="h-3.5 w-3.5" />
                      </a> : <span className="rounded-lg border border-line px-3 py-2 text-xs text-slate-500">Application link coming soon</span>}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal>
            <section className="rounded-2xl border border-line bg-card p-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-slate-500" />
              <h2 className="mt-4 font-display text-xl uppercase tracking-tight text-foreground">
                No scholarships available
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                We couldn&apos;t find any scholarships matching your profile at the moment. 
                Keep your CGPA and details updated to see new opportunities.
              </p>
            </section>
          </Reveal>
        )}
      </div>
    </main>
  );
}
