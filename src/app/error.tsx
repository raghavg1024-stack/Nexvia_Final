"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[65vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">Temporary problem</p>
      <h1 className="mt-3 font-display text-3xl uppercase tracking-tight text-foreground">Nexvia is still here</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        We couldn&apos;t finish that request. Your saved progress is safe; check your connection and try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Try again
      </button>
    </main>
  );
}
