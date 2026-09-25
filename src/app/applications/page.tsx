import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Reveal } from "@/app/_components/motion";
import { ApplicationsClient } from "./applications-client-new";
import { getApplicationsData } from "./actions";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const { applications, jobApplications } = await getApplicationsData();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Reveal>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
          <Briefcase className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Application Tracker</h1>
        <p className="mt-2 text-sm text-slate-400">Track all your job, internship, scholarship, and faculty opportunity applications in one place.</p>
      </Reveal>

      <Suspense fallback={<div className="mt-8 space-y-4"><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-32"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-32"/></div>}>
        <ApplicationsClient initialApplications={applications} initialJobApplications={jobApplications} />
      </Suspense>
    </main>
  );
}