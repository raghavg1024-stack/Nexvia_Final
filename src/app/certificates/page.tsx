import Link from "next/link";
import { redirect } from "next/navigation";
import { getCertificates } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificates",
};

export default async function CertificatesPage() {
  let authed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = !!user;
  } catch {}
  if (!authed) redirect("/login");

  const certificates = await getCertificates();

  return (
    <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header>
        <Reveal>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">Certificates</h1>
          <p className="mt-2 text-sm text-slate-400">
            Credentials you earn by completing your learning roadmap.
          </p>
        </Reveal>
      </header>

      {certificates.length === 0 ? (
        <Reveal>
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card px-6 py-16 text-center">
            <div
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/50 bg-accent-soft shadow-lg"
            >
              <span className="font-display text-lg tracking-widest text-accent">
                NX
              </span>
            </div>
            <h2 className="mt-6 font-display text-lg uppercase tracking-tight text-foreground">
              No certificates yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Complete your roadmap and you will earn a Nexvia certificate with
              a verifiable credential ID you can show off.
            </p>
            <Link
              href="/roadmap"
              className="mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110"
            >
              Go to my roadmap
            </Link>
          </div>
        </Reveal>
      ) : (
        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <StaggerItem key={certificate.id}>
              <article
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 pt-8 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent via-violet-500 to-accent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-5 flex h-14 w-14 rotate-12 items-center justify-center rounded-full border-4 border-double border-accent/60 bg-gradient-to-br from-accent/10 to-violet-500/10 text-center text-[10px] font-bold uppercase leading-tight tracking-widest text-accent transition-transform group-hover:rotate-0"
                >
                  NX
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  Certificate of Completion
                </p>
                <h2 className="mt-3 pr-16 font-display text-xl uppercase tracking-tight text-foreground">
                  {certificate.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Credential ID:{" "}
                  <span className="font-mono text-slate-300">
                    {certificate.credential_id}
                  </span>
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  Issued {new Date(certificate.issued_at).toLocaleDateString()}
                </p>
                <div className="mt-auto border-t border-line pt-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Nexvia
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </main>
  );
}
