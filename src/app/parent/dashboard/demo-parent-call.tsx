"use client";

import { useEffect, useState } from "react";
import { CircleStop, PhoneCall, Volume2 } from "lucide-react";

type DemoParentCallProps = {
  studentName: string;
  taskTitle: string;
  daysOverdue: number;
};

export function DemoParentCall({ studentName, taskTitle, daysOverdue }: DemoParentCallProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const message = `Hello. This is a supportive progress update from Nexvia. ${studentName}'s roadmap task, ${taskTitle}, is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue. Please check in calmly and help plan one small next step. This is not an emergency or a disciplinary alert.`;

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function playCall() {
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-IN";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopCall() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-blue-400/25 bg-card">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-500">
            <PhoneCall className="h-4 w-4" aria-hidden="true" /> Parent call demonstration
          </p>
          <h3 className="mt-2 text-lg font-bold text-foreground">Hear the overdue-task call</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            This browser-only preview demonstrates the calm message a consenting parent would receive. It does not dial a phone number or save any data.
          </p>
        </div>
        <button
          type="button"
          onClick={speaking ? stopCall : playCall}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {speaking ? <CircleStop className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          {speaking ? "Stop demo call" : "Play demo call"}
        </button>
      </div>
      <div className="border-t border-line bg-background/70 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Call transcript</p>
        <p className="mt-2 text-sm leading-6 text-foreground">{message}</p>
        {!supported ? <p className="mt-2 text-xs text-amber-500">Audio playback is unavailable in this browser. The transcript above shows the complete demo message.</p> : null}
      </div>
    </div>
  );
}
