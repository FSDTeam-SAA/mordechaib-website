"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, RefreshCw, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

type WorkforceAgent = {
  id: string;
  name: string;
  imageUrl: string | null;
  type: string;
  status: string;
  runtimeStatus: string;
};

type WorkforceResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items?: WorkforceAgent[];
    total?: number;
  };
};

function messageOf(result: Pick<WorkforceResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load AI workforce.";
}

function roleLabel(type: string) {
  const role = type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${role} Agent`;
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function AiWorkforceCardSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading AI workforce"
      className="rounded-2xl bg-white p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-[#F5F7FF]" />
          <div className="mt-2 h-4 w-52 animate-pulse rounded bg-[#F5F7FF]" />
        </div>
        <div className="h-5 w-24 animate-pulse rounded bg-[#F5F7FF]" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-2">
            <div className="size-[60px] shrink-0 rounded-[12px] bg-[#F5F7FF]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-16 rounded bg-[#F5F7FF]" />
              <div className="h-3 w-20 rounded bg-[#F5F7FF]" />
              <div className="h-5 w-14 rounded-full bg-[#F5F7FF]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AiWorkforceCardState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : UsersRound;

  return (
    <section className="rounded-2xl bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#0E1224]">Ai Workforce</h2>
          <p className="mt-1 text-sm text-[#8B93B8]">
            Your specialist AI agents working.
          </p>
        </div>
        <Link
          href="/dashboard/agents"
          className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]"
        >
          View all agents
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="flex min-h-[104px] flex-col items-center justify-center text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError ? "AI workforce could not be loaded" : "No AI agents found"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "There are no AI agents available for this workspace yet."}
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
    </section>
  );
}

export function AiWorkforceCard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const workforceQuery = useQuery({
    queryKey: ["organizer-dashboard", "workforce", 1, 20, 24],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        activityHours: "24",
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/workforce?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as WorkforceResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || workforceQuery.isLoading) {
    return <AiWorkforceCardSkeleton />;
  }

  if (workforceQuery.isError) {
    return (
      <AiWorkforceCardState
        error={
          workforceQuery.error instanceof Error
            ? workforceQuery.error.message
            : "Please try again."
        }
        onRetry={() => void workforceQuery.refetch()}
      />
    );
  }

  const agents = workforceQuery.data?.items ?? [];
  if (!workforceQuery.data || agents.length === 0) {
    return <AiWorkforceCardState />;
  }

  return (
    <section className="rounded-2xl bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#0E1224]">Ai Workforce</h2>
          <p className="mt-1 text-sm text-[#8B93B8]">
            Your specialist AI agents working.
          </p>
        </div>
        <Link
          href="/dashboard/agents"
          className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]"
        >
          View all agents
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {agents?.slice(0,6)?.map((agent) => {
          const isActive =
            agent.runtimeStatus === "ACTIVE" ||
            agent.runtimeStatus === "WORKING";

          return (
            <div key={agent.id} className="flex items-center gap-2">
              <Image
                src={agent?.imageUrl || "/images/no-user.jpeg"}
                alt={`${agent.name} profile`}
                width={60}
                height={60}
                unoptimized
                className="size-[60px] shrink-0 rounded-[12px] object-cover"
              />
              <div className="min-w-0">
                <p className="font-medium text-[#0E1224]">{agent.name}</p>
                <p className="truncate text-xs text-[#8B93B8]">
                  {roleLabel(agent.type)}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#8B93B8]/10 text-[#8B93B8]"}`}
                >
                  {statusLabel(agent.runtimeStatus)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
