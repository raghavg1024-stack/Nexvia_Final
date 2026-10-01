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
      <section className="relative mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-slate-400 transition hover:text-white">← Back to Nexvia</Link>
        <div className="mt-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">One ecosystem · Four secure workspaces</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose your portal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {mode === "login" ? "Sign in through the workspace created for your role." : "Create the account that matches how you will use Nexvia."}
          </p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-violet-400/25 bg-violet-400/[.08] p-5 sm:flex-row">
          <div><p className="font-semibold text-foreground">Explore before you sign in</p><p className="mt-1 text-sm text-slate-400">Follow the sample student journey without an account.</p></div>
          <Link href="/demo" className="premium-button-secondary shrink-0">Explore student demo</Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {(Object.keys(PORTALS) as PortalKey[]).map((key) => {
            const portal = PORTALS[key];
            const Icon = icons[key];
            return (
              <Link
                key={key}
                href={`/${mode}/${key}`}
                className="premium-card group relative overflow-hidden p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="premium-icon shrink-0">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{portal.eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">{portal.label} workspace</h2>
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
