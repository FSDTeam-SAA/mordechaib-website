"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

type BriefingSection = {
  id: string;
  title?: string;
  availability?: "AVAILABLE" | "UNAVAILABLE";
  summary?: string;
};

type TodayBriefing = {
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  content?: {
    sections?: BriefingSection[];
  };
};

type TodayBriefingResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    availability?: "AVAILABLE" | "UNAVAILABLE";
    briefing?: TodayBriefing | null;
    reason?: string;
  };
};

const sectionAccents = [
  "bg-[#10B981]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
  "bg-[#10B981]",
  "bg-[#8B93B8]",
] as const;

function messageOf(result: Pick<TodayBriefingResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load today's executive briefing.";
}

function formatSectionTitle(section: BriefingSection) {
  if (section.title) return section.title;

  return section.id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatGeneratedTime(briefing: TodayBriefing) {
  const timestamp =
    briefing.completedAt ?? briefing.updatedAt ?? briefing.createdAt;
  if (!timestamp) return "Today";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ExecutiveBriefingSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading today's executive briefing"
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="h-7 w-56 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-28 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-3">
            <div className="mt-1.5 size-2 rounded-full bg-[#F5F7FF]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-[#F5F7FF]" />
              <div className="h-3 w-28 rounded bg-[#F5F7FF]" />
            </div>
            <div className="h-3 w-16 rounded bg-[#F5F7FF]" />
          </div>
        ))}
      </div>
    </article>
  );
}

function ExecutiveBriefingState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : FileText;

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader action="View Full Briefing">
        Today&apos;s Executive Briefing
      </DashboardSectionHeader>
      <div className="flex min-h-[232px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError
            ? "Executive briefing could not be loaded"
            : "Today's briefing is not available yet"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "Your executive briefing has not been generated yet."}
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

export function ExecutiveBriefingCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const briefingQuery = useQuery({
    queryKey: ["organizer-dashboard", "today-briefing"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/today-briefing`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TodayBriefingResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || briefingQuery.isLoading) {
    return <ExecutiveBriefingSkeleton />;
  }

  if (briefingQuery.isError) {
    return (
      <ExecutiveBriefingState
        error={
          briefingQuery.error instanceof Error
            ? briefingQuery.error.message
            : "Please try again."
        }
        onRetry={() => void briefingQuery.refetch()}
      />
    );
  }

  const briefing = briefingQuery.data?.briefing;
  const sections = briefing?.content?.sections?.slice(0, 5) ?? [];
  if (
    briefingQuery.data?.availability !== "AVAILABLE" ||
    !briefing ||
    sections.length === 0
  ) {
    return <ExecutiveBriefingState />;
  }

  const generatedTime = formatGeneratedTime(briefing);

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader action="View Full Briefing">
        Today&apos;s Executive Briefing
      </DashboardSectionHeader>
      <div className="mt-4 space-y-5">
        {sections.map((section, index) => (
          <div key={section.id} className="flex gap-3">
            <span
              className={`mt-1.5 size-2 rounded-full ${sectionAccents[index % sectionAccents.length]}`}
            />
            <div className="flex-1">
              <div className="flex justify-between gap-3">
                <p className="text-sm font-medium text-[#0E1224]">
                  {formatSectionTitle(section)}
                </p>
                <span className="text-xs text-[#8B93B8]">
                  {section.availability === "UNAVAILABLE"
                    ? "Unavailable"
                    : "Available"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[#8B93B8]">
                {section.summary || generatedTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
