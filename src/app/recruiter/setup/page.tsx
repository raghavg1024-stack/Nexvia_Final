"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { createCompanyAction } from "./actions";

export default function RecruiterSetupPage() {
  const [state, formAction, pending] = useActionState(createCompanyAction, { error: null });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to recruiter dashboard
      </Link>
      <div className="rounded-3xl border border-violet-400/20 bg-card p-6 shadow-[0_24px_80px_rgba(76,29,149,.16)] sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Building2 className="h-6 w-6" /></div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Create Company Profile</h1>
        <p className="mt-2 text-sm text-slate-400">Set up your recruiter workspace, post opportunities, and discover students ranked by skill and academic fit.</p>

        <form action={formAction} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-300">Company name *
            <input name="name" required maxLength={100} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Nexvia Labs" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">Company description
            <textarea name="description" rows={4} maxLength={800} className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="Tell students what your company builds and values." />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-300">Website
              <input name="website" type="url" className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://company.com" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">Logo URL
              <input name="logo_url" type="url" className="rounded-xl border border-line bg-background px-4 py-3 text-slate-100 outline-none focus:border-accent" placeholder="https://company.com/logo.png" />
            </label>
          </div>
          {state.error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{state.error}</p> : null}
          <button disabled={pending} className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60">
            {pending ? "Creating workspace…" : "Create Recruiter Workspace"}
          </button>
        </form>
      </div>
    </main>
  );
}
