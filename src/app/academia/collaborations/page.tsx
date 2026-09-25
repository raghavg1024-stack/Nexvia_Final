import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/app/_components/motion";
import { CollaborationsClient } from "./collaborations-client";
import { getCollaborations } from "./actions";

export const dynamic = "force-dynamic";

export default async function CollaborationsPage() {
  const collaborations = await getCollaborations();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/academia" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Academia Workspace
      </Link>

      <Reveal>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Industry Collaborations</h1>
        <p className="mt-2 text-sm text-slate-400">Manage FDPs, workshops, guest lectures, research projects, and other partnerships with industry.</p>
      </Reveal>

      <Suspense fallback={<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-48"/></div>}>
        <CollaborationsClient initialCollaborations={collaborations} />
      </Suspense>
    </main>
  );
}