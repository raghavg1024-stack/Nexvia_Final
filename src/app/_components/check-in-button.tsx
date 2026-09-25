"use client";

import { useActionState } from "react";
import { dailyCheckIn, type CheckInState } from "@/lib/rewards";

const initialState: CheckInState = {
  ok: false,
  message: "",
  already: false,
  xpGranted: 0,
  streak: 0,
  badges: [],
};

export function CheckInButton({
  checkedInToday,
}: {
  checkedInToday: boolean;
}) {
  const [state, formAction, pending] = useActionState(dailyCheckIn, initialState);

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending || checkedInToday}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Checking in..."
            : checkedInToday
              ? "Checked in today"
              : `Daily Check-in (+${state.xpGranted || 10} XP)`}
        </button>
      </form>
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${
            state.ok
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {state.message}
        </p>
      )}
      {state.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {state.badges.map((badge) => (
            <span
              key={badge.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent"
            >
              <span aria-hidden="true">{badge.icon}</span>
              New badge: {badge.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}