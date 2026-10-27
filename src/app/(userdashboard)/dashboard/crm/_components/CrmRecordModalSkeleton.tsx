import { Skeleton } from "@/components/ui/skeleton";

export function CrmRecordModalSkeleton() {
  return (
    <div className="space-y-6 p-5 sm:p-6" role="status" aria-label="Loading CRM record">
      <span className="sr-only">Loading CRM record...</span>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-[#E4EAF8] p-4">
            <Skeleton className="h-3 w-20 bg-[#EDF3FB]" />
            <Skeleton className="h-4 w-36 bg-[#E8EFFA]" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24 bg-[#EDF3FB]" />
            <Skeleton className="h-11 w-full rounded-lg bg-[#E8EFFA]" />
          </div>
        ))}
      </div>
    </div>
  );
}
