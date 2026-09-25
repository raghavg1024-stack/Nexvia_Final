import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-slate-500" />
        <h2 className="mt-4 text-lg font-semibold text-slate-300">Application Tracker</h2>
        <p className="mt-2 text-sm text-slate-500">Coming soon - track all your job, internship, and scholarship applications in one place.</p>
      </div>
    </main>
  );
}