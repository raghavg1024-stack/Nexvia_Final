"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { login, type AuthState } from "@/lib/auth-actions";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const initialState: AuthState = { error: null, success: null };
const inputClass = "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm({ portalKey }: { portalKey: PortalKey }) {
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
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
      <section className="premium-card relative grid w-full max-w-4xl overflow-hidden md:grid-cols-[.8fr_1.2fr]">
        <div className="auth-panel hidden p-9 md:block"><p className="text-xs font-semibold">{portal.label} workspace</p><h2 className="mt-5 text-3xl font-semibold text-white">{portalKey === "student" ? "Designed for your career journey" : "Designed for your workspace"}</h2><p className="mt-4 text-sm leading-7">{portal.description}</p><ul className="mt-8 space-y-3">{portalSignals.map((signal) => <li key={signal} className="rounded-xl bg-black/15 px-4 py-3 text-sm font-semibold">{signal}</li>)}</ul></div>
        <div className="p-7 sm:p-9">
        <Link href="/login" className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-500 transition hover:text-accent">← Change portal</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{portal.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{portal.label} login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{portal.description}</p>
        <form action={loginAction} className="mt-8 space-y-4">
          <input type="hidden" name="portal" value={portalKey} />
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Your password" className={`${inputClass} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute bottom-0.5 right-1 flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-accent">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          </div>
          {loginState.error ? <p role="alert" className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{loginState.error}</p> : null}
          <button type="submit" disabled={loginPending} className="premium-button w-full disabled:opacity-60">
            {loginPending ? "Signing in..." : `Sign in to ${portal.label.toLowerCase()} workspace`}
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
