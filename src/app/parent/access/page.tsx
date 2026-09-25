import Link from "next/link";
import { redirect } from "next/navigation";
import { ParentAccessForms } from "./parent-access-forms";
import { loadParentAccess } from "@/lib/parent";
import { ParentCallSettings } from "./parent-call-settings";

function formatDate(value: string | null) {
  if (!value) return "No recent roadmap activity";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function ParentAccessPage() {
  const access = await loadParentAccess();
  if (!access) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Secure family support
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
          Parent Portal
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Parents see verified progress only after the learner shares a one-time code.
          Private mentor conversations and assessment answers are never shown here.
        </p>
      </header>

      <div className="mt-6">
        <ParentAccessForms />
      </div>

      <section className="mt-6 rounded-2xl border border-dashed border-accent/40 bg-accent-soft/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Demo experience
            </p>
            <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
              Preview a sample student report card
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Explore a realistic example with attendance, readiness, roadmap progress, mock-interview results, and parent guidance. Sample data is never mixed with a real learner&apos;s record.
            </p>
          </div>
          <Link
            href="/parent/dashboard?demo=1"
            className="inline-flex shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Open sample report →
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Linked learners
            </p>
            <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
              Your family dashboard
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            {access.linkedGuardianCount} guardian{access.linkedGuardianCount === 1 ? "" : "s"}{" "}
            connected to your learner account
          </p>
        </div>

        {access.wards.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {access.wards.map((ward) => (
              <article key={ward.linkId} className="rounded-2xl border border-line bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
                      {ward.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {ward.careerTitle ?? "Career path not selected yet"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                    Active
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Last activity: {formatDate(ward.lastActiveAt)}
                </p>
                <Link
                  href={`/parent/dashboard?student=${encodeURIComponent(ward.studentId)}`}
                  className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  View real performance
                </Link>
                <ParentCallSettings
                  linkId={ward.linkId}
                  studentName={ward.name.split(" ")[0] || "your learner"}
                  studentConsent={ward.studentCallConsent}
                  phone={ward.parentPhone}
                  enabled={ward.overdueCallEnabled}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-line bg-background p-6 text-sm text-slate-400">
            No learner is linked to this parent account yet. Use the one-time code above.
          </div>
        )}

        {access.activeInviteExpiresAt && (
          <p className="mt-5 text-xs text-slate-500">
            A learner invite is active until {formatDate(access.activeInviteExpiresAt)}.
            Creating another code safely replaces it.
          </p>
        )}
      </section>
    </main>
  );
}
