"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { sendGroupMessage, type ChatState } from "@/lib/community";

const initialState: ChatState = { ok: false, error: null, message: null };

export function GroupChat({ groupId }: { groupId: string }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, pending] = useActionState(
    sendGroupMessage.bind(null, groupId),
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input
        name="content"
        required
        maxLength={1000}
        placeholder="Write a message..."
        className="flex-1 rounded-xl border border-line bg-card px-4 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-xl bg-accent px-6 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send"}
      </button>
      {state.error && (
        <p
          aria-live="polite"
          className="mt-2 w-full text-sm text-amber-600"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}