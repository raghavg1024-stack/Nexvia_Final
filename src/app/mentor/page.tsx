"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { clearChat, getChat, sendMessage } from "@/lib/mentor";
import type { MentorClearState, MentorSendState } from "@/lib/mentor";
import type { MentorMessage } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { MentorReply } from "../_components/mentor-reply";

export const dynamic = "force-dynamic";

const sendInitial: MentorSendState = { ok: true };
const clearInitial: MentorClearState = { ok: true };

const STARTER_QUESTIONS = [
  "Which career is the best fit for me?",
  "How should I build my resume?",
  "How do I prepare for interviews?",
  "What project should I build first?",
  "What should I do next?",
  "I feel stuck and unmotivated. Help me.",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendState, sendAction, sendPending] = useActionState(sendMessage, sendInitial);
  const [clearState, clearAction, clearPending] = useActionState(clearChat, clearInitial);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const handledIds = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const voiceReplyPendingRef = useRef(false);
  const {
    isSupported: voiceSupported,
    isListening,
    error: voiceError,
    permissionState,
    startListening,
    stopListening,
  } = useSpeechRecognition({ value: input, onChange: setInput });

  const speakText = useCallback((content: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = navigator.language || "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    let active = true;
    getChat()
      .then((chat) => {
        if (active) setMessages(chat);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const additions: MentorMessage[] = [];
    if (sendState.userMessage) additions.push(sendState.userMessage);
    if (sendState.assistantMessage) additions.push(sendState.assistantMessage);
    const fresh = additions.filter((m) => !handledIds.current.has(m.id));
    if (fresh.length === 0) return;
    for (const m of fresh) handledIds.current.add(m.id);
    setMessages((prev) => [...prev, ...fresh]);
    if (fresh.some((m) => m.role === "user")) setInput("");
    const assistantReply = fresh.find((message) => message.role === "assistant");
    if (assistantReply && voiceReplyPendingRef.current) {
      voiceReplyPendingRef.current = false;
      const timer = window.setTimeout(() => speakText(assistantReply.content), 150);
      return () => window.clearTimeout(timer);
    }
  }, [sendState, speakText]);

  useEffect(() => {
    if (clearState.ok && !clearPending) {
      getChat()
        .then((chat) => setMessages(chat))
        .catch(() => {});
    }
  }, [clearState, clearPending]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const sendQuestion = (question: string) => {
    if (sendPending) return;
    setInput(question);
    const formData = new FormData();
    formData.set("content", question);
    sendAction(formData);
  };

  const handleClear = () => {
    if (clearPending || messages.length === 0) return;
    if (window.confirm("Clear the entire chat history?")) {
      clearAction(new FormData());
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    const started = await startListening();
    if (started) voiceReplyPendingRef.current = true;
  };

  const toggleSpeaking = (content: string) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    speakText(content);
  };

  const empty = messages.length === 0;

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mt-1 font-display text-2xl uppercase tracking-tight text-foreground">AI Mentor</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ask about careers, resumes, interviews, projects, and more.
          </p>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearPending || sendPending}
            className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearPending ? "Clearing..." : "Clear chat"}
          </button>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-line bg-card p-4 sm:p-6">
        {empty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"
          >
            <p className="max-w-md text-slate-400">
              Your mentor is here to keep you moving. Pick a starter question or
              type your own.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {STARTER_QUESTIONS.map((question, i) => (
                <motion.button
                  key={question}
                  type="button"
                  onClick={() => sendQuestion(question)}
                  disabled={sendPending}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
                  className="rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm text-accent transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                    message.role === "assistant"
                      ? "rounded-tl-sm border border-line bg-slate-800"
                      : "rounded-tr-sm whitespace-pre-line bg-accent text-white"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div>
                      <MentorReply content={message.content} />
                      <button
                        type="button"
                        onClick={() => toggleSpeaking(message.content)}
                        className="mt-3 text-xs font-medium text-accent transition-colors hover:text-white"
                        aria-label={isSpeaking ? "Stop spoken response" : "Replay response aloud"}
                      >
                        {isSpeaking ? "Stop audio" : "Replay response"}
                      </button>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {(sendState.error || clearState.error) && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {sendState.error ?? clearState.error}
        </p>
      )}
      <form action={sendAction} className="mt-4 flex items-end gap-2">
        <textarea
          name="content"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !sendPending) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder="Ask your mentor anything..."
          className="flex-1 resize-none rounded-2xl border border-line bg-card px-4 py-3 text-sm text-foreground placeholder-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={toggleListening}
          disabled={!voiceSupported}
          className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            isListening
              ? "border-red-400 bg-red-400/10 text-red-300"
              : "border-line bg-card text-slate-300 hover:border-accent hover:text-accent"
          } disabled:cursor-not-allowed disabled:opacity-50`}
          aria-label={isListening ? "Stop listening" : "Speak your question"}
          title={isListening ? "Stop listening" : "Speak your question"}
        >
          {isListening
            ? "Stop mic"
            : voiceError || permissionState === "denied"
              ? "Use mic again"
              : "Use mic"}
        </button>
        <button
          type="submit"
          disabled={sendPending || input.trim().length === 0}
          className="shrink-0 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendPending ? "Sending..." : "Send"}
        </button>
      </form>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {sendState.responseMode === "guided"
            ? "Gemini is unavailable, so Nexvia used its guided career fallback."
            : "AI guidance supports decisions; it does not guarantee career outcomes."}
        </span>
        <span className="shrink-0">{input.length}/2000</span>
      </div>
      {voiceError && (
        <div className="mt-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2" role="alert">
          <p className="text-sm font-semibold text-red-300">Voice input is unavailable, but typing still works.</p>
          <p className="mt-1 text-xs text-red-200">{voiceError}</p>
        </div>
      )}
      {isListening && (
        <p className="mt-2 text-sm text-accent" role="status">
          Listening… speak naturally and press Stop mic when finished.
        </p>
      )}
    </main>
  );
}
