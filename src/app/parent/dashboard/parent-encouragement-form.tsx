"use client";

import { useActionState } from "react";
import { sendParentEncouragement, type ParentActionState } from "@/lib/parent";

const initialState: ParentActionState = { ok: false };

export function ParentEncouragementForm({
  linkId,
  studentId,
  studentName,
}: {
  linkId: string;
  studentId: string;
  studentName: string;
}) {
  const [state, action, pending] = useActionState(
    sendParentEncouragement,
    initialState,
  );

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="linkId" value={linkId} />
      <input type="hidden" name="studentId" value={studentId} />
      <label htmlFor="encouragement" className="block text-sm font-medium text-foreground">
        Write a note to {studentName}
      </label>
      <textarea
        id="encouragement"
        name="message"
        rows={4}
        required
        minLength={2}
        maxLength={300}
        placeholder="I’m proud of the progress you’re making. Keep going one step at a time."
        className="w-full resize-none rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send encouragement"}
      </button>
      {state.message && (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-emerald-500" : "text-red-500"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
