import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Reveal } from "@/app/_components/motion";
import { FacultyOpportunitiesClient } from "./faculty-opportunities-client";
import { getFacultyOpportunitiesData } from "./actions";

export const dynamic = "force-dynamic";

export default async function FacultyOpportunitiesPage() {
  const { opportunities, membership } = await getFacultyOpportunitiesData();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Industry Dashboard
      </Link>

      <Reveal>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Faculty Opportunities</h1>
        <p className="mt-2 text-sm text-slate-400">Post faculty internships, FDPs, industrial training, consultancy, and research collaborations for academicians.</p>
      </Reveal>

      <Suspense fallback={<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/></div>}>
        <FacultyOpportunitiesClient initialOpportunities={opportunities} hasMembership={!!membership} />
      </Suspense>
    </main>
  );
}