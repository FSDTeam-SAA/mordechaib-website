import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCallDetailsSourceType, type CallRecord } from "./types";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-[#10B981]/10 text-[#10B981]",
  SCHEDULED: "bg-[#5B9CD5]/10 text-[#5B9CD5]",
  WAITING_ROOM: "bg-[#F59E0B]/10 text-[#F59E0B]",
  FAILED: "bg-[#EF4444]/10 text-[#EF4444]",
  CANCELLED: "bg-[#EF4444]/10 text-[#EF4444]",
};
const label = (value: string) =>
  value
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function CallHistoryTable({ calls, timezone }: { calls: CallRecord[]; timezone: string }) {
  return <section className="mt-4 overflow-hidden rounded-lg bg-white" aria-label="Call history"><div className="overflow-x-auto"><table className="w-full min-w-[980px] table-fixed"><thead><tr className="h-[52px] border-b border-[#E4EAF8] text-left text-base text-[#141936]"><th className="w-[18%] px-4 font-normal">Date</th><th className="w-[25%] px-4 font-normal">Title</th><th className="w-[16%] px-4 text-center font-normal">Platform</th><th className="w-[13%] px-4 text-center font-normal">Type</th><th className="w-[17%] px-4 text-center font-normal">Status</th><th className="w-[11%] px-4 text-center font-normal">Action</th></tr></thead><tbody>{calls.map((call) => {
    const occurredAt = new Date(call.occurredAt);
    const detailsSourceType = getCallDetailsSourceType(call.kind, call.source.type || call.platform);
    const detailsHref = `/dashboard/call-intelligence/${encodeURIComponent(call.sourceId)}?sourceType=${encodeURIComponent(detailsSourceType)}`;
    return <tr key={`${call.source.type}-${call.sourceId}`} className="h-[72px] border-b border-[#E4EAF8]/50 text-sm text-[#141936] last:border-0 hover:bg-[#FAFBFF]"><td className="px-4"><span className="block">{occurredAt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", timeZone: timezone })}</span><span className="mt-1.5 block text-xs text-[#8B93B8]">{occurredAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone })} · {Math.round(call.durationSeconds / 60)} min</span></td><td className="px-4"><p className="truncate font-medium" title={call.title}>{call.title}</p><p className="mt-1.5 truncate text-xs text-[#8B93B8]">{call.botName || "No bot assigned"}</p></td><td className="px-4 text-center">{label(call.platform)}</td><td className="px-4 text-center">{label(call.kind)}</td><td className="px-4 text-center"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[call.status] || "bg-[#8B93B8]/10 text-[#64748B]")}>{label(call.status)}</span></td><td className="px-4 text-center"><Link href={detailsHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#5B7FF0] bg-[#5B9CD5]/10 px-3 text-[10px] text-[#5B7FF0] transition hover:bg-[#5B7FF0]/15"><Eye className="size-4" strokeWidth={1.6} /><span className="underline">Details</span></Link></td></tr>;
  })}</tbody></table>{calls.length === 0 && <div className="flex h-40 items-center justify-center text-sm text-[#8B93B8]">No call intelligence records found.</div>}</div></section>;
}
