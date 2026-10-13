import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardSectionHeader({
  children,
  action = "View All",
  href,
}: {
  children: ReactNode;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E4EAF8] pb-3 sm:pb-4">
      <h2 className="min-w-0 flex-1 text-base font-medium leading-6 text-[#0E1224] sm:text-xl sm:leading-7">
        {children}
      </h2>
      {href ? (
        <Link
          href={href}
          className="-mr-2 flex min-h-11 max-w-[55%] shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-[#5B7FF0]"
        >
          <span className="truncate">{action}</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      ) : (
        <button className="-mr-2 flex min-h-11 max-w-[55%] shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-[#5B7FF0]">
          <span className="truncate">{action}</span>
          <ArrowRight className="size-4 shrink-0" />
        </button>
      )}
    </div>
  );
}
