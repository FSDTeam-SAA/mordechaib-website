"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarX2, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

type UpcomingMeeting = {
  id: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  timezone: string;
};

type UpcomingMeetingsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items?: UpcomingMeeting[];
  };
};

const meetingAccents = ["bg-[#5B7FF0]", "bg-[#D24FC7]"] as const;

function messageOf(result: Pick<UpcomingMeetingsResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load upcoming meetings.";
}

function formatMeetingTime(startsAt: string, timezone: string) {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  try {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

function formatDuration(durationMinutes: number) {
  if (durationMinutes < 60) return `${durationMinutes}min`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes ? `${hours}hr ${minutes}min` : `${hours}hr`;
}

function UpcomingMeetingsSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading upcoming meetings"
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="h-7 w-44 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-28 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-2 py-1">
            <span className="w-1.5 rounded-full bg-[#F5F7FF]" />
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-[#F5F7FF]" />
              <div className="h-4 w-28 rounded bg-[#F5F7FF]" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-[52px] w-full animate-pulse rounded-lg bg-[#F5F7FF]" />
    </article>
  );
}

function UpcomingMeetingsState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : CalendarX2;

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader action="View Calendar" href="/dashboard/calendar">
        Upcoming Meetings
      </DashboardSectionHeader>
      <div className="flex min-h-[166px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError
            ? "Upcoming meetings could not be loaded"
            : "No upcoming meetings"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "There are no upcoming meetings scheduled yet."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-[#5B7FF0] px-4 text-sm font-medium text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        )}
      </div>
      <button className="mt-4 h-[52px] w-full rounded-lg bg-[#5B7FF0] text-sm font-medium text-white">
        Schedule Meeting
      </button>
    </article>
  );
}

export function UpcomingMeetingsCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const meetingsQuery = useQuery({
    queryKey: ["organizer-dashboard", "upcoming-meetings", 4],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/upcoming-meetings?limit=4`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as UpcomingMeetingsResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || meetingsQuery.isLoading) {
    return <UpcomingMeetingsSkeleton />;
  }

  if (meetingsQuery.isError) {
    return (
      <UpcomingMeetingsState
        error={
          meetingsQuery.error instanceof Error
            ? meetingsQuery.error.message
            : "Please try again."
        }
        onRetry={() => void meetingsQuery.refetch()}
      />
    );
  }

  const meetings = meetingsQuery.data?.items ?? [];
  if (!meetingsQuery.data || meetings.length === 0) {
    return <UpcomingMeetingsState />;
  }

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader action="View Calendar" href="/dashboard/calendar">
        Upcoming Meetings
      </DashboardSectionHeader>
      <div className="mt-4 space-y-2">
        {meetings.map((meeting, index) => (
          <div key={meeting.id} className="flex gap-2 py-1">
            <span
              className={`w-1.5 rounded-full ${meetingAccents[index % meetingAccents.length]}`}
            />
            <div>
              <p className="text-sm font-medium text-[#0E1224]">
                {meeting.title}
              </p>
              <p className="mt-1 text-sm text-[#8B93B8]">
                {formatMeetingTime(meeting.startsAt, meeting.timezone)}
                <span className="mx-3">•</span>
                {formatDuration(meeting.durationMinutes)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 h-[52px] w-full rounded-lg bg-[#5B7FF0] text-sm font-medium text-white">
        Schedule Meeting
      </button>
    </article>
  );
}
