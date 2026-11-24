import Image from "next/image";
import type { CalendarDashboard } from "./types";

const cards = [["total", "Total Meetings", "/calendar/total.svg", "/calendar/total-chart.svg", "bg-[#5B9CD5]/10"], ["scheduled", "Scheduled", "/calendar/pending.svg", "/calendar/pending-chart.svg", "bg-[#F59E0B]/10"], ["completed", "Completed Meetings", "/calendar/confirmed.svg", "/calendar/confirmed-chart.svg", "bg-[#10B981]/10"], ["cancelled", "Cancelled Meetings", "/calendar/cancelled.svg", "/calendar/cancelled-chart.svg", "bg-[#EF4444]/10"]] as const;

export function CalendarStats({ summary }: { summary: CalendarDashboard["summary"] }) {
  return <section className="grid gap-3 sm:grid-cols-2 min-[1200px]:grid-cols-4">{cards.map(([key,label,icon,chart,tint]) => <article key={key} className="relative min-h-28 overflow-hidden rounded-[8px] bg-white p-3"><span className={`flex size-10 items-center justify-center rounded-[12px] ${tint}`}><Image src={icon} alt="" width={20} height={20} className="size-5" /></span><div className="relative z-10 mt-2 pr-[66px] 2xl:pr-[86px]"><p className="text-lg font-bold leading-normal text-[#0E1224]">{summary[key]}</p><p className="text-xs text-[#8B93B8]">{label}</p></div><Image src={chart} alt="" width={108} height={65} className="absolute bottom-4 right-4 h-10 w-[66px] 2xl:h-[52px] 2xl:w-[86px]" /></article>)}</section>;
}
