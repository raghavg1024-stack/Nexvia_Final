import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Reveal } from "@/app/_components/motion";
import { FeedbackClient } from "./feedback-client";
import { getFeedbackData } from "./actions";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const { applications, membership } = await getFeedbackData();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/recruiter" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Industry Dashboard
      </Link>

      <Reveal>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
          <Star className="h-6 w-6 fill-current" />
        </div>
        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight text-slate-100">Internship Feedback</h1>
        <p className="mt-2 text-sm text-slate-400">Provide structured feedback to help students grow and build their verified portfolio.</p>
      </Reveal>

      <Suspense fallback={<div className="mt-8 space-y-4"><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-32"/><div className="rounded-2xl border border-line bg-card p-6 animate-pulse h-32"/></div>}>
        <FeedbackClient initialApplications={applications} hasMembership={!!membership} />
      </Suspense>
    </main>
  );
}