"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { CircleStop, PhoneCall, Volume2 } from "lucide-react";
import { sendParentTestCall, type ParentActionState } from "@/lib/parent";

const initialState: ParentActionState = { ok: false };

type DemoParentCallProps = {
  studentName: string;
  taskTitle: string;
  daysOverdue: number;
  linkId?: string | null;
};

export function DemoParentCall({ studentName, taskTitle, daysOverdue, linkId }: DemoParentCallProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [callState, callAction, callPending] = useActionState(sendParentTestCall, initialState);
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
            Preview the opening update here. A linked parent can save a consented phone number and use Call saved number now for a real two-way conversation with Nexvia&apos;s AI assistant.
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
      <div className="border-t border-line px-5 py-4">
        {linkId ? (
          <form action={callAction}>
            <input type="hidden" name="linkId" value={linkId} />
            <p className="text-xs leading-5 text-slate-500">
              This places a real two-way AI call to the number saved in Parent Portal settings. Carrier and AI voice charges may apply.
            </p>
            <button
              disabled={callPending}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-500 transition hover:bg-cyan-400/20 disabled:opacity-50"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              {callPending ? "Calling..." : "Call saved number now"}
            </button>
            {callState.message ? <p role="status" className={`mt-3 text-xs ${callState.ok ? "text-emerald-500" : "text-rose-500"}`}>{callState.message}</p> : null}
          </form>
        ) : (
          <p className="text-xs leading-5 text-slate-500">
            To place a real call, <Link href="/parent/access" className="font-semibold text-accent hover:underline">link a learner and save a consented phone number</Link> first.
          </p>
        )}
      </div>
    </div>
  );
}
