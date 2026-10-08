import { Skeleton } from "@/components/ui/skeleton";

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, cardIndex) => (
        <section key={cardIndex} className="rounded-xl bg-white p-6">
          <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-1 rounded-full bg-[#F5F7FF]" />
              <Skeleton className="h-6 w-28 bg-[#F5F7FF]" />
              <Skeleton className="h-7 w-7 bg-[#F5F7FF]" />
            </div>
            <Skeleton className="hidden h-4 w-32 bg-[#F5F7FF] sm:block" />
          </header>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 2 }, (_, rowIndex) => (
              <div key={rowIndex} className="flex gap-4">
                <Skeleton className="mt-1 size-5 shrink-0 rounded-full bg-[#F5F7FF]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 bg-[#F5F7FF]" />
                  <Skeleton className="h-3 w-1/2 bg-[#F5F7FF]" />
                  <Skeleton className="h-4 w-40 bg-[#F5F7FF]" />
                </div>
                <Skeleton className="h-7 w-20 bg-[#F5F7FF]" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
