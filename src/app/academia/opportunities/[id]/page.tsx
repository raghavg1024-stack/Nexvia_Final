import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FacultyOpportunityApplyClient } from "./faculty-opportunity-apply-client";
import { getFacultyOpportunity } from "./actions";

export const dynamic = "force-dynamic";

export default async function FacultyOpportunityApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getFacultyOpportunity(id);

  if (!opportunity) {
    return <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 text-center text-slate-400">Opportunity not found</div>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/academia/opportunities" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>

      <Suspense fallback={<div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-64"/>}>
        <FacultyOpportunityApplyClient initialOpportunity={opportunity} />
      </Suspense>
    </main>
  );
}