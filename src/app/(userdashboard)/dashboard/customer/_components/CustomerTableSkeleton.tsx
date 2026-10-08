import { Skeleton } from "@/components/ui/skeleton";

export function CustomerTableSkeleton() {
  return <section className="overflow-hidden rounded-lg bg-white" role="status" aria-label="Loading customers"><span className="sr-only">Loading customers...</span><div className="min-w-[1040px]">
    <div className="grid h-[52px] grid-cols-[22%_17%_20%_15%_9%_9%_8%] items-center border-b border-[#E4EAF8] px-5">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-4 w-16 bg-[#F5F7FF]" />)}</div>
    {Array.from({ length: 7 }, (_, row) => <div key={row} className="grid h-[76px] grid-cols-[22%_17%_20%_15%_9%_9%_8%] items-center border-b border-[#E4EAF8]/50 px-5 last:border-0">
      <div className="flex items-center gap-3"><Skeleton className="size-10 shrink-0 rounded-full bg-[#F5F7FF]" /><div className="space-y-2"><Skeleton className="h-4 w-28 bg-[#F5F7FF]" /><Skeleton className="h-3 w-36 bg-[#F5F7FF]" /></div></div>
      <Skeleton className="h-4 w-28 bg-[#F5F7FF]" /><div className="space-y-2"><Skeleton className="h-4 w-28 bg-[#F5F7FF]" /><Skeleton className="h-3 w-24 bg-[#F5F7FF]" /></div><div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full bg-[#F5F7FF]" /><Skeleton className="h-6 w-14 rounded-full bg-[#F5F7FF]" /></div><Skeleton className="h-6 w-16 rounded-full bg-[#F5F7FF]" /><Skeleton className="h-4 w-16 bg-[#F5F7FF]" /><div className="flex gap-2"><Skeleton className="size-8 rounded-lg bg-[#F5F7FF]" /><Skeleton className="size-8 rounded-lg bg-[#F5F7FF]" /><Skeleton className="size-8 rounded-lg bg-[#F5F7FF]" /></div>
    </div>)}
  </div></section>;
}
