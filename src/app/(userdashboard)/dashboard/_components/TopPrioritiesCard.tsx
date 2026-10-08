"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ListTodo, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

type PriorityTask = {
  id: string;
  title: string;
  department: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  isOverdue: boolean;
  proposedByAgent?: {
    name: string;
    type: string;
  } | null;
};

type TopPrioritiesResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items?: PriorityTask[];
  };
};

function messageOf(result: Pick<TopPrioritiesResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load top priorities.";
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function taskOwner(task: PriorityTask) {
  if (task.proposedByAgent) {
    return `${task.proposedByAgent.name} (${formatLabel(task.proposedByAgent.type)})`;
  }

  return formatLabel(task.department);
}

function TopPrioritiesSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading top priorities"
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="h-7 w-32 animate-pulse rounded bg-[#F5F7FF]" />
        <div className="h-5 w-16 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-2">
            <div className="size-5 shrink-0 rounded-full bg-[#F5F7FF]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-full rounded bg-[#F5F7FF]" />
              <div className="h-5 w-32 rounded bg-[#F5F7FF]" />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function TopPrioritiesState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : ListTodo;

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader>Top Priorities</DashboardSectionHeader>
      <div className="flex min-h-[214px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError
            ? "Top priorities could not be loaded"
            : "No top priorities found"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "Your highest-priority tasks will appear here."}
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

export function TopPrioritiesCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const prioritiesQuery = useQuery({
    queryKey: ["organizer-dashboard", "top-priorities", 4],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/top-priorities?limit=4`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TopPrioritiesResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || prioritiesQuery.isLoading) {
    return <TopPrioritiesSkeleton />;
  }

  if (prioritiesQuery.isError) {
    return (
      <TopPrioritiesState
        error={
          prioritiesQuery.error instanceof Error
            ? prioritiesQuery.error.message
            : "Please try again."
        }
        onRetry={() => void prioritiesQuery.refetch()}
      />
    );
  }

  const priorities = prioritiesQuery.data?.items ?? [];
  if (!prioritiesQuery.data || priorities.length === 0) {
    return <TopPrioritiesState />;
  }

  return (
    <article className="rounded-2xl bg-white p-6">
      <DashboardSectionHeader>Top Priorities</DashboardSectionHeader>
      <div className="mt-4 space-y-4">
        {priorities.map((task) => {
          const isCompleted = task.status === "COMPLETED";
          const isHighPriority = task.priority === "HIGH";

          return (
            <div key={task.id} className="flex gap-2">
              <span
                className={`size-5 shrink-0 rounded-full border-2 ${isCompleted ? "border-[#10B981] bg-[#10B981]/10" : "border-[#8B93B8]"}`}
              />
              <div className="min-w-0">
                <p
                  className={
                    isCompleted
                      ? "truncate text-sm text-[#8B93B8] line-through"
                      : "truncate text-sm font-medium text-[#0E1224]"
                  }
                >
                  {task.title}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-[#8B93B8]">
                  <span
                    className={`size-1.5 rounded ${isHighPriority ? "bg-[#EF4444]" : "bg-[#8B93B8]"}`}
                  />
                  {taskOwner(task)}
                  <span
                    className={`rounded-full px-2 py-1 ${isHighPriority ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#E4EAF8]"}`}
                  >
                    {formatLabel(task.priority)}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
