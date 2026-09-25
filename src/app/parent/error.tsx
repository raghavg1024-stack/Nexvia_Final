"use client";

export default function ParentError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-line bg-card p-6 text-center">
        <h1 className="font-display text-2xl uppercase tracking-tight text-foreground">
          Parent Portal unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your data is safe. The portal could not load this request, so no progress details were shown.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
