"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { submitRoadmapTest, type RoadmapTestResult } from "@/lib/roadmap";
import type { PublicRoadmapTestQuestion } from "@/lib/roadmap-test";

const TEST_SECONDS = 20 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function RoadmapExam({ courseId, courseTitle, courseStatus, questions, paperToken, sourceSummary }: {
  courseId: string;
  courseTitle: string;
  courseStatus: "pending" | "in_progress" | "completed";
  questions: PublicRoadmapTestQuestion[];
  paperToken: string;
  sourceSummary: string;
}) {
  const [started, setStarted] = useState(false);
  const [endedForViolation, setEndedForViolation] = useState(false);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<RoadmapTestResult | null>(null);
  const finished = endedForViolation || result !== null;

  const endForViolation = useCallback(() => {
    setEndedForViolation(true);
    setStarted(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, []);

  const submit = useCallback(async () => {
    if (pending || finished) return;
    setPending(true);
    try {
      const response = await submitRoadmapTest(courseId, paperToken, answers);
      setResult(response);
      setStarted(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    } finally {
      setPending(false);
    }
  }, [answers, courseId, finished, paperToken, pending]);

  useEffect(() => {
    if (!started || finished) return;
    const blockClipboard = (event: ClipboardEvent) => event.preventDefault();
    const blockContext = (event: MouseEvent) => event.preventDefault();
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") endForViolation();
    };
    const handleBlur = () => endForViolation();
    const handleKeydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "v", "x", "a", "l", "t", "n", "w", "p", "s"].includes(key)) {
        event.preventDefault();
        endForViolation();
      }
    };
    const warnBeforeLeave = (event: BeforeUnloadEvent) => event.preventDefault();

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", warnBeforeLeave);
    };
  }, [endForViolation, finished, started]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [finished, started]);

  useEffect(() => {
    if (!started || secondsLeft !== 0 || finished) return;
    const timeout = window.setTimeout(() => void submit(), 0);
    return () => window.clearTimeout(timeout);
  }, [finished, secondsLeft, started, submit]);

  async function beginTest() {
    setEndedForViolation(false);
    setResult(null);
    setAnswers(Array(questions.length).fill(-1));
    setSecondsLeft(TEST_SECONDS);
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
    setStarted(true);
  }

  if (courseStatus === "completed" && !started) {
    return <ExamMessage icon={<CheckCircle2 className="h-12 w-12 text-emerald-300" />} title="Test already passed" message={`${courseTitle} is complete. Return to the roadmap to continue.`} />;
  }

  if (courseStatus !== "in_progress") {
    return <ExamMessage icon={<LockKeyhole className="h-12 w-12 text-amber-300" />} title="Test is locked" message="Start the roadmap task before entering its test." />;
  }

  if (!started) {
    return (
      <main className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950 p-5 text-white">
        <section className="w-full max-w-2xl rounded-3xl border border-blue-400/25 bg-slate-900 p-6 shadow-2xl sm:p-9">
          {endedForViolation ? (
            <div className="mb-7 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
              <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" /> Attempt ended</div>
              <p className="mt-2 text-sm leading-6">The exam lost focus or a restricted browser shortcut was used. No result was saved.</p>
            </div>
          ) : null}
          {result ? (
            <div className={`mb-7 rounded-2xl border p-4 ${result.passed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}>
              <p className="font-bold">{result.passed ? "Test passed" : "Test not passed"} · {result.score}/{result.total}</p>
              <p className="mt-2 text-sm leading-6">{result.message}</p>
            </div>
          ) : null}

          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-blue-500/15 p-3 text-blue-300"><ShieldCheck className="h-7 w-7" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">Secure content test</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{courseTitle}</h1></div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Paper source</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{sourceSummary}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["10 content questions", "20 minutes", "80% to pass"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center text-sm font-semibold">{item}</div>)}
          </div>

          <h2 className="mt-8 font-bold">Exam rules</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            <li>Stay in this test window until you submit.</li>
            <li>Changing tabs, changing windows, or using restricted browser shortcuts ends the attempt.</li>
            <li>Copy, paste, printing, saving, and the context menu are disabled.</li>
            <li>Do not use AI assistants, search tools, another device, or outside help.</li>
          </ul>
          <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">A website cannot detect another physical device. This mode enforces all browser activity it can detect and saves completion only after a verified passing submission.</p>

          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <a href="/roadmap" className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300">Return to roadmap</a>
            {result?.passed ? null : <button type="button" onClick={beginTest} className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">{endedForViolation || result ? "Start new attempt" : "Enter fullscreen and begin"}</button>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950 text-white select-none">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Secure exam in progress</p><h1 className="mt-1 font-semibold">{courseTitle}</h1></div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-2 font-mono text-lg font-bold text-blue-100"><Clock3 className="h-5 w-5" /> {formatTime(secondsLeft)}</div>
        </div>
      </header>

      <form className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        {questions.map((question, questionIndex) => (
          <fieldset key={question.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
            <legend className="px-1 text-base font-bold leading-7"><span className="mr-2 text-blue-300">{questionIndex + 1}.</span>{question.prompt}</legend>
            <div className="mt-4 grid gap-2.5">
              {question.options.map((option, optionIndex) => (
                <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 transition-colors ${answers[questionIndex] === optionIndex ? "border-blue-400 bg-blue-500/15 text-white" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-blue-400/30"}`}>
                  <input type="radio" name={question.id} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))} className="mt-1 accent-blue-500" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-sm text-slate-300">{answers.filter((answer) => answer >= 0).length} of {questions.length} answered</p>
          <button type="submit" disabled={pending || answers.some((answer) => answer < 0)} className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40">{pending ? "Submitting…" : "Submit test"}</button>
        </div>
      </form>
    </main>
  );
}

function ExamMessage({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <main className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950 p-5 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
        <div className="flex justify-center">{icon}</div>
        <h1 className="mt-5 text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-slate-300">{message}</p>
        <a href="/roadmap" className="mt-7 inline-flex rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white">Return to roadmap</a>
      </section>
    </main>
  );
}
