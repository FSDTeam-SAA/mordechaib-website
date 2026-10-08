"use client";

import { cn } from "@/lib/utils";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemCount: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  isLoading?: boolean;
  className?: string;
};

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    page - 1,
    page,
    page + 1,
    "end-ellipsis",
    totalPages,
  ];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemCount,
  onPageChange,
  itemLabel = "results",
  isLoading = false,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const firstItem =
    totalItems === 0 || itemCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem =
    firstItem === 0 ? 0 : Math.min(firstItem + itemCount - 1, totalItems);
  const items = getPaginationItems(safePage, safeTotalPages);

  return (
    <footer
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-[#8B93B8] sm:text-base" aria-live="polite">
        Showing {firstItem} to {lastItem} of {totalItems} {itemLabel}
      </p>

      <ShadcnPagination
        className="mx-0 max-w-full justify-start overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0"
        aria-label={`${itemLabel} pages`}
      >
        <PaginationContent className="gap-1 sm:gap-2">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (!isLoading && safePage > 1) onPageChange(safePage - 1);
              }}
              aria-disabled={isLoading || safePage === 1}
              tabIndex={isLoading || safePage === 1 ? -1 : undefined}
              className="size-9 shrink-0 rounded border border-[#8B93B8] p-0 text-[#8B93B8] shadow-none hover:border-[#5B7FF0] hover:bg-transparent hover:text-[#5B7FF0] aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:size-10 [&_span]:sr-only"
            />
          </PaginationItem>

          {items.map((item) =>
            typeof item === "number" ? (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={safePage === item}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!isLoading) onPageChange(item);
                  }}
                  aria-label={`Page ${item}`}
                  aria-disabled={isLoading}
                  tabIndex={isLoading ? -1 : undefined}
                  className={cn(
                    "size-9 shrink-0 rounded border text-sm shadow-none sm:size-10",
                    safePage === item
                      ? "border-[#5B7FF0] bg-[#5B7FF0] text-white hover:bg-[#5B7FF0] hover:text-white"
                      : "border-[#8B93B8] bg-transparent text-[#8B93B8] hover:border-[#5B7FF0] hover:bg-transparent hover:text-[#5B7FF0]",
                    isLoading && "pointer-events-none opacity-40",
                  )}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationEllipsis className="size-9 rounded border border-[#8B93B8] text-[#8B93B8] sm:size-10" />
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (!isLoading && safePage < safeTotalPages) {
                  onPageChange(safePage + 1);
                }
              }}
              aria-disabled={isLoading || safePage === safeTotalPages}
              tabIndex={
                isLoading || safePage === safeTotalPages ? -1 : undefined
              }
              className="size-9 shrink-0 rounded border border-[#8B93B8] p-0 text-[#8B93B8] shadow-none hover:border-[#5B7FF0] hover:bg-transparent hover:text-[#5B7FF0] aria-disabled:pointer-events-none aria-disabled:opacity-40 sm:size-10 [&_span]:sr-only"
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </footer>
  );
}
