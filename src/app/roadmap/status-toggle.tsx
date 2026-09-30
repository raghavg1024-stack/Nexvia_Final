"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, ExternalLink } from "lucide-react";
import { updateCourseStatus, type ActionState } from "@/lib/roadmap";
import type { Course, MilestoneStatus } from "@/lib/types";

const initialState: ActionState = { ok: true };

export function CourseToggle({ course, courseAvailable, lockedMessage }: {
  course: Course;
  courseAvailable: boolean;
  lockedMessage: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, setPending] = useState(false);
  const updatedNow = state.ok && state.updatedCourseId === course.id;
  const effectiveStatus = updatedNow && state.updatedCourseStatus ? state.updatedCourseStatus : course.status;

  async function handleProgress() {
    if (pending || effectiveStatus !== "pending") return;
    setPending(true);
    setState(initialState);
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("status", "in_progress");
    try {
      const result = await updateCourseStatus(initialState, formData);
      setState(result);
      if (result.ok) router.refresh();
    } catch {
      setState({ ok: false, message: "The request failed before it could be saved. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (effectiveStatus === "completed") {
    return <span role="status" className="text-sm font-semibold text-emerald-300">Completed ✓</span>;
  }
  if (effectiveStatus === "in_progress") {
    return <span className="max-w-36 text-right text-xs font-semibold leading-4 text-cyan-200">Complete the secure test below</span>;
  }
  if (!courseAvailable) {
    return <span className="max-w-32 text-right text-xs font-medium leading-4 text-slate-500">{lockedMessage}</span>;
  }

  return (
    <div aria-live="polite">
      <button type="button" onClick={handleProgress} disabled={pending} aria-disabled={pending} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20 disabled:opacity-50">
        {pending ? "Saving…" : "Start"}
      </button>
      {state.ok === false && state.message ? <p role="alert" className="mt-1 max-w-48 text-xs text-rose-300">{state.message}</p> : null}
    </div>
  );
}

export function CourseTest({ course, courseAvailable }: { course: Course; courseAvailable: boolean }) {
  const passed = course.status === "completed";
  const unlocked = courseAvailable && course.status === "in_progress";

  return (
    <li className="ml-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 sm:ml-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 rounded-lg border border-blue-300/25 bg-blue-400/10 p-2 text-blue-200"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Secure content test</p>
            <p className="mt-1 font-medium text-slate-100">Test: {course.title}</p>
            <p className="mt-1 text-sm text-slate-400">10 questions from this task · 20 minutes · 80% to pass</p>
          </div>
        </div>
        {passed ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Passed</span>
        ) : unlocked ? (
          <a href={`/roadmap/test/${course.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400">
            Open test <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-xs font-medium text-slate-500">{course.status === "pending" ? "Start the task first" : "Locked"}</span>
        )}
      </div>
    </li>
  );
}

export function MilestoneAction({ status, canComplete }: { status: MilestoneStatus; canComplete: boolean }) {
  if (status === "completed") return null;
  const message = status === "locked"
    ? "Complete the previous milestone to unlock this step."
    : canComplete
      ? "Finishing this step and unlocking the next milestone…"
      : "Pass every task test above. The next milestone unlocks automatically.";
  return <p className="text-sm text-slate-400">{message}</p>;
}
