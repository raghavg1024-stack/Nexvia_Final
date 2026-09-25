"use client";

import { useActionState } from "react";
import { saveParentCallPreferences, type ParentActionState } from "@/lib/parent";

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

  return (
    <form action={action} className="mt-5 rounded-xl border border-line bg-card p-4">
      <input type="hidden" name="linkId" value={linkId} />
      <p className="text-xs font-bold uppercase tracking-[.15em] text-cyan-300">AI progress call</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        One supportive call is placed when {studentName}&apos;s active task becomes overdue. Calls require permission from both of you.
      </p>
      <input
        name="phone"
        type="tel"
        defaultValue={phone ?? ""}
        disabled={!studentConsent}
        placeholder="+919876543210"
        className="mt-3 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-white outline-none focus:border-cyan-300 disabled:opacity-50"
      />
      <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300">
        <input name="enabled" type="checkbox" defaultChecked={enabled} disabled={!studentConsent} className="mt-1 accent-cyan-400" />
        I consent to receiving automated progress calls at this number.
      </label>
      {!studentConsent ? <p className="mt-3 text-xs text-amber-300">Learner consent is required. Ask the learner to generate a new code with call permission enabled.</p> : null}
      <button disabled={pending || !studentConsent} className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        {pending ? "Saving..." : "Save call settings"}
      </button>
      {state.message ? <p role="status" className={`mt-3 text-xs ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}
