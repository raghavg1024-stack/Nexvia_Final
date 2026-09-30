"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, X } from "lucide-react";
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

  if (effectiveStatus === "in_progress") {
    return (
      <span className="max-w-36 text-right text-xs font-semibold leading-4 text-cyan-200">
        Complete the test below
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
          : "Start"}
      </button>
      {state.ok === false && state.message ? (
        <p role="alert" className="mt-1 max-w-48 text-xs text-rose-300">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

type TestQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

function buildQuestions(course: Course): TestQuestion[] {
  return [
    {
      prompt: `What is the main learning goal of “${course.title}”?`,
      options: [
        course.description,
        "Skip the practical work and move directly to the next milestone.",
        "Finish quickly without checking whether the skill can be applied.",
      ],
      answer: 0,
    },
    {
      prompt: "Which result gives the strongest evidence that you understood this task?",
      options: [
        "Only marking the task as finished.",
        "A practical example or result that applies what you learned.",
        "Reading the title one more time.",
      ],
      answer: 1,
    },
    {
      prompt: "What should you do if you cannot explain or apply the skill yet?",
      options: [
        "Guess until the test passes.",
        "Skip the test and unlock the next task.",
        "Review the task material, practise again, and retry the test.",
      ],
      answer: 2,
    },
  ];
}

export function CourseTest({
  course,
  courseAvailable,
}: {
  course: Course;
  courseAvailable: boolean;
}) {
  const router = useRouter();
  const questions = buildQuestions(course);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<"idle" | "failed">("idle");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const passed = course.status === "completed";
  const unlocked = courseAvailable && course.status === "in_progress";

  function closeTest() {
    if (pending) return;
    setOpen(false);
    setResult("idle");
    setError("");
  }

  async function submitTest() {
    if (pending) return;
    setError("");

    if (Object.keys(answers).length !== questions.length) {
      setError("Answer every question before submitting the test.");
      return;
    }

    const score = questions.reduce(
      (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
      0,
    );
    if (score < questions.length) {
      setResult("failed");
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("status", "completed");

    try {
      const response = await updateCourseStatus(initialState, formData);
      if (!response.ok) {
        setError(response.message ?? "The result could not be saved. Please try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("The result could not be saved. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="ml-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 sm:ml-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 rounded-lg border border-blue-300/25 bg-blue-400/10 p-2 text-blue-200">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Knowledge test</p>
            <p className="mt-1 font-medium text-slate-100">Test: {course.title}</p>
            <p className="mt-1 text-sm text-slate-400">Pass all 3 questions to complete the task and unlock the next one.</p>
          </div>
        </div>

        {passed ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Passed
          </span>
        ) : unlocked ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Take test
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-500">
            {course.status === "pending" ? "Start the task first" : "Locked"}
          </span>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`test-title-${course.id}`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-blue-300/25 bg-[#0d1426] p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">3-question knowledge test</p>
                <h3 id={`test-title-${course.id}`} className="mt-2 text-xl font-bold text-white">{course.title}</h3>
              </div>
              <button type="button" onClick={closeTest} aria-label="Close test" className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {questions.map((question, questionIndex) => (
                <fieldset key={question.prompt}>
                  <legend className="font-semibold leading-6 text-slate-100">
                    {questionIndex + 1}. {question.prompt}
                  </legend>
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-300 transition-colors hover:border-blue-300/30 hover:bg-blue-400/[0.06]">
                        <input
                          type="radio"
                          name={`question-${course.id}-${questionIndex}`}
                          checked={answers[questionIndex] === optionIndex}
                          onChange={() => {
                            setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
                            setResult("idle");
                            setError("");
                          }}
                          className="mt-1 accent-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            {result === "failed" ? (
              <p role="alert" className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-200">
                Review the task and try again. All three answers must be correct before the next task unlocks.
              </p>
            ) : null}
            {error ? <p role="alert" className="mt-5 text-sm text-rose-300">{error}</p> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
              <button type="button" onClick={closeTest} disabled={pending} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={submitTest} disabled={pending} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-50">
                {pending ? "Saving result…" : "Submit test"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </li>
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
