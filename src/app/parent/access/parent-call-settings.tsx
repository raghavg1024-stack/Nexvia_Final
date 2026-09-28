"use client";

import { useActionState } from "react";
import {
  saveParentCallPreferences,
  sendParentTestCall,
  type ParentActionState,
} from "@/lib/parent";

const initialState: ParentActionState = { ok: false };

export function ParentCallSettings({
  linkId,
  studentName,
  studentConsent,
  phone,
  enabled,
}: {
  linkId: string;
  studentName: string;
  studentConsent: boolean;
  phone: string | null;
  enabled: boolean;
}) {
  const [state, action, pending] = useActionState(saveParentCallPreferences, initialState);
  const [callState, callAction, callPending] = useActionState(sendParentTestCall, initialState);

  return (
    <div className="mt-5 rounded-xl border border-line bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-[.15em] text-cyan-300">AI progress call</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        One supportive call is placed when {studentName}&apos;s active task becomes overdue. Calls require permission from both of you.
      </p>
      <form action={action}>
        <input type="hidden" name="linkId" value={linkId} />
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={phone ?? ""}
          placeholder="+919876543210"
          aria-label="Phone number for progress calls"
          className="mt-3 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-cyan-300"
        />
        <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300">
          <input name="enabled" type="checkbox" defaultChecked={enabled} disabled={!studentConsent} className="mt-1 accent-cyan-400" />
          I consent to receiving automated progress calls at this number.
        </label>
        {!studentConsent ? <p className="mt-3 text-xs text-amber-300">You can save the phone number now. Calling stays locked until the learner generates a new code with call permission enabled and you redeem it.</p> : null}
        <button disabled={pending} className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
          {pending ? "Saving..." : studentConsent ? "Save call settings" : "Save phone number"}
        </button>
        {state.message ? <p role="status" className={`mt-3 text-xs ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p> : null}
      </form>

      <form action={callAction} className="mt-4 border-t border-line pt-4">
        <input type="hidden" name="linkId" value={linkId} />
        <p className="text-xs leading-5 text-slate-400">
          Save the number first, then place one real test call using the current overdue task. Carrier charges may apply.
        </p>
        <button
          disabled={callPending || !studentConsent || !enabled || !phone}
          className="mt-3 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {callPending ? "Calling..." : "Call saved number now"}
        </button>
        {callState.message ? <p role="status" className={`mt-3 text-xs ${callState.ok ? "text-emerald-300" : "text-rose-300"}`}>{callState.message}</p> : null}
      </form>
    </div>
  );
}
