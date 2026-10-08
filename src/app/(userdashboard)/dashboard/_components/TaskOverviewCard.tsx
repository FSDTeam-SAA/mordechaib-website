import { ArrowRight } from "lucide-react";

const legend = [
  ["#10B981", "12 Completed"],
  ["#264AFF", "10 In Progress"],
  ["#F59E0B", "6 Pending"],
  ["#EF4444", "4 Overdue"],
] as const;

export function TaskOverviewCard() {
  return (
    <article className="rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Task Overview</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]">
          View All <ArrowRight className="size-4" />
        </button>
      </header>
      <div className="mt-4 flex flex-col items-center justify-center gap-7 sm:flex-row sm:justify-between">
        <div className="relative flex size-[170px] shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#EF4444_0deg_45deg,#264AFF_45deg_157.5deg,#10B981_157.5deg_292.5deg,#F59E0B_292.5deg_360deg)]">
          <div className="flex size-[110px] flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-xl font-medium text-[#0E1224]">32</strong>
            <span className="text-xs text-[#0E1224]">Total tasks</span>
          </div>
        </div>
        <div className="w-full max-w-[126px] space-y-4 text-sm text-[#0E1224]">
          {legend.map(([color, label]) => (
            <p key={label} className="flex items-center gap-2 whitespace-nowrap">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
