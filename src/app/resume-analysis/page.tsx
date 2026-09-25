"use client";

import { useActionState } from "react";
import { AlertTriangle, FileSearch, ShieldCheck, Sparkles, Target, Upload } from "lucide-react";
import {
  analyzeResume,
  resumeAnalysisInitialState,
} from "@/lib/resume-analysis";

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No major items detected.</p>
      )}
    </section>
  );
}

export default function ResumeAnalysisPage() {
  const [state, formAction, pending] = useActionState(
    analyzeResume,
    resumeAnalysisInitialState,
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
          <Sparkles className="h-3.5 w-3.5" /> Gemini resume intelligence
        </div>
        <h1 className="mt-5 font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
          Turn your resume into a stronger application
        </h1>
        <p className="mt-3 leading-7 text-slate-400">
          Upload a PDF to identify evidence, missing skills, role alignment, and practical improvements. It is sent to Gemini for this analysis and is not permanently stored by Nexvia.
        </p>
      </header>

      <form action={formAction} aria-busy={pending} className="mt-8 grid gap-5 rounded-3xl border border-violet-400/20 bg-card p-6 shadow-2xl shadow-black/20 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Resume PDF</span>
            <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-violet-400/40 bg-background px-4 py-3 text-sm text-slate-400">
              <Upload className="h-4 w-4 text-violet-300" />
              <input name="resume" type="file" accept="application/pdf,.pdf" required className="min-w-0 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500 file:px-3 file:py-2 file:font-semibold file:text-white" />
            </span>
            <span className="mt-2 block text-xs text-slate-500">Text-based PDF, maximum 3 MB</span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Target role</span>
            <input name="targetRole" maxLength={100} placeholder="e.g. Frontend Developer" className="mt-2 h-12 w-full rounded-xl border border-line bg-background px-4 text-sm text-foreground outline-none transition focus:border-violet-400" />
          </label>
        </div>
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
          <FileSearch className="h-4 w-4" /> {pending ? "Analysing…" : "Analyse resume"}
        </button>
      </form>

      {pending && (
        <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Reading the PDF and checking its evidence. This can take up to 45 seconds.
        </p>
      )}

      {state.error && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{state.error}</p>
      )}

      {state.ok && state.result && (
        <div className="mt-8 space-y-5" aria-live="polite">
          <section className="overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-violet-500/15 via-card to-cyan-400/10 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-violet-400/25 bg-background">
                <div className="text-center"><strong className="font-display text-3xl text-white">{state.result.atsEstimate}</strong><span className="block text-xs text-slate-500">/ 100</span></div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">ATS compatibility estimate</p>
                <h2 className="mt-2 text-xl font-bold text-white">{state.targetRole}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{state.result.summary}</p>
                <p className="mt-3 text-xs text-slate-500">This is an AI estimate, not an official employer ATS score or hiring guarantee.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-200">{state.result.confidence} confidence</span>
                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-violet-200">{state.result.documentQuality.replaceAll("_", " ")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">How the score was calculated</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["ATS format", state.result.scoreBreakdown.atsParseability, 20],
                ["Sections", state.result.scoreBreakdown.essentialSections, 20],
                ["Evidence", state.result.scoreBreakdown.evidenceAndImpact, 25],
                ["Role match", state.result.scoreBreakdown.targetRoleAlignment, 25],
                ["Clarity", state.result.scoreBreakdown.clarityAndConciseness, 10],
              ].map(([label, score, maximum]) => (
                <div key={String(label)} className="rounded-xl border border-line bg-background p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{score}<span className="text-xs font-normal text-slate-500"> / {maximum}</span></p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <ResultList title="Strong evidence" items={state.result.strengths} />
            <ResultList title="Priority improvements" items={state.result.improvements} />
            <ResultList title="Skills to strengthen" items={state.result.missingSkills} />
            <ResultList title="Portfolio projects" items={state.result.suggestedProjects} />
          </section>

          <section className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-violet-300" /><h2 className="text-sm font-bold text-white">Role alignment</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{state.result.roleAlignment}</p>
            <div className="mt-4 flex flex-wrap gap-2">{state.result.detectedSkills.map((skill) => <span key={skill} className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">{skill}</span>)}</div>
          </section>

          {state.result.warnings.length > 0 && (
            <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><h2 className="text-sm font-bold text-amber-100">Important checks</h2></div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                {state.result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
              </ul>
            </section>
          )}
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-xs leading-5 text-slate-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> Remove highly sensitive information before uploading. Nexvia does not use gender, caste, religion, disability, ethnicity, or photographs to judge career suitability.
      </div>
    </div>
  );
}
