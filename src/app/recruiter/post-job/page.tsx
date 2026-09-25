"use client";

import { useActionState } from "react";
import { postJobAction } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostJobPage() {
  const [state, formAction, pending] = useActionState(postJobAction, { error: null });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold text-slate-200">Post a Job or Internship</h1>
      <p className="mt-2 text-slate-400">Fill in the details to find the best students for your role.</p>

      <form action={formAction} className="mt-8 space-y-6 rounded-2xl border border-line bg-card p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300">Job Title *</label>
          <input type="text" id="title" name="title" required className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Machine Learning Intern" />
        </div>

        <div>
          <label htmlFor="role_type" className="block text-sm font-medium text-slate-300">Role Type *</label>
          <select id="role_type" name="role_type" required className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent">
            <option value="internship">Internship</option>
            <option value="part_time">Part Time</option>
            <option value="full_time">Full Time</option>
          </select>
        </div>

        <div>
          <label htmlFor="min_cgpa" className="block text-sm font-medium text-slate-300">Minimum CGPA (Optional)</label>
          <input type="number" id="min_cgpa" name="min_cgpa" step="0.01" min="0" max="10" className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. 3.5" />
          <p className="mt-1 text-xs text-slate-500">Students with a lower CGPA won&apos;t see this job.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_percentage" className="block text-sm font-medium text-slate-300">Minimum Current Marks %</label>
            <input type="number" id="min_percentage" name="min_percentage" step="0.01" min="0" max="100" className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. 70" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300">Location</label>
            <input type="text" id="location" name="location" maxLength={120} className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="Remote or Bengaluru" />
          </div>
        </div>

        <div>
          <label htmlFor="eligible_majors" className="block text-sm font-medium text-slate-300">Eligible Majors (Comma separated)</label>
          <input type="text" id="eligible_majors" name="eligible_majors" className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Computer Science, Data Science" />
          <p className="mt-1 text-xs text-slate-500">Leave blank to allow students from every major.</p>
        </div>

        <div>
          <label htmlFor="required_skills" className="block text-sm font-medium text-slate-300">Required Skills (Comma separated)</label>
          <input type="text" id="required_skills" name="required_skills" className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Python, Pandas, Machine Learning" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description *</label>
          <textarea id="description" name="description" rows={5} required className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="Describe the role..."></textarea>
        </div>

        <div>
          <label htmlFor="application_url" className="block text-sm font-medium text-slate-300">Application URL</label>
          <input type="url" id="application_url" name="application_url" className="mt-1 block w-full rounded-lg border border-line bg-background px-3 py-2 text-slate-200 focus:border-accent focus:ring-1 focus:ring-accent" placeholder="https://company.com/apply" />
        </div>

        {state?.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <button type="submit" disabled={pending} className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {pending ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
