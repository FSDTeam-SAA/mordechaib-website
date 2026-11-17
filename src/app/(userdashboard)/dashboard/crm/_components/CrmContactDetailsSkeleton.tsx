export function CrmContactDetailsSkeleton() {
  return (
    <main className="min-h-[calc(100vh-83px)] animate-pulse space-y-4 p-4 text-[#0E1224]">
      {/* Header Profile Skeleton */}
      <section className="flex flex-col gap-6 rounded-xl bg-white p-4 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="size-[96px] shrink-0 rounded-full bg-slate-200 sm:size-[120px]" />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-7 w-48 rounded bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="h-4 w-60 rounded bg-slate-100" />
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              <div className="h-4 w-36 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 w-28 rounded bg-slate-100" />
              <div className="h-4 w-28 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <div className="h-[52px] w-24 rounded-[10px] bg-slate-200" />
          <div className="h-[52px] w-24 rounded-[10px] bg-slate-200" />
          <div className="h-[52px] w-28 rounded-[10px] bg-slate-200" />
          <div className="h-[52px] w-28 rounded-[10px] bg-slate-200" />
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.46fr)_minmax(360px,1fr)]">
        {/* Left Column: Metrics & Timeline */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <article
                key={index}
                className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-3 text-center"
              >
                <div className="h-3.5 w-24 rounded bg-slate-100" />
                <div className="h-6 w-16 rounded bg-slate-200" />
              </article>
            ))}
          </section>

          <section className="min-h-[520px] rounded-2xl bg-white p-4">
            <div className="h-6 w-36 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-[57px] items-center gap-3 rounded-lg bg-[#F5F7FF] p-2.5"
                >
                  <div className="size-6 shrink-0 rounded bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-4 w-52 rounded bg-slate-200" />
                    <div className="h-3 w-36 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-12 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Ai Insight, Open Task, Files */}
        <aside className="flex min-w-0 flex-col gap-4">
          {/* Ai Insight */}
          <section className="rounded-2xl bg-white p-4">
            <div className="h-6 w-28 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-10 items-center justify-between rounded-[10px] bg-[#F5F7FF] px-3 py-2"
                >
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-5 w-28 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </section>

          {/* Open Task */}
          <section className="rounded-2xl bg-white p-4">
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-10 items-center justify-between rounded-[10px] bg-[#F5F7FF] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border border-slate-300 bg-slate-200" />
                    <div className="h-4 w-36 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-20 rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>
          </section>

          {/* Files */}
          <section className="rounded-2xl bg-white p-4">
            <div className="h-6 w-16 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-10 items-center gap-2.5 rounded-[10px] bg-[#F5F7FF] px-3 py-2"
                >
                  <div className="size-4 rounded bg-slate-200" />
                  <div className="h-4 w-40 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Notes Section Skeleton */}
      <section className="rounded-2xl bg-white p-4">
        <div className="h-6 w-20 rounded bg-slate-200" />
        <div className="mt-4 rounded-lg bg-[#F4F5FE] p-4 space-y-3">
          <div className="h-4 w-full rounded bg-slate-200/60" />
          <div className="h-4 w-4/5 rounded bg-slate-200/60" />
          <div className="mt-3 flex items-center gap-3">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200/60" />
          </div>
        </div>
      </section>
    </main>
  );
}
