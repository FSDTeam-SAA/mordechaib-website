import { Skeleton } from "@/components/ui/skeleton";

export function CrmRecordsTableSkeleton() {
  return (
    <div
      className="mx-3 overflow-hidden border-x border-[#E0E9F7] sm:mx-4"
      role="status"
      aria-label="Loading CRM records"
    >
      <span className="sr-only">Loading CRM records...</span>
      <div className="min-w-[1050px]">
        <div className="grid h-9 grid-cols-7 items-center gap-5 border-y border-[#E0E9F7] bg-[#F7FAFF] px-4">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-3.5 w-20 bg-[#E8EFFA]" />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, row) => (
          <div
            key={row}
            className="grid h-[48px] grid-cols-7 items-center gap-5 border-b border-[#E0E9F7] px-4"
          >
            {Array.from({ length: 7 }, (_, column) => (
              <Skeleton
                key={column}
                className={`h-3.5 bg-[#EDF3FB] ${column === 0 ? "w-28" : "w-20"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
