"use client";

import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  startInterview,
  submitAnswer,
  getActiveInterview,
  type StartState,
  type SubmitAnswerState,
  type InterviewCategory,
  type InterviewQuestion,
  type InterviewAnswer,
} from "@/lib/mock-interview";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Reveal } from "../_components/motion";

export const dynamic = "force-dynamic";

const CATEGORIES: {
  key: InterviewCategory;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}[] = [
  {
    key: "behavioral",
    title: "Behavioral",
    description:
      "Tell me about a time you... — answers that show how you handle real situations.",
    icon: "🧠",
    gradient: "from-accent to-blue-500",
  },
  {
    key: "technical",
    title: "Technical",
    description:
      "Explain concepts, debug problems, and walk through your technical thinking.",
    icon: "⚙️",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    key: "situational",
    title: "Situational",
    description:
      "What would you do if... — hypothetical scenarios that test judgment and priorities.",
    icon: "🎯",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    key: "career_specific",
    title: "Career-Specific",
    description:
      "Tailored questions for your chosen career path, based on your roadmap.",
    icon: "🚀",
    gradient: "from-emerald-500 to-teal-400",
  },
];

const TIME_PER_QUESTION = 120; // seconds

const startInitialState: StartState = { ok: true };
const submitInitialState: SubmitAnswerState = { ok: true };

function TimerInner({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / seconds) * 100;
  const urgent = remaining <= 30;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="var(--line)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke={urgent ? "#ef4444" : "var(--accent)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 17}
            strokeDashoffset={2 * Math.PI * 17 * (1 - pct / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${
            urgent ? "text-red-500" : "text-slate-400"
          }`}
        >
          {minutes}:{secs.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-emerald-500/10 text-emerald-500";
  let label = "Excellent";
  if (score < 50) {
    color = "bg-red-500/10 text-red-500";
    label = "Needs work";
  } else if (score < 70) {
    color = "bg-amber-500/10 text-amber-500";
    label = "Good effort";
  } else if (score < 85) {
    color = "bg-blue-500/10 text-blue-500";
    label = "Strong";
  }
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-2xl text-foreground">{score}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
        {label}
      </span>
    </div>
  );
}

function CategorySelector({
  onSelect,
}: {
  onSelect: (category: InterviewCategory) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Reveal>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
          AI Mock Interview
        </h1>
        <p className="mt-2 text-slate-400">
          Practice answering real interview questions and get instant feedback
          on your responses.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
            How it works
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose category",
                desc: "Pick the type of interview you want to practice.",
              },
              {
                step: "02",
                title: "Answer questions",
                desc: "5 questions, 2 minutes each. Answer out loud or type your response.",
              },
              {
                step: "03",
                title: "Get scored",
                desc: "Receive instant feedback, strengths, and improvement tips.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-line bg-slate-800 p-4">
                <span className="font-display text-sm text-accent">{item.step}</span>
                <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelect(cat.key)}
              className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-slate-200"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-accent-soft opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-lg text-white shadow-lg`}
              >
                {cat.icon}
              </div>
              <h3 className="mt-4 font-display text-lg uppercase tracking-tight text-foreground">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{cat.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Start interview →
              </span>
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function InterviewSession({
  sessionId,
  category,
  careerTitle,
  questionCount,
  firstQuestion,
  initialIndex = 0,
  onComplete,
}: {
  sessionId: string;
  category: InterviewCategory;
  careerTitle: string | null;
  questionCount: number;
  firstQuestion: InterviewQuestion;
  initialIndex?: number;
  onComplete: (result: {
    overallScore: number;
    summary: string;
    xpEarned: number;
    answers: InterviewAnswer[];
  }) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answer, setAnswer] = useState(() => {
    if (typeof window === "undefined") return "";
    return (
      window.localStorage.getItem(
        `nexvia-interview-draft:${sessionId}:${firstQuestion.id}`,
      ) ?? ""
    );
  });
  const [submitted, setSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<SubmitAnswerState | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitState, submitAction, submitPending] = useActionState(
    submitAnswer,
    submitInitialState
  );
  const handledRef = useRef(false);
  const {
    isSupported: voiceInputSupported,
    isListening,
    error: voiceError,
    permissionState,
    startListening,
    stopListening,
  } = useSpeechRecognition({ value: answer, onChange: setAnswer });
  const draftKey = `nexvia-interview-draft:${sessionId}:${currentQuestion.id}`;

  useEffect(() => {
    if (submitted || !answer) {
      window.localStorage.removeItem(draftKey);
      return;
    }
    window.localStorage.setItem(draftKey, answer);
  }, [answer, draftKey, submitted]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (!voiceEnabled || submitted) return;
    const timer = window.setTimeout(
      () => speakText(`Question ${currentIndex + 1}. ${currentQuestion.text}`),
      250,
    );
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [currentIndex, currentQuestion.text, speakText, submitted, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || !submitted || !lastResult) return;
    const feedback = `Your score is ${lastResult.score ?? 0} out of 100. ${lastResult.feedback ?? ""}`;
    const timer = window.setTimeout(() => speakText(feedback), 250);
    return () => window.clearTimeout(timer);
  }, [lastResult, speakText, submitted, voiceEnabled]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (submitState.ok && submitState.score !== undefined && !handledRef.current) {
      handledRef.current = true;
      setLastResult(submitState);
      setSubmitted(true);
    }
  }, [submitState]);

  const handleNext = useCallback(() => {
    window.localStorage.removeItem(draftKey);
    stopListening();
    stopSpeaking();
    if (submitState.isComplete && submitState.overallScore !== undefined) {
      onComplete({
        overallScore: submitState.overallScore,
        summary: submitState.summary ?? "",
        xpEarned: submitState.xpEarned ?? 0,
        answers: [],
      });
      return;
    }
    if (submitState.nextQuestion && submitState.nextIndex !== undefined) {
      const nextDraftKey = `nexvia-interview-draft:${sessionId}:${submitState.nextQuestion.id}`;
      setCurrentQuestion(submitState.nextQuestion);
      setCurrentIndex(submitState.nextIndex);
      setAnswer(window.localStorage.getItem(nextDraftKey) ?? "");
      setSubmitted(false);
      setLastResult(null);
      handledRef.current = false;
    }
  }, [draftKey, sessionId, submitState, onComplete, stopListening, stopSpeaking]);

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    stopSpeaking();
    await startListening();
  };

  const handleTimeUp = useCallback(() => {
    if (!submitted && !submitPending) {
      // Auto-submit with current answer
      const form = document.getElementById("answer-form") as HTMLFormElement | null;
      if (form) form.requestSubmit();
    }
  }, [submitted, submitPending]);

  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.title ?? category;
  const progress = Math.round(((currentIndex + (submitted ? 1 : 0)) / questionCount) * 100);

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mt-1 font-display text-2xl uppercase tracking-tight text-foreground">
              {categoryLabel} Interview
            </h1>
            {careerTitle && (
              <p className="mt-1 text-sm text-slate-400">
                Tailored for {careerTitle}
              </p>
            )}
          </div>
          <TimerInner
            key={`timer-${currentIndex}`}
            seconds={TIME_PER_QUESTION}
            onExpire={handleTimeUp}
          />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question {currentIndex + 1} of {questionCount}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2">
          <span className="text-sm font-semibold text-accent">Voice interview</span>
          <span className="text-xs text-slate-400">
            Questions and feedback are read aloud. Answer by microphone or type at any time.
          </span>
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled((enabled) => !enabled);
            }}
            className="ml-auto rounded-lg border border-accent/30 px-3 py-1 text-xs font-semibold text-accent"
          >
            {voiceEnabled ? "Voice on" : "Voice off"}
          </button>
        </div>
      </header>

      {/* Question or Results */}
      <AnimatePresence mode="wait">
        {submitted && lastResult ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-2xl border border-line bg-card p-6">
              <div className="flex items-start justify-between">
                <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
                  Your answer
                </h2>
                <ScoreBadge score={lastResult.score ?? 0} />
              </div>

              <p className="mt-3 text-sm text-slate-300">{lastResult.feedback}</p>

              {lastResult.strengths && lastResult.strengths.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                    Strengths
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {lastResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lastResult.improvements && lastResult.improvements.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    Areas to improve
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {lastResult.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110"
              >
                {submitState.isComplete
                  ? "See final results"
                  : "Next question →"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
              <span className="inline-block rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
                {currentQuestion.category.replace(/_/g, " ")}
              </span>
              <h2 className="mt-4 font-display text-xl uppercase tracking-tight text-foreground sm:text-2xl">
                {currentQuestion.text}
              </h2>
              <button
                type="button"
                onClick={() => (isSpeaking ? stopSpeaking() : speakText(currentQuestion.text))}
                className="mt-3 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-accent hover:text-accent"
              >
                {isSpeaking ? "Stop audio" : "Replay question"}
              </button>

              {/* Tips */}
              {currentQuestion.tips.length > 0 && (
                <div className="mt-4 rounded-xl border border-line bg-slate-800 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tips
                  </p>
                  <ul className="mt-2 space-y-1">
                    {currentQuestion.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-400"
                      >
                        <span className="mt-1 text-accent">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Answer input */}
              <form
                id="answer-form"
                action={submitAction}
                onSubmit={stopListening}
                className="mt-6"
              >
                <input type="hidden" name="sessionId" value={sessionId} />
                <input
                  type="hidden"
                  name="currentIndex"
                  value={currentIndex}
                />
                <input
                  type="hidden"
                  name="questionId"
                  value={currentQuestion.id}
                />
                <textarea
                  name="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="Tap Start answering and speak, or type your answer here."
                  className="w-full resize-none rounded-2xl border border-line bg-slate-800 px-4 py-3 text-sm text-foreground placeholder-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />

                <div className="mt-3 rounded-xl border border-line bg-slate-800/70 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={!voiceInputSupported || submitPending}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        isListening
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : "bg-accent text-white hover:brightness-110"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {isListening
                        ? "Stop answering"
                        : voiceError || permissionState === "denied"
                          ? "Use mic again"
                          : "Start answering"}
                    </button>
                    <p className="text-xs text-slate-400" role="status">
                      {isListening
                        ? "Listening now… your words will appear above."
                        : voiceInputSupported
                          ? "Your transcript stays editable before submission."
                          : "Voice input needs Chrome, Edge, or Safari."}
                    </p>
                  </div>
                  {voiceError && (
                    <div className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2" role="alert">
                      <p className="text-xs font-semibold text-red-300">
                        Voice input is unavailable. Type your answer above to continue the interview.
                      </p>
                      <p className="mt-1 text-xs text-red-200">{voiceError}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {answer.split(/\s+/).filter(Boolean).length} words · {answer.length}/5000 characters
                  </p>
                  <button
                    type="submit"
                    disabled={submitPending || answer.trim().length === 0}
                    className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Scoring...
                      </span>
                    ) : (
                      "Submit answer"
                    )}
                  </button>
                </div>
              </form>

              {submitState.error && (
                <p className="mt-3 text-sm text-red-500">{submitState.error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-4 text-center text-xs text-slate-500">
        Scores combine consistent rule-based criteria with Gemini coaching when available. They support practice and are not a hiring decision.
      </p>
    </main>
  );
}

function ResultsScreen({
  overallScore,
  summary,
  xpEarned,
  onRestart,
}: {
  overallScore: number;
  summary: string;
  xpEarned: number;
  onRestart: () => void;
}) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (overallScore / 100) * c;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto flex h-40 w-40 items-center justify-center"
          >
            <svg className="absolute -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke="var(--line)"
                strokeWidth="10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="relative text-center">
              <p className="font-display text-4xl text-foreground">
                {overallScore}
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                / 100
              </p>
            </div>
          </motion.div>

          <h2 className="mt-8 font-display text-2xl uppercase tracking-tight text-foreground">
            Interview Complete
          </h2>

          <p className="prose prose-invert prose-sm mx-auto mt-4 max-w-lg text-slate-400">
            {summary}
          </p>

          {xpEarned > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-500">
              <span>⭐</span> +{xpEarned} XP earned
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110"
            >
              Try another category
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:text-foreground"
            >
              Retake same category
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function MockInterviewPage() {
  const [view, setView] = useState<"select" | "interview" | "results">("select");
  const [sessionData, setSessionData] = useState<{
    id: string;
    category: InterviewCategory;
    careerTitle: string | null;
    questionCount: number;
    firstQuestion: InterviewQuestion;
    currentIndex?: number;
  } | null>(null);
  const [resultData, setResultData] = useState<{
    overallScore: number;
    summary: string;
    xpEarned: number;
  } | null>(null);
  const [checkingResume, setCheckingResume] = useState(true);

  const [startState, startAction, startPending] = useActionState(
    startInterview,
    startInitialState
  );

  useEffect(() => {
    let active = true;
    getActiveInterview()
      .then((session) => {
        if (!active || !session) return;
        setSessionData({
          id: session.id,
          category: session.category,
          careerTitle: session.careerTitle,
          questionCount: session.questionCount,
          firstQuestion: session.firstQuestion,
          currentIndex: session.currentIndex,
        });
        setView("interview");
      })
      .finally(() => {
        if (active) setCheckingResume(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // When startInterview succeeds, transition to the interview view
  const handledStartRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      startState.ok &&
      startState.session &&
      !startPending &&
      handledStartRef.current !== startState.session.id
    ) {
      handledStartRef.current = startState.session.id;
      setSessionData({
        id: startState.session.id,
        category: startState.session.category,
        careerTitle: startState.session.careerTitle,
        questionCount: startState.session.questionCount,
        firstQuestion: startState.session.firstQuestion,
      });
      setView("interview");
    }
  }, [startState, startPending]);

  const handleCategorySelect = (category: InterviewCategory) => {
    const formData = new FormData();
    formData.set("category", category);
    startAction(formData);
  };

  const handleComplete = (result: {
    overallScore: number;
    summary: string;
    xpEarned: number;
  }) => {
    setResultData(result);
    setView("results");
  };

  const handleRestart = () => {
    setView("select");
    setSessionData(null);
    setResultData(null);
  };

  if (view === "results" && resultData) {
    return (
      <ResultsScreen
        overallScore={resultData.overallScore}
        summary={resultData.summary}
        xpEarned={resultData.xpEarned}
        onRestart={handleRestart}
      />
    );
  }

  if (view === "interview" && sessionData) {
    return (
      <InterviewSession
        sessionId={sessionData.id}
        category={sessionData.category}
        careerTitle={sessionData.careerTitle}
        questionCount={sessionData.questionCount}
        firstQuestion={sessionData.firstQuestion}
        initialIndex={sessionData.currentIndex}
        onComplete={handleComplete}
      />
    );
  }

  if (checkingResume) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center">
        <p className="text-sm text-slate-400">Checking for a saved interview...</p>
      </main>
    );
  }

  return (
    <>
      <CategorySelector onSelect={handleCategorySelect} />
      {startPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-accent" />
            <p className="text-sm text-slate-400">Preparing your interview...</p>
          </div>
        </div>
      )}
      {startState.error && (
        <p className="mx-auto max-w-3xl px-4 text-center text-sm text-red-500">
          {startState.error}
        </p>
      )}
    </>
  );
}
