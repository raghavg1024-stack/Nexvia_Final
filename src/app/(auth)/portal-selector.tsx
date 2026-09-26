import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Building2, GraduationCap, HeartHandshake, Play, School, ShieldCheck, type LucideIcon } from "lucide-react";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const portalMeta: Record<PortalKey, { icon: LucideIcon; accent: string; code: string; unlocks: string }> = {
  student: { icon: GraduationCap, accent: "#c8f36a", code: "01", unlocks: "Roadmap · Mentor · XP" },
  industry: { icon: Building2, accent: "#ffb86b", code: "02", unlocks: "Talent · Jobs · Evidence" },
  academia: { icon: School, accent: "#8dd8ff", code: "03", unlocks: "Cohorts · Gaps · Outcomes" },
  parent: { icon: HeartHandshake, accent: "#f3a6c8", code: "04", unlocks: "Progress · Alerts · Support" },
};

export function PortalSelector({ mode }: { mode: "login" | "signup" }) {
  return (
    <main className="auth-premium min-h-screen bg-[#07110d] px-4 py-5 text-[#f4f1e8] sm:px-6 lg:px-8">
      <div className="auth-shell mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1712] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
        <header className="auth-header flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexvia home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f1e8] font-display text-sm text-[#07110d]">NX</span>
            <span className="font-display text-lg tracking-wide">NEXVIA</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#a7b1aa]"><ShieldCheck className="h-4 w-4 text-[#c8f36a]" /> Role-based access</div>
        </header>

        <div className="auth-rail relative p-5 sm:p-10 lg:p-14">
          <div className="auth-grid pointer-events-none absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#9eaaa2] transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#c8f36a]">Select your player profile</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl">One platform.<br />Your workspace.</h1>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#9eaaa2]">
                {mode === "login" ? "Choose the workspace linked to your account. Each role opens a focused set of tools, progress signals, and next actions." : "Start with the role that matches how you will use Nexvia. Your onboarding path adapts from the first step."}
              </p>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {(Object.keys(PORTALS) as PortalKey[]).map((key) => {
                const portal = PORTALS[key];
                const meta = portalMeta[key];
                const Icon = meta.icon;
                return (
                  <Link key={key} href={`/${mode}/${key}`} className="auth-rail-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f2018] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#13271e] sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[#07110d]" style={{ backgroundColor: meta.accent }}><Icon className="h-5 w-5" /></span>
                        <div>
                          <p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#69776f]">PROFILE {meta.code}</p>
                          <h2 className="mt-2 text-xl font-semibold tracking-[-.02em] text-white">{portal.label}</h2>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-[#5f6d65] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                    <p className="mt-5 max-w-md text-sm leading-6 text-[#9eaaa2]">{portal.description}</p>
                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#748179]">Unlocks</span>
                      <span className="text-xs font-semibold" style={{ color: meta.accent }}>{meta.unlocks}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#f4f1e8] p-5 text-[#151914] sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#151914] text-[#c8f36a]"><Play className="h-4 w-4 fill-current" /></span>
                <div><p className="font-semibold">Exploring Nexvia for the first time?</p><p className="mt-1 text-sm text-[#686c65]">Preview the complete student journey in under three minutes.</p></div>
              </div>
              <Link href="/demo" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#151914] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5">Open guided demo <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
