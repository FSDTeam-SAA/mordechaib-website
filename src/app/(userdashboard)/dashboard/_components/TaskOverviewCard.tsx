"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, ClipboardList, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="h-7 w-36 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-16 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-7 sm:flex-row sm:justify-between">
        <div className="size-[170px] animate-pulse rounded-full bg-[#F5F7FF]" />
        <div className="w-full max-w-[126px] space-y-4">
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
    <article className="rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Task Overview</h2>
        <Link
          href="/dashboard/tasks"
          className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]"
        >
          View All
          <ArrowRight className="size-4" />
        </Link>
      </header>
      <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError ? "Task overview could not be loaded" : "No tasks found"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "Your task overview will appear here."}
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
    <article className="rounded-2xl bg-white p-6">
      <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Task Overview</h2>
        <Link
          href="/dashboard/tasks"
          className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]"
        >
          View All
          <ArrowRight className="size-4" />
        </Link>
      </header>
      <div className="mt-4 flex flex-col items-center justify-center gap-7 sm:flex-row sm:justify-between">
        <div
          className="relative flex size-[170px] shrink-0 items-center justify-center rounded-full"
          style={{ background: donutBackground(counts) }}
        >
          <div className="flex size-[110px] flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-xl font-medium text-[#0E1224]">
              {counts.total}
            </strong>
            <span className="text-xs text-[#0E1224]">Total tasks</span>
          </div>
        </div>
        <div className="w-full max-w-[126px] space-y-4 text-sm text-[#0E1224]">
          {taskSegments.map((segment) => (
            <p
              key={segment.key}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span
                className="size-2 shrink-0 rounded-full"
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
