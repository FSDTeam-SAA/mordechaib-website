import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ className = "h-[320px]" }: { className?: string }) {
  return <article className={`rounded-2xl bg-white p-5 ${className}`}><Skeleton className="h-7 w-44" /><Skeleton className="mt-3.5 h-px w-full" /><div className="mt-[1.125rem] space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-full" /></div></article>;
}

export function CallDetailsSkeleton() {
  return <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5" role="status" aria-label="Loading call details"><span className="sr-only">Loading call details...</span><div className="mb-5 flex justify-between"><Skeleton className="h-10 w-48" /><div className="flex gap-3"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-44" /></div></div><div className="space-y-4"><section className="grid gap-4 xl:grid-cols-2"><CardSkeleton className="h-[520px]" /><CardSkeleton className="h-[520px]" /></section><section className="grid gap-4 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></section><section className="grid gap-4 xl:grid-cols-2"><CardSkeleton /><CardSkeleton /></section><section className="grid gap-4 xl:grid-cols-2"><CardSkeleton className="h-[368px]" /><CardSkeleton className="h-[368px]" /></section></div></main>;
}
