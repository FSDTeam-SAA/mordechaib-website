import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TaskStatsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <article
          key={index}
          className="relative min-h-[156px] overflow-hidden rounded-lg bg-white p-4"
        >
          <Skeleton className="size-10 rounded-xl bg-[#F5F7FF]" />
          <Skeleton className="mt-3 h-7 w-14 bg-[#F5F7FF]" />
          <Skeleton className="mt-2 h-4 w-24 bg-[#F5F7FF]" />
          <Skeleton className="mt-2 h-5 w-32 bg-[#F5F7FF]" />
          <Skeleton className="absolute bottom-4 right-4 h-[65px] w-[108px] bg-[#F5F7FF]" />
        </article>
      ))}
    </section>
  );
}

export function TaskSummarySkeleton() {
  return (
    <section className="rounded-xl bg-white p-6">
      <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <Skeleton className="h-6 w-32 bg-[#F5F7FF]" />
        <Skeleton className="h-5 w-20 bg-[#F5F7FF]" />
      </header>
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="size-40 shrink-0 rounded-full bg-[#F5F7FF]" />
        <div className="min-w-0 flex-1 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full bg-[#F5F7FF]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TaskOverviewError({
  onRetry,
  className,
}: {
  onRetry: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-[156px] flex-col items-center justify-center rounded-lg bg-white p-6 text-center",
        className,
      )}
    >
      <p className="text-sm text-[#8B93B8]">Unable to load task overview.</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-3 h-9 border-[#5B7FF0] text-[#5B7FF0]"
      >
        Try Again
      </Button>
    </section>
  );
}
