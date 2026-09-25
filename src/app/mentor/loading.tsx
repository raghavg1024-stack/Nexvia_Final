export default function MentorLoading() {
  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="animate-pulse mb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-8 rounded bg-accent-soft" />
          <div className="mt-2 h-6 w-28 rounded bg-slate-800" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-800" />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden rounded-2xl border border-line bg-card p-4 sm:p-6">
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="h-4 w-64 rounded bg-slate-800" />
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-36 rounded-full bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="h-14 flex-1 rounded-2xl bg-slate-800" />
        <div className="h-12 w-20 shrink-0 rounded-2xl bg-slate-800" />
      </div>
    </main>
  );
}
