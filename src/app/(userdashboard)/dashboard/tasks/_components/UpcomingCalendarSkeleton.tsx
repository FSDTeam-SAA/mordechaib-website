import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingCalendarSkeleton() {
  return <section className="rounded-xl bg-white p-6" aria-label="Loading upcoming meetings" role="status">
    <span className="sr-only">Loading upcoming meetings...</span>
    <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4"><Skeleton className="h-6 w-48" /><Skeleton className="h-5 w-20" /></header>
    <div className="mt-4 space-y-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex gap-2"><Skeleton className="h-12 w-1.5 rounded-full" /><Skeleton className="size-12 shrink-0 rounded-lg" /><div className="min-w-0 flex-1 pt-1"><Skeleton className="h-4 w-4/5" /><Skeleton className="mt-2 h-3.5 w-1/2" /></div></div>)}</div>
  </section>;
}
