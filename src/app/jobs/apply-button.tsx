"use client";

import { useFormStatus } from "react-dom";

export function ApplyButton({ hasApplied }: { hasApplied: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={hasApplied || pending}
      aria-live="polite"
      className="min-w-24 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {hasApplied ? "Applied" : pending ? "Applying…" : "Apply Now"}
    </button>
  );
}
