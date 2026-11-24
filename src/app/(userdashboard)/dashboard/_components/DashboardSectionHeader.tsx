import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardSectionHeader({
  children,
  action = "View All",
  href,
  compact = false,
}: {
  children: ReactNode;
  action?: string;
  href?: string;
  compact?: boolean;
}) {
  const actionClassName = `-mr-2 flex max-w-[55%] shrink-0 items-center gap-1.5 px-2 font-medium text-[#5B7FF0] ${compact ? "min-h-9 text-xs" : "min-h-11 text-sm"}`;

  return (
    <div className={`flex items-center justify-between gap-3 border-b border-[#E4EAF8] ${compact ? "pb-2" : "pb-2.5 sm:pb-3.5"}`}>
      <h2 className={`min-w-0 flex-1 font-medium text-[#0E1224] ${compact ? "text-[0.9375rem] leading-5" : "text-[0.9375rem]/[1.5rem] leading-6 sm:text-[1.1875rem]/[1.75rem] sm:leading-7"}`}>
        {children}
      </h2>
      {href ? (
        <Link
          href={href}
          className={actionClassName}
        >
          <span className="truncate">{action}</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      ) : (
        <button className={actionClassName}>
          <span className="truncate">{action}</span>
          <ArrowRight className="size-4 shrink-0" />
        </button>
      )}
    </div>
  );
}
