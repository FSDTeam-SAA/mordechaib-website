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
    <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
      <h2 className="text-xl font-medium text-[#0E1224]">{children}</h2>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]"
        >
          {action}
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <button className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]">
          {action}
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  );
}
