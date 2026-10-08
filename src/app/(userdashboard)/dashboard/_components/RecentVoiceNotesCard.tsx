"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Mic, MicOff, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

type VoiceNote = {
  sourceId: string;
  title: string;
  kind: string;
  occurredAt: string;
  reviewStatus: string;
  agent: string | null;
  taskCount: number;
  meetingCount: number;
};

type RecentVoiceNotesResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items?: VoiceNote[];
    total?: number;
  };
};

function messageOf(result: Pick<RecentVoiceNotesResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load recent voice notes.";
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Recently";

  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");
  return relativeTime.format(Math.round(hours / 24), "day");
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function RecentVoiceNotesSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading recent voice notes"
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="h-7 w-40 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-16 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 space-y-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-2">
            <div className="size-6 shrink-0 rounded bg-[#F5F7FF]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-[#F5F7FF]" />
              <div className="h-3 w-36 rounded bg-[#F5F7FF]" />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecentVoiceNotesState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : MicOff;

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader>Recent Voice Notes</DashboardSectionHeader>
      <div className="flex min-h-[214px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError
            ? "Recent voice notes could not be loaded"
            : "No recent voice notes"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "Your recent voice notes will appear here."}
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
    </article>
  );
}

export function RecentVoiceNotesCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const voiceNotesQuery = useQuery({
    queryKey: ["organizer-dashboard", "recent-voice-notes", 4],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/recent-voice-notes?limit=4`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as RecentVoiceNotesResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || voiceNotesQuery.isLoading) {
    return <RecentVoiceNotesSkeleton />;
  }

  if (voiceNotesQuery.isError) {
    return (
      <RecentVoiceNotesState
        error={
          voiceNotesQuery.error instanceof Error
            ? voiceNotesQuery.error.message
            : "Please try again."
        }
        onRetry={() => void voiceNotesQuery.refetch()}
      />
    );
  }

  const voiceNotes = voiceNotesQuery.data?.items ?? [];
  if (!voiceNotesQuery.data || voiceNotes.length === 0) {
    return <RecentVoiceNotesState />;
  }

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader>Recent Voice Notes</DashboardSectionHeader>
      <div className="mt-4 space-y-5">
        {voiceNotes.map((voiceNote) => (
          <div key={voiceNote.sourceId} className="flex gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded bg-[#5B7FF0]/10 text-[#5B7FF0]">
              <Mic className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#0E1224]">
                {voiceNote.title}
              </p>
              <p className="mt-2 text-xs text-[#8B93B8]">
                {formatRelativeTime(voiceNote.occurredAt)} ·{" "}
                {voiceNote.agent || formatStatus(voiceNote.reviewStatus)} ·{" "}
                {voiceNote.taskCount} tasks
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
