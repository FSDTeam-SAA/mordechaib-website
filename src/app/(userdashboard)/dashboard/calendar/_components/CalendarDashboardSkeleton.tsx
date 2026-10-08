import { Skeleton } from "@/components/ui/skeleton";

export function CalendarDashboardSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading calendar dashboard" role="status">
      <span className="sr-only">Loading calendar dashboard...</span>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <article key={index} className="h-[132px] rounded-[8px] bg-white p-4">
            <Skeleton className="size-10" />
            <Skeleton className="mt-3 h-7 w-14" />
            <Skeleton className="mt-2 h-4 w-28" />
          </article>
        ))}
      </section>
      <section className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 min-h-[680px] rounded-[8px] bg-white p-4 xl:col-span-9">
          <div className="flex justify-between border-b border-[#E4EAF8] pb-4">
            <Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-56" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[234px_1fr]">
            <Skeleton className="h-[580px]" />
            <div className="space-y-3">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          </div>
        </div>
        <div className="col-span-12 space-y-4 xl:col-span-3">
          <Skeleton className="h-32 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="h-48 w-full" />
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72 w-full bg-white" />)}</section>
      <Skeleton className="h-64 w-full bg-white" />
    </div>
  );
}
