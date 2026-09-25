"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateCourseStatus,
  type ActionState,
} from "@/lib/roadmap";
import type { Course, MilestoneStatus } from "@/lib/types";

const initialState: ActionState = { ok: true };

export function CourseToggle({
  course,
  courseAvailable,
  lockedMessage,
}: {
  course: Course;
  courseAvailable: boolean;
  lockedMessage: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, setPending] = useState(false);
  const updatedNow = state.ok && state.updatedCourseId === course.id;
  const effectiveStatus = updatedNow && state.updatedCourseStatus
    ? state.updatedCourseStatus
    : course.status;

  async function handleProgress() {
    if (pending) return;

    setPending(true);
    setState(initialState);
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set(
      "status",
      effectiveStatus === "pending" ? "in_progress" : "completed"
    );

    try {
      const result = await updateCourseStatus(initialState, formData);
      setState(result);
      if (result.ok) router.refresh();
    } catch {
      setState({
        ok: false,
        message: "The request failed before it could be saved. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  if (effectiveStatus === "completed") {
    return (
      <span
        role="status"
        className="text-sm font-semibold text-emerald-300"
      >
        Completed ✓
      </span>
    );
  }

  if (!courseAvailable) {
    return (
      <span className="max-w-32 text-right text-xs font-medium leading-4 text-slate-500">
        {lockedMessage}
      </span>
    );
  }

  return (
    <div aria-live="polite">
      <button
        type="button"
        onClick={handleProgress}
        disabled={pending}
        aria-disabled={pending}
        className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20 disabled:opacity-50"
      >
        {pending
          ? "Saving…"
          : effectiveStatus === "pending"
            ? "Start"
            : "Mark complete"}
      </button>
      {state.ok === false && state.message ? (
        <p role="alert" className="mt-1 max-w-48 text-xs text-rose-300">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function MilestoneAction({
  status,
  canComplete,
}: {
  status: MilestoneStatus;
  canComplete: boolean;
}) {
  if (status === "completed") return null;
  const message = status === "locked"
    ? "Complete the previous milestone to unlock this step."
    : canComplete
      ? "Finishing this step and unlocking the next milestone…"
      : "Complete every activity above. The next milestone unlocks automatically.";
  return <p className="text-sm text-slate-400">{message}</p>;
}
