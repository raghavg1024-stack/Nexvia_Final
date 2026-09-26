"use client";

import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Trophy, Zap } from "lucide-react";
import { type ClipboardEvent, type KeyboardEvent, useActionState, useRef, useState } from "react";
import { cancelLoginOtp, login, requestLoginOtp, resendLoginOtp, verifyLoginOtp, type AuthState } from "@/lib/auth-actions";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const initialState: AuthState = { error: null, success: null };
const inputClass = "auth-input mt-2 h-12 w-full rounded-xl border border-[#c9c8bf] bg-white px-4 text-[15px] text-[#151914] outline-none transition placeholder:text-[#8c8f87] hover:border-[#9b9d94] focus:border-[#151914] focus:ring-4 focus:ring-[#151914]/[.08]";
const portalExperience: Record<PortalKey, { accent: string; accentSoft: string; mission: string; rank: string; progress: number; signals: string[] }> = {
  student: { accent: "#c8f36a", accentSoft: "#23331c", mission: "Build a career path that proves what you can do.", rank: "Explorer", progress: 42, signals: ["Personal career map", "Skill quests and XP", "Verified project proof"] },
  industry: { accent: "#ffb86b", accentSoft: "#352719", mission: "Find evidence-backed talent without the hiring noise.", rank: "Talent scout", progress: 68, signals: ["Skills-first matching", "Candidate evidence", "Opportunity control room"] },
  academia: { accent: "#8dd8ff", accentSoft: "#172e39", mission: "Turn cohort signals into measurable learner outcomes.", rank: "Navigator", progress: 57, signals: ["Cohort readiness", "Curriculum skill gaps", "Placement pathways"] },
  parent: { accent: "#f3a6c8", accentSoft: "#35212b", mission: "Support progress without taking over the journey.", rank: "Guide", progress: 35, signals: ["Progress snapshots", "Milestone alerts", "Readiness context"] },
};

function maskEmail(email?: string) {
  if (!email) return "your inbox";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function OtpInput() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, value: string) {
    const numeric = value.replace(/\D/g, "");
    if (numeric.length > 1) {
      const incoming = numeric.slice(0, 6 - index).split("");
      setDigits((current) => current.map((item, itemIndex) => (
        itemIndex >= index && itemIndex < index + incoming.length
          ? incoming[itemIndex - index]
          : item
      )));
      inputs.current[Math.min(index + incoming.length, 6) - 1]?.focus();
      return;
    }

    const digit = numeric.slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] ?? ""));
    inputs.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  return (
    <div onPaste={handlePaste}>
      <input type="hidden" name="otp" value={digits.join("")} />
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { inputs.current[index] = element; }}
            value={digit}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Verification digit ${index + 1}`}
            maxLength={1}
            className="auth-otp-input aspect-square min-w-0 rounded-xl border border-[#c9c8bf] bg-white text-center font-mono text-xl font-bold text-[#151914] outline-none transition focus:border-[#151914] focus:ring-4 focus:ring-[#151914]/[.08]"
          />
        ))}
      </div>
    </div>
  );
}

function FormError({ message }: { message?: string | null }) {
  return message ? <p role="alert" className="rounded-xl border border-[#e2a79f] bg-[#fff0ed] px-4 py-3 text-sm leading-5 text-[#9b3328]">{message}</p> : null;
}

export function LoginForm({ portalKey }: { portalKey: PortalKey }) {
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [requestState, requestAction, requestPending] = useActionState(requestLoginOtp, initialState);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyLoginOtp, initialState);
  const [resendState, resendAction, resendPending] = useActionState(resendLoginOtp, initialState);
  const portal = PORTALS[portalKey];
  const experience = portalExperience[portalKey];
  const isOtpStep = requestState.step === "otp";

  return (
    <main className="auth-premium min-h-screen bg-[#07110d] px-4 py-5 text-[#f4f1e8] sm:px-6 lg:px-8">
      <div className="auth-shell mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1712] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
        <header className="auth-header flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexvia home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f1e8] font-display text-sm text-[#07110d]">NX</span>
            <span className="font-display text-lg tracking-wide">NEXVIA</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#a7b1aa]"><ShieldCheck className="h-4 w-4" style={{ color: experience.accent }} /><span>Secure workspace access</span></div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[.9fr_1.1fr]">
          <aside className="auth-rail relative overflow-hidden border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="auth-grid absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative flex h-full flex-col">
              <Link href="/login" className="inline-flex w-fit items-center gap-2 text-sm text-[#a7b1aa] transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Change workspace</Link>
              <div className="mt-12 max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#bec7c0]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: experience.accent }} />{portal.label} access</div>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-.04em] text-[#f4f1e8] sm:text-5xl">Continue your<br />Nexvia journey.</h1>
                <p className="mt-5 max-w-sm text-base leading-7 text-[#9eaaa2]">{experience.mission}</p>
              </div>
              <div className="auth-rail-card mt-10 rounded-2xl border border-white/10 bg-[#0f2018] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#718078]">Workspace rank</p><p className="mt-2 flex items-center gap-2 font-semibold text-white"><Trophy className="h-4 w-4" style={{ color: experience.accent }} /> {experience.rank}</p></div>
                  <span className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold text-[#07110d]" style={{ backgroundColor: experience.accent }}>LVL {Math.ceil(experience.progress / 10)}</span>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${experience.progress}%`, backgroundColor: experience.accent }} /></div>
                <div className="mt-5 grid gap-2">
                  {experience.signals.map((signal) => <div key={signal} className="flex items-center gap-3 text-sm text-[#c1cac4]"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ backgroundColor: experience.accentSoft, color: experience.accent }}><Check className="h-3 w-3" /></span>{signal}</div>)}
                </div>
              </div>
              <p className="mt-auto hidden pt-8 text-xs leading-5 text-[#65736b] lg:block">Your progress stays private. Nexvia uses your activity only to personalize your workspace and recommendations.</p>
            </div>
          </aside>

          <section className="auth-form-panel flex items-center bg-[#f4f1e8] p-5 text-[#151914] sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-[470px]">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#73776f]">Access quest</p><p className="mt-1 text-sm font-semibold">Stage {isOtpStep ? "2" : "1"} of 2</p></div>
                <div className="flex gap-1.5" aria-label={`Stage ${isOtpStep ? 2 : 1} of 2`}><span className="h-1.5 w-10 rounded-full" style={{ backgroundColor: experience.accent }} /><span className={`h-1.5 w-10 rounded-full ${isOtpStep ? "" : "bg-[#d5d4cc]"}`} style={isOtpStep ? { backgroundColor: experience.accent } : undefined} /></div>
              </div>

              {isOtpStep ? (
                <div className="mt-10">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#151914] text-white"><Mail className="h-5 w-5" /></span>
                  <h2 className="mt-6 text-3xl font-semibold tracking-[-.035em]">Check your email</h2>
                  <p className="mt-3 text-sm leading-6 text-[#656961]">We sent a secure sign-in email to <strong className="text-[#151914]">{maskEmail(requestState.email)}</strong>. Enter the six-digit code if one is shown, or use the secure link in that email.</p>
                  <form action={verifyAction} className="mt-7 space-y-5">
                    <OtpInput />
                    <FormError message={verifyState.error} />
                    <button type="submit" disabled={verifyPending} className="auth-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#151914] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#283027] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole className="h-4 w-4" /> {verifyPending ? "Checking code..." : "Unlock workspace"}</button>
                  </form>
                  <div className="mt-4"><FormError message={resendState.error} />{resendState.success ? <p role="status" className="rounded-xl border border-[#a8c888] bg-[#eef8e5] px-4 py-3 text-sm text-[#3e6126]">{resendState.success}</p> : null}</div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#d8d6ce] pt-5 text-sm">
                    <form action={resendAction}><button type="submit" disabled={resendPending} className="font-semibold text-[#32372f] underline decoration-[#a8aaa2] underline-offset-4 hover:decoration-[#151914] disabled:opacity-50">{resendPending ? "Sending..." : "Send a fresh email"}</button></form>
                    <form action={cancelLoginOtp}><button type="submit" className="text-[#6d716a] transition hover:text-[#151914]">Start over</button></form>
                  </div>
                </div>
              ) : (
                <div className="mt-10">
                  <h2 className="text-3xl font-semibold tracking-[-.035em]">Welcome back</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6d716a]">Choose the quickest way back into your {portal.label.toLowerCase()} workspace.</p>
                  <div className="auth-segment mt-7 grid grid-cols-2 rounded-xl bg-[#e4e2d9] p-1" role="tablist" aria-label="Sign-in method">
                    <button type="button" role="tab" aria-selected={method === "password"} onClick={() => setMethod("password")} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${method === "password" ? "bg-white text-[#151914] shadow-sm" : "text-[#70746c] hover:text-[#151914]"}`}><KeyRound className="h-4 w-4" /> Password</button>
                    <button type="button" role="tab" aria-selected={method === "otp"} onClick={() => setMethod("otp")} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${method === "otp" ? "bg-white text-[#151914] shadow-sm" : "text-[#70746c] hover:text-[#151914]"}`}><Mail className="h-4 w-4" /> Email code</button>
                  </div>

                  {method === "password" ? (
                    <form action={loginAction} className="mt-6 space-y-4">
                      <input type="hidden" name="portal" value={portalKey} />
                      <div><label htmlFor="login-email" className="text-sm font-semibold">Email address</label><input id="login-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} /></div>
                      <div>
                        <div className="flex items-center justify-between gap-3"><label htmlFor="login-password" className="text-sm font-semibold">Password</label><Link href="/contact" className="text-xs font-semibold text-[#62675f] underline decoration-[#b7b8b1] underline-offset-4 hover:text-[#151914]">Need help?</Link></div>
                        <div className="relative"><input id="login-password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className={`${inputClass} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute bottom-3 right-3 rounded-md p-1 text-[#73776f] transition hover:bg-[#efeee8] hover:text-[#151914]">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                      </div>
                      <FormError message={loginState.error} />
                      <button type="submit" disabled={loginPending} className="auth-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#151914] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#283027] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"><Zap className="h-4 w-4" style={{ color: experience.accent }} /> {loginPending ? "Opening workspace..." : "Continue to workspace"}</button>
                    </form>
                  ) : (
                    <form action={requestAction} className="mt-6 space-y-4">
                      <input type="hidden" name="portal" value={portalKey} />
                      <div><label htmlFor="otp-email" className="text-sm font-semibold">Account email</label><input id="otp-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} /><p className="mt-2 text-xs leading-5 text-[#777b73]">We will send a secure email with a code or sign-in link. No password needed.</p></div>
                      <FormError message={requestState.error} />
                      <button type="submit" disabled={requestPending} className="auth-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#151914] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#283027] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"><Mail className="h-4 w-4" /> {requestPending ? "Sending secure email..." : "Send sign-in email"}</button>
                    </form>
                  )}
                </div>
              )}

              {!isOtpStep ? <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#d8d6ce] pt-6 text-sm"><span className="text-[#747870]">New to Nexvia?</span><Link href={`/signup/${portalKey}`} className="font-bold text-[#151914] underline decoration-2 underline-offset-4">Create an account</Link></div> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
