import Image from "next/image";

export function ProjectionBanner() {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg border border-[#8B93B8]/20 bg-[#F5F7FF] py-2 pr-4">
        <span className="h-6 w-1 shrink-0 rounded-r bg-[#5B7FF0]" />
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5B9CD5]/10"><Image src="/roi-dashboard/trend.svg" alt="" width={24} height={24} unoptimized className="size-6" /></span>
        <p className="min-w-0 flex-1 text-sm text-[#0E1224] sm:text-base">Project Savings Next 30 Days: <strong>$1,450</strong> <strong className="text-[#10B981]">(+20%)</strong></p>
        <span className="hidden shrink-0 text-xs text-[#8B93B8] md:block">Based on current usage and growth trend</span>
      </div>
      <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#8B93B8]/20 bg-white/20 px-4 text-base text-[#8B93B8] transition-colors hover:bg-white">
        <Image src="/roi-dashboard/download.svg" alt="" width={20} height={20} unoptimized className="size-5" />Download ROI Report
      </button>
    </section>
  );
}
