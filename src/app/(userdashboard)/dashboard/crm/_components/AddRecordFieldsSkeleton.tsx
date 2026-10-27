import { Skeleton } from "@/components/ui/skeleton";

export function AddRecordFieldsSkeleton() {
  return (
    <div className="mt-4 space-y-3" role="status" aria-label="Loading CRM fields">
      <span className="sr-only">Loading CRM fields...</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-1.5">
          <Skeleton className="h-3.5 w-24 bg-[#EDF3FB]" />
          <Skeleton className="h-11 w-full rounded-[8px] bg-[#F1F5FC]" />
        </div>
      ))}
    </div>
  );
}
