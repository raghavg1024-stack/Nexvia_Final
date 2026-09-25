"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ASSESSMENT_QUESTIONS } from "@/lib/data";
import type { AssessmentResponse } from "@/lib/types";
import { completeAssessment, getAssessment, saveProgress } from "@/lib/assessment";

export default function AssessmentPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = useCallback(async () => {
    try {
      const data = await getAssessment();
      if (data.assessment?.status === "completed") {
        router.replace("/recommendations");
        return;
      }
      if (data.assessment?.responses?.length) {
        setResponses(data.assessment.responses);
        const resumeIndex =
          data.assessment.current_question_index ?? data.assessment.responses.length;
        setIndex(Math.min(resumeIndex, ASSESSMENT_QUESTIONS.length - 1));
      }
      setLoading(false);
    } catch {
      setError("We couldn't load your assessment. Please try again.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    getAssessment()
      .then((data) => {
        if (!active) return;
        if (data.assessment?.status === "completed") {
          router.replace("/recommendations");
          return;
        }
        if (data.assessment?.responses?.length) {
          setResponses(data.assessment.responses);
          const resumeIndex =
            data.assessment.current_question_index ?? data.assessment.responses.length;
          setIndex(Math.min(resumeIndex, ASSESSMENT_QUESTIONS.length - 1));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your assessment. Please try again.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const total = ASSESSMENT_QUESTIONS.length;
  const question = ASSESSMENT_QUESTIONS[index];
  const currentAnswer = responses.find((r) => r.question_id === question?.id)?.answer;
  const isLast = index === total - 1;
  const hasAnswer =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    !(Array.isArray(currentAnswer) && currentAnswer.length === 0);

  const setAnswer = (answer: number | string | string[]) => {
    setResponses((prev) => [
      ...prev.filter((r) => r.question_id !== question.id),
      { question_id: question.id, category: question.category, answer },
    ]);
  };

  const toggleOption = (option: string) => {
    const selected = Array.isArray(currentAnswer) ? (currentAnswer as string[]) : [];
    setAnswer(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  };

  const handleNext = async () => {
    const nextIndex = index + 1;
    const result = await saveProgress(responses, nextIndex);
    if (result.error) {
      setError("We couldn't save your progress. Check your connection and try again.");
      return;
    }
    setError(null);
    setIndex(nextIndex);
  };

  const handleBack = async () => {
    const prevIndex = index - 1;
    const result = await saveProgress(responses, prevIndex);
    if (result.error) {
      setError("We couldn't save your progress. Check your connection and try again.");
      return;
    }
    setError(null);
    setIndex(prevIndex);
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await completeAssessment(responses);
      router.push("/recommendations");
    } catch {
      setError("We couldn't finish your assessment. Please try again.");
      setSubmitting(false);
    }
  };

  const progress = Math.round(((index + 1) / total) * 100);
  const selectedValues = Array.isArray(currentAnswer) ? (currentAnswer as string[]) : [];
  const ratingValues = Array.from(
    { length: (question?.max ?? 5) - (question?.min ?? 1) + 1 },
    (_, i) => (question?.min ?? 1) + i
  );

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-slate-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-accent" />
        <p className="mt-4 text-sm text-slate-400">Loading your assessment...</p>
      </main>
    );
  }

  if (error && !question) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-slate-300">
        <h1 className="font-display text-xl uppercase tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAssessment();
          }}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 py-10 text-slate-300">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        {/* Header with step dots */}
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg uppercase tracking-tight text-foreground">
                Career Discovery Assessment
              </h1>
              <p className="text-sm text-slate-400">
                Question {index + 1} of {total}
              </p>
            </div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
              {progress}%
            </span>
          </div>

          {/* Step dots */}
          <div className="mt-4 flex gap-1">
            {ASSESSMENT_QUESTIONS.map((q, i) => {
              const answered = responses.some((r) => r.question_id === q.id);
              const isCurrent = i === index;
              return (
                <div
                  key={q.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-accent"
                      : answered
                        ? "bg-accent/50"
                        : "bg-slate-800"
                  }`}
                />
              );
            })}
          </div>
        </header>

        {/* Question card */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-line bg-card p-6 sm:p-8"
            >
              <span className="inline-block rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
                {question.category.replace("_", " ")}
              </span>
              <h2 className="mt-4 font-display text-xl uppercase tracking-tight text-foreground sm:text-2xl">
                {question.text}
              </h2>

              <div className="mt-8">
                {question.type === "rating" && (
                  <div className="flex flex-wrap gap-3">
                    {ratingValues.map((value) => (
                      <button
                        key={value}
                        onClick={() => setAnswer(value)}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold transition-all ${
                          currentAnswer === value
                            ? "bg-accent text-white shadow-lg shadow-accent/30 scale-110"
                            : "border border-line bg-card text-slate-300 hover:border-accent hover:text-foreground hover:scale-105"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "choice" && (
                  <div className="flex flex-col gap-3">
                    {question.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswer(option)}
                        className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${
                          currentAnswer === option
                            ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                            : "border-line bg-card text-slate-300 hover:border-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              currentAnswer === option
                                ? "border-white bg-white/20"
                                : "border-slate-600"
                            }`}
                          >
                            {currentAnswer === option && (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </span>
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "multiselect" && (
                  <div className="flex flex-wrap gap-2.5">
                    {question.options?.map((option) => {
                      const isSelected = selectedValues.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleOption(option)}
                          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                            isSelected
                              ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                              : "border-line bg-card text-slate-300 hover:border-accent/50 hover:text-foreground"
                          }`}
                        >
                          {isSelected && <span className="mr-1.5">✓</span>}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={index === 0}
            className="rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-foreground disabled:opacity-40"
          >
            Back
          </button>

          {isLast ? (
            <button
              onClick={handleComplete}
              disabled={!hasAnswer || submitting}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110 disabled:opacity-40"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Finishing...
                </span>
              ) : (
                "Complete Assessment"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110 disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
