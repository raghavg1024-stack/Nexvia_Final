import Link from "next/link";
import { Building2, GraduationCap, HeartHandshake, School, type LucideIcon } from "lucide-react";
import { PORTALS, type PortalKey } from "@/lib/portal-auth";

const icons: Record<PortalKey, LucideIcon> = {
  student: GraduationCap,
  industry: Building2,
  academia: School,
  parent: HeartHandshake,
};

export function PortalSelector({ mode }: { mode: "login" | "signup" }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-14 sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
      <section className="relative mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-slate-400 transition hover:text-white">← Back to Nexvia</Link>
        <div className="mt-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">One ecosystem · Four secure workspaces</p>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-tight text-white sm:text-6xl">
            Choose your portal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {mode === "login" ? "Sign in through the workspace created for your role." : "Create the account that matches how you will use Nexvia."}
          </p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-violet-400/25 bg-violet-400/[.08] p-5 sm:flex-row">
          <div><p className="font-bold text-white">Judging or evaluating Nexvia?</p><p className="mt-1 text-sm text-slate-400">Open the complete read-only student journey without an account.</p></div>
          <Link href="/demo" className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Continue as demo student</Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {(Object.keys(PORTALS) as PortalKey[]).map((key) => {
            const portal = PORTALS[key];
            const Icon = icons[key];
            return (
              <Link
                key={key}
                href={`/${mode}/${key}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-6 transition hover:-translate-y-1 hover:border-white/25"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${portal.accent}`} />
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${portal.accent} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{portal.eyebrow}</p>
                    <h2 className="mt-2 font-display text-2xl text-white">{portal.label} Portal</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{portal.description}</p>
                    <span className="mt-5 inline-flex text-sm font-bold text-cyan-300 group-hover:text-white">
                      {mode === "login" ? "Open secure login" : "Create account"} →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
