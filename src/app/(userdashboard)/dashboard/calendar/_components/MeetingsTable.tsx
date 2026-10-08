"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, ExternalLink, Eye, Mail, Users, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CalendarMeeting } from "./types";

const tabs = ["All", "Completed", "Scheduled", "Cancel"] as const;
const tabStatus: Record<(typeof tabs)[number], string> = { All: "", Completed: "COMPLETED", Scheduled: "SCHEDULED", Cancel: "CANCELLED" };
const statusClass: Record<string, string> = { COMPLETED: "bg-[#10B981]/10 text-[#10B981]", CANCELLED: "bg-[#EF4444]/10 text-[#EF4444]", FAILED: "bg-[#D24FC7]/10 text-[#D24FC7]", SCHEDULED: "bg-[#5B9CD5]/10 text-[#5B9CD5]" };

function statusLabel(status: string) {
  return status === "CANCELLED" ? "Cancel" : status.charAt(0) + status.slice(1).toLowerCase();
}

function meetingDate(value: string, timezone: string) {
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", timeZone: timezone });
}

function meetingTime(value: string, timezone: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone });
}

export function MeetingsTable({ meetings, timezone }: { meetings: CalendarMeeting[]; timezone: string }) {
  const [filter, setFilter] = useState<(typeof tabs)[number]>("All");
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarMeeting | null>(null);
  const rows = useMemo(() => !tabStatus[filter] ? meetings : meetings.filter((item) => item.status === tabStatus[filter]), [meetings, filter]);

  return <section>
    <div className="mb-4 flex max-w-[480px] overflow-x-auto rounded-[8px] bg-white p-2">{tabs.map((item) => <button key={item} onClick={() => setFilter(item)} className={cn("min-w-[110px] rounded-[6px] px-2 py-1 text-base", filter === item ? "bg-[#5B7FF0] text-white" : "text-[#0E1224]")}>{item}</button>)}</div>
    <div className="overflow-x-auto rounded-[8px] bg-white">
      <table className="w-full min-w-[900px] table-fixed text-sm">
        <colgroup><col className="w-[17%]" /><col className="w-[30%]" /><col className="w-[28%]" /><col className="w-[15%]" /><col className="w-[10%]" /></colgroup>
        <thead><tr className="border-b border-[#E4EAF8] text-left text-[#0E1224]"><th className="h-[52px] px-5 font-normal">Date</th><th className="h-[52px] px-5 font-normal">Meeting</th><th className="h-[52px] px-5 font-normal">Participant Email</th><th className="h-[52px] px-5 text-center font-normal">Status</th><th className="h-[52px] px-5 text-center font-normal">Action</th></tr></thead>
        <tbody>{rows.length === 0 ? <tr><td colSpan={5} className="h-32 text-center text-[#8B93B8]">No meetings found.</td></tr> : rows.map((row, index) => <tr key={row.id} className={cn("transition-colors hover:bg-[#F9FAFF]", index < rows.length - 1 && "border-b border-[#E4EAF8]/50")}>
          <td className="px-5 py-4 align-middle"><p className="font-medium">{meetingDate(row.startsAt, timezone)}</p><p className="mt-1.5 text-xs text-[#8B93B8]">{meetingTime(row.startsAt, timezone)} · {row.durationMinutes} min</p></td>
          <td className="px-5 py-4 align-middle"><p className="truncate font-medium text-[#0E1224]" title={row.title}>{row.title}</p><p className="mt-1.5 truncate text-xs text-[#8B93B8]">{row.provider?.replaceAll("_", " ") || "—"}</p></td>
          <td className="px-5 py-4 align-middle"><p className="truncate text-[#44506F]" title={row.participantEmails.join(", ")}>{row.participantEmails.join(", ") || "—"}</p><p className="mt-1.5 text-xs text-[#8B93B8]">{row.participantEmails.length} participant{row.participantEmails.length === 1 ? "" : "s"}</p></td>
          <td className="px-5 py-4 text-center align-middle"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusClass[row.status] || "bg-gray-100")}>{statusLabel(row.status)}</span></td>
          <td className="px-5 py-4 text-center align-middle"><button type="button" onClick={() => setSelectedMeeting(row)} aria-label={`View details for ${row.title}`} className="inline-flex size-9 items-center justify-center rounded-[9px] bg-[#5B7FF0]/10 text-[#5B7FF0] transition-all hover:bg-[#5B7FF0] hover:text-white hover:shadow-[0_4px_12px_rgba(91,127,240,0.3)]"><Eye className="size-[18px]" /></button></td>
        </tr>)}</tbody>
      </table>
    </div>

    <Dialog open={Boolean(selectedMeeting)} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
      <DialogContent overlayClassName="bg-[#0E1224]/35 backdrop-blur-[5px]" className="w-[calc(100%-24px)] max-w-[620px] gap-0 overflow-hidden rounded-[16px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)]">
        {selectedMeeting && <>
          <div className="border-b border-[#E4EAF8] px-6 py-5 pr-14"><div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#5B7FF0]/10 text-[#5B7FF0]"><Video className="size-5" /></span><div className="min-w-0"><DialogTitle className="truncate text-xl leading-7 text-[#0E1224]">{selectedMeeting.title}</DialogTitle><DialogDescription className="mt-1 text-sm text-[#8B93B8]">Meeting details and participant information</DialogDescription></div></div></div>
          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between gap-4"><span className="text-sm text-[#8B93B8]">Status</span><span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusClass[selectedMeeting.status] || "bg-gray-100")}>{statusLabel(selectedMeeting.status)}</span></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-[10px] bg-[#F5F7FF] p-3"><CalendarDays className="size-5 shrink-0 text-[#5B7FF0]" /><div><p className="text-xs text-[#8B93B8]">Date</p><p className="mt-0.5 text-sm font-medium">{meetingDate(selectedMeeting.startsAt, timezone)}</p></div></div><div className="flex items-center gap-3 rounded-[10px] bg-[#F5F7FF] p-3"><Clock3 className="size-5 shrink-0 text-[#5B7FF0]" /><div><p className="text-xs text-[#8B93B8]">Time &amp; duration</p><p className="mt-0.5 text-sm font-medium">{meetingTime(selectedMeeting.startsAt, timezone)} · {selectedMeeting.durationMinutes} min</p></div></div></div>
            <div><p className="mb-2 text-sm font-medium text-[#0E1224]">Description</p><p className="rounded-[10px] bg-[#F5F7FF] p-3 text-sm leading-6 text-[#44506F]">{selectedMeeting.description || "No description provided."}</p></div>
            <div><p className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0E1224]"><Users className="size-4 text-[#5B7FF0]" />Participants ({selectedMeeting.participantEmails.length})</p><div className="space-y-2">{selectedMeeting.participantEmails.length ? selectedMeeting.participantEmails.map((email) => <div key={email} className="flex items-center gap-2 rounded-[9px] bg-[#F5F7FF] px-3 py-2 text-sm text-[#44506F]"><Mail className="size-4 shrink-0 text-[#8B93B8]" /><span className="truncate">{email}</span></div>) : <p className="rounded-[9px] bg-[#F5F7FF] px-3 py-2 text-sm text-[#8B93B8]">No participants</p>}</div></div>
            <div className="flex flex-wrap gap-3 border-t border-[#E4EAF8] pt-5">{selectedMeeting.eventUrl && <a href={selectedMeeting.eventUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#5B7FF0] px-4 text-sm font-medium text-[#5B7FF0] hover:bg-[#5B7FF0]/5">Calendar Event <ExternalLink className="size-4" /></a>}{selectedMeeting.joinUrl && selectedMeeting.status !== "COMPLETED" && <a href={selectedMeeting.joinUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#5B7FF0] px-4 text-sm font-medium text-white hover:bg-[#4E6FDE]">Join Meeting <ExternalLink className="size-4" /></a>}</div>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  </section>;
}
