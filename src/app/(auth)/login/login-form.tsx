"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { login, type AuthState } from "@/lib/auth-actions";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const initialState: AuthState = { error: null, success: null };
const inputClass = "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm({ portalKey }: { portalKey: PortalKey }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const portal = PORTALS[portalKey];
  const portalSignals = {
    student: ["Personal roadmap", "XP and readiness", "AI mentor"],
    industry: ["Candidate matching", "Opportunity posts", "Evidence-led hiring"],
    academia: ["Cohort dashboard", "Skill-gap visibility", "Placement pathways"],
    parent: ["Ward progress", "Overdue tasks", "Readiness updates"],
  }[portalKey];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className={`pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-gradient-to-br ${portal.accent} opacity-15 blur-3xl`} />
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl md:grid-cols-[.8fr_1.2fr]">
        <div className={`hidden bg-gradient-to-br ${portal.accent} p-9 md:block`}><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">{portal.label} workspace</p><h2 className="mt-5 font-display text-3xl uppercase text-white">Designed around your role.</h2><p className="mt-4 text-sm leading-6 text-white/75">{portal.description}</p><ul className="mt-8 space-y-3">{portalSignals.map((signal) => <li key={signal} className="rounded-xl bg-black/15 px-4 py-3 text-sm font-semibold text-white">✓ {signal}</li>)}</ul></div>
        <div className="p-7 sm:p-9">
        <Link href="/login" className="text-xs font-semibold text-slate-500 transition hover:text-white">← Change portal</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{portal.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-white">{portal.label} Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{portal.description}</p>
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="portal" value={portalKey} />
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Your password" className={`${inputClass} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute bottom-3 right-3 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          </div>
          {state?.error ? <p role="alert" className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{state.error}</p> : null}
          <button type="submit" disabled={pending} className={`w-full rounded-xl bg-gradient-to-r ${portal.accent} px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60`}>
            {pending ? "Signing in..." : `Sign in to ${portal.label} Portal`}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account? <Link href={`/signup/${portalKey}`} className="font-semibold text-cyan-300 hover:text-white">Create one</Link>
        </p>
        <div className="mt-4 text-center"><Link href="/contact" className="text-xs text-slate-500 hover:text-cyan-300">Forgot your password? Contact support</Link></div>
        </div>
      </section>
    </main>
  );
}
