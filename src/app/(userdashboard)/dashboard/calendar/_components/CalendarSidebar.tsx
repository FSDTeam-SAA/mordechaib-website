import { CalendarDays, RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewMeetingModal } from "./NewMeetingModal";
import type { CalendarMeeting } from "./types";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function color(status: string) {
  return status === "COMPLETED"
    ? "#10B981"
    : status === "FAILED"
      ? "#D24FC7"
      : status === "CANCELLED"
        ? "#EF4444"
        : "#5B9CD5";
}
function meetingTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CalendarSidebar({
  meetings,
  upcoming,
  selectedDate,
  onRefresh,
  isRefreshing,
}: {
  meetings: CalendarMeeting[];
  upcoming: CalendarMeeting[];
  selectedDate: Date;
  timezone: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const selectedEvents = meetings.filter((meeting) =>
    sameDay(new Date(meeting.startsAt), selectedDate),
  );
  const nextMeeting =
    upcoming[0] ||
    meetings
      .filter((meeting) => new Date(meeting.startsAt) > new Date())
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
  const providers = Object.entries(
    meetings.reduce<Record<string, number>>((result, meeting) => {
      const key = meeting.provider?.replaceAll("_", " ") || "Others";
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const total = meetings.length || 1;

  return (
    <aside className="space-y-4">
      <section className="rounded-[8px] bg-white p-2.5">
        <h2 className="border-b border-[#E4EAF8] pb-2.5 text-[0.9375rem]/[1.5rem] font-medium">
          Quick Actions
        </h2>
        <div className="mt-2.5 space-y-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-full items-center gap-2 rounded-[8px] bg-[#F5F7FF] px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Syncing Calendar..." : "Sync Calendar"}
          </button>
          <NewMeetingModal>
            <button className="flex h-8 w-full items-center gap-2 rounded-[8px] bg-[#F5F7FF] px-2.5 text-xs">
              <CalendarDays className="size-4" />
              Schedule Meeting
            </button>
          </NewMeetingModal>
        </div>
      </section>
      <section className="rounded-[8px] bg-white p-2.5">
        <h2 className="text-[0.9375rem]/[1.5rem] font-medium">
          {selectedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <p className="mt-1 text-xs text-[#8B93B8]">
          {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
        </p>
        <div className="mt-3.5 max-h-[280px] space-y-2 overflow-y-auto">
          {selectedEvents.length === 0 ? (
            <p className="py-2.5 text-sm text-[#8B93B8]">No events on this day</p>
          ) : (
            selectedEvents.map((meeting) => (
              <div
                key={meeting.id}
                className="border-l-4 p-2.5"
                style={{
                  borderColor: color(meeting.status),
                  backgroundColor: `${color(meeting.status)}12`,
                }}
              >
                <p className="truncate text-sm font-medium">{meeting.title}</p>
                <p className="mt-2 text-sm text-[#8B93B8]">
                  {meetingTime(meeting.startsAt)}
                  <span className="mx-2.5">•</span>
                  {meeting.durationMinutes}min
                </p>
                <p className="mt-2 flex items-center gap-4 truncate text-sm text-[#8B93B8]">
                  <Users className="size-5 shrink-0" />
                  {meeting.participantEmails[0] || "No participants"}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="mt-3.5 border-t border-[#E4EAF8] pt-3.5">
          <h3 className="text-[1.1875rem]/[1.75rem] text-[#8B93B8]">Upcoming</h3>
          {nextMeeting ? (
            <div className="mt-2.5 border-l-[6px] border-[#D24FC7] pl-2">
              <p className="truncate text-sm font-medium">
                {nextMeeting.title}
              </p>
              <p className="mt-2 text-sm text-[#8B93B8]">
                {new Date(nextMeeting.startsAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {meetingTime(nextMeeting.startsAt)}
              </p>
            </div>
          ) : (
            <p className="mt-2.5 text-sm text-[#8B93B8]">No upcoming meetings</p>
          )}
        </div>
      </section>
      <section className="rounded-[8px] bg-white p-2.5">
        <h2 className="border-b border-[#E4EAF8] pb-2.5 text-[0.9375rem]/[1.5rem] font-medium">
          Meeting Types
        </h2>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[60px] bg-[conic-gradient(#EF4444_0deg_50deg,#F59E0B_50deg_137deg,#10B981_137deg_360deg)]">
            <div className="size-[72px] rounded-[36px] bg-white" />
          </div>
          <div className="space-y-3 text-xs">
            {providers.length === 0 ? (
              <p className="text-[#8B93B8]">No meeting types</p>
            ) : (
              providers.map(([provider, count], index) => (
                <p key={provider}>
                  <i
                    className={cn(
                      "mr-1 inline-block size-2 rounded-[4px]",
                      index === 0
                        ? "bg-[#EF4444]"
                        : index === 1
                          ? "bg-[#F59E0B]"
                          : "bg-[#10B981]",
                    )}
                  />
                  {provider} ({count}) {Math.round((count / total) * 100)}%
                </p>
              ))
            )}
          </div>
        </div>
      </section>
    </aside>
  );
}
