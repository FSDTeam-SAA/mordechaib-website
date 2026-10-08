import Link from "next/link";
import { ArrowRight, CalendarX2, RefreshCw } from "lucide-react";

export type UpcomingMeeting = {
  id: string;
  sourceType: string;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  status: string;
  platform: string;
  detailsPath: string;
};

const accents = ["bg-[#5B7FF0]", "bg-[#D24FC7]", "bg-[#10B981]", "bg-[#F59E0B]"];

export function UpcomingCalendarCard({ meetings, isError = false, onRetry }: { meetings: UpcomingMeeting[]; isError?: boolean; onRetry?: () => void }) {
  return <section className="rounded-xl bg-white p-6">
    <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4"><h2 className="text-xl font-medium text-[#0E1224]">Calendar (Upcoming)</h2><Link href="/dashboard/calendar" className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]">View All<ArrowRight className="size-4" /></Link></header>
    {isError ? <div className="flex min-h-[180px] flex-col items-center justify-center text-center"><CalendarX2 className="size-8 text-[#EF4444]" /><p className="mt-2 text-sm text-[#8B93B8]">Upcoming meetings could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#5B7FF0]"><RefreshCw className="size-4" />Try again</button></div> : meetings.length === 0 ? <div className="flex min-h-[180px] flex-col items-center justify-center text-center"><CalendarX2 className="size-8 text-[#8B93B8]" /><p className="mt-2 text-sm text-[#8B93B8]">No upcoming meetings.</p></div> : <div className="mt-4 max-h-[310px] space-y-4 overflow-y-auto pr-1 [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin]">{meetings.map((meeting, index) => { const startsAt = new Date(meeting.startsAt); return <div key={meeting.id} className="flex gap-2"><i className={`w-1.5 shrink-0 rounded-full ${accents[index % accents.length]}`} /><div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F5F7FF] text-xs uppercase text-[#8B93B8]"><span>{startsAt.toLocaleDateString("en-US", { month: "short", timeZone: meeting.timezone })}</span><strong className="text-sm text-[#0E1224]">{startsAt.toLocaleDateString("en-US", { day: "2-digit", timeZone: meeting.timezone })}</strong></div><div className="min-w-0 pt-1"><p className="truncate text-sm font-medium text-[#0E1224]" title={meeting.title}>{meeting.title}</p><p className="mt-1 text-sm text-[#8B93B8]">{startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: meeting.timezone })}<span className="mx-3">•</span>{meeting.durationMinutes} min</p><p className="mt-1 truncate text-[11px] text-[#A0A7C2]">{meeting.platform.replaceAll("_", " ")}</p></div></div>; })}</div>}
  </section>;
}
