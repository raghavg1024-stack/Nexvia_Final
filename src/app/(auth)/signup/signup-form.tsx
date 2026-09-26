"use client";

import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { signup, type AuthState } from "@/lib/auth-actions";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const initialState: AuthState = { error: null, success: null };
const inputClass = "auth-input mt-2 h-12 w-full rounded-xl border border-[#c9c8bf] bg-white px-4 text-[15px] text-[#151914] outline-none transition placeholder:text-[#8c8f87] hover:border-[#9b9d94] focus:border-[#151914] focus:ring-4 focus:ring-[#151914]/[.08]";
const accents: Record<PortalKey, string> = { student: "#c8f36a", industry: "#ffb86b", academia: "#8dd8ff", parent: "#f3a6c8" };

export function SignupForm({ portalKey }: { portalKey: PortalKey }) {
  const [state, formAction, pending] = useActionState(signup, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const portal = PORTALS[portalKey];
  const accent = accents[portalKey];
  const steps = [
    "Create your secure account",
    portalKey === "student" ? "Map your strengths and goals" : `Set up your ${portal.label.toLowerCase()} workspace`,
    portalKey === "student" ? "Unlock your first career quest" : "Open your role-specific dashboard",
  ];

  if (state.success) {
    return (
      <main className="auth-premium grid min-h-screen place-items-center bg-[#07110d] px-4 py-10 text-[#f4f1e8]">
        <section className="auth-shell auth-rail w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0f2018] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)] sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-[#07110d]" style={{ backgroundColor: accent }}><MailCheck className="h-6 w-6" /></span>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[.18em] text-[#7f8d85]">Account quest started</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.035em]">Confirm your email</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#a7b1aa]">{state.success}</p>
          <Link href={`/login/${portalKey}`} className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-[#f4f1e8] px-6 text-sm font-bold text-[#151914] transition hover:-translate-y-0.5">Continue to {portal.label} login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-premium min-h-screen bg-[#07110d] px-4 py-5 text-[#f4f1e8] sm:px-6 lg:px-8">
      <div className="auth-shell mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1712] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
        <header className="auth-header flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexvia home"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f1e8] font-display text-sm text-[#07110d]">NX</span><span className="font-display text-lg tracking-wide">NEXVIA</span></Link>
          <div className="flex items-center gap-2 text-xs text-[#a7b1aa]"><ShieldCheck className="h-4 w-4" style={{ color: accent }} /> Secure account creation</div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[.9fr_1.1fr]">
          <aside className="auth-rail relative overflow-hidden border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="auth-grid absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative">
              <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-[#a7b1aa] transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Change profile</Link>
              <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#bec7c0]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />{portal.label} onboarding</div>
              <h1 className="mt-6 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-.04em] sm:text-5xl">Create your<br />player profile.</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#9eaaa2]">A focused setup that gets you to useful work quickly—without a long onboarding maze.</p>
              <ol className="mt-10 space-y-3">
                {steps.map((step, index) => (
                  <li key={step} className="auth-rail-card flex items-center gap-4 rounded-xl border border-white/10 bg-[#0f2018] p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-[#07110d]" style={{ backgroundColor: index === 0 ? accent : "#334139", color: index === 0 ? "#07110d" : "#a7b1aa" }}>{index + 1}</span>
                    <span className="text-sm font-semibold text-[#d4dad6]">{step}</span>
                    {index === 0 ? <Check className="ml-auto h-4 w-4" style={{ color: accent }} /> : null}
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <section className="auth-form-panel flex items-center bg-[#f4f1e8] p-5 text-[#151914] sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-[470px]">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#73776f]">New {portal.label.toLowerCase()} profile</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">Start your journey</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d716a]">One account gives you a private, role-specific Nexvia workspace.</p>
              <form action={formAction} className="mt-7 space-y-4">
                <input type="hidden" name="portal" value={portalKey} />
                <div><label htmlFor="full_name" className="text-sm font-semibold">Full name</label><input id="full_name" name="full_name" required autoComplete="name" placeholder="Aarav Sharma" className={inputClass} /></div>
                <div><label htmlFor="signup-email" className="text-sm font-semibold">Email address</label><input id="signup-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} /></div>
                <div>
                  <label htmlFor="signup-password" className="text-sm font-semibold">Create password</label>
                  <div className="relative"><input id="signup-password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={`${inputClass} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute bottom-3 right-3 rounded-md p-1 text-[#73776f] transition hover:bg-[#efeee8] hover:text-[#151914]">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                </div>
                {state.error ? <p role="alert" className="rounded-xl border border-[#e2a79f] bg-[#fff0ed] px-4 py-3 text-sm leading-5 text-[#9b3328]">{state.error}</p> : null}
                <button type="submit" disabled={pending} className="auth-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#151914] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#283027] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"><Sparkles className="h-4 w-4" style={{ color: accent }} />{pending ? "Creating profile..." : `Create ${portal.label} profile`}</button>
              </form>
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#d8d6ce] pt-6 text-sm"><span className="text-[#747870]">Already registered?</span><Link href={`/login/${portalKey}`} className="font-bold text-[#151914] underline decoration-2 underline-offset-4">Sign in</Link></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
