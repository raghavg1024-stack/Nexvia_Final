export function WorkspaceLoading({ label = "Loading workspace" }: { label?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6" aria-label={label} aria-live="polite">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded-full bg-cyan-400/20" />
        <div className="mt-4 h-9 w-72 max-w-full rounded-xl bg-slate-800" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-800/80" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 rounded-2xl border border-line bg-card p-5"><div className="h-10 w-10 rounded-xl bg-slate-800" /><div className="mt-5 h-5 w-2/3 rounded bg-slate-800" /><div className="mt-3 h-3 w-full rounded bg-slate-800/80" /><div className="mt-2 h-3 w-4/5 rounded bg-slate-800/80" /></div>)}</div>
      </div>
      <span className="sr-only">{label}…</span>
    </main>
  );
}
