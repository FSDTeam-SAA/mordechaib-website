"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

type TaskCounts = {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  pending: number;
};

type TaskOverviewResponse = {
  success?: boolean;
  message?: string | string[];
  data?: TaskCounts;
};

const taskSegments = [
  { key: "overdue", label: "Overdue", color: "#EF4444" },
  { key: "inProgress", label: "In Progress", color: "#264AFF" },
  { key: "completed", label: "Completed", color: "#10B981" },
  { key: "pending", label: "Pending", color: "#F59E0B" },
] as const;

function messageOf(result: Pick<TaskOverviewResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load task overview.";
}

function donutBackground(counts: TaskCounts) {
  if (counts.total <= 0) {
    return "conic-gradient(#F5F7FF 0deg 360deg)";
  }

  let degrees = 0;
  const gradients = taskSegments.map((segment) => {
    const count = counts[segment.key];
    const nextDegrees = degrees + (count / counts.total) * 360;
    const gradient = `${segment.color} ${degrees}deg ${nextDegrees}deg`;
    degrees = nextDegrees;
    return gradient;
  });

  return `conic-gradient(${gradients.join(", ")})`;
}

function TaskOverviewSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading task overview"
      className="min-w-0 overflow-hidden rounded-2xl bg-white p-3 sm:p-4"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-2">
        <div className="h-7 w-36 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-16 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3">
        <div className="size-28 shrink-0 animate-pulse rounded-full bg-[#F5F7FF]" />
        <div className="min-w-28 flex-1 space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-4 w-full animate-pulse rounded bg-[#F5F7FF]"
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function TaskOverviewState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : ClipboardList;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-3 sm:p-4">
      <DashboardSectionHeader compact href="/dashboard/tasks">
        Task Overview
      </DashboardSectionHeader>
      <div className="flex min-h-28 w-full flex-col items-center justify-center px-1 py-3 text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 max-w-full break-words text-[13px] font-medium text-[#0E1224]">
          {isError ? "Task overview could not be loaded" : "No tasks found"}
        </p>
        <p className="mt-1 max-w-full break-words text-sm text-[#8B93B8]">
          {error || "Your task overview will appear here."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3.5 flex min-h-11 items-center gap-2 rounded-lg bg-[#5B7FF0] px-3.5 text-sm font-medium text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        )}
      </div>
    </article>
  );
}

export function TaskOverviewCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const taskOverviewQuery = useQuery({
    queryKey: ["organizer-dashboard", "task-overview"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/task-overview`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TaskOverviewResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(messageOf(result));
      }

      return result.data;
    },
  });

  if (sessionStatus === "loading" || taskOverviewQuery.isLoading) {
    return <TaskOverviewSkeleton />;
  }

  if (taskOverviewQuery.isError) {
    return (
      <TaskOverviewState
        error={
          taskOverviewQuery.error instanceof Error
            ? taskOverviewQuery.error.message
            : "Please try again."
        }
        onRetry={() => void taskOverviewQuery.refetch()}
      />
    );
  }

  const counts = taskOverviewQuery.data;
  if (!counts || counts.total === 0) {
    return <TaskOverviewState />;
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-3 sm:p-4">
      <DashboardSectionHeader compact href="/dashboard/tasks">
        Task Overview
      </DashboardSectionHeader>
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3">
        <div
          className="relative flex size-28 shrink-0 items-center justify-center rounded-full"
          style={{ background: donutBackground(counts) }}
        >
          <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-[1.1875rem]/[1.75rem] font-medium text-[#0E1224]">
              {counts.total}
            </strong>
            <span className="text-xs text-[#0E1224]">Total tasks</span>
          </div>
        </div>
        <div className="min-w-28 flex-1 space-y-2 text-xs text-[#0E1224]">
          {taskSegments.map((segment) => (
            <p
              key={segment.key}
              className="flex items-baseline gap-2"
            >
              <span
                className="size-2 shrink-0 self-center rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {counts[segment.key]} {segment.label}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
